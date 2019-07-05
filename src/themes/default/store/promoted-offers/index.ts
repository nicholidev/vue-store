import { Module } from 'vuex'
import { createModule } from '@vue-storefront/core/lib/module'
import { Logger } from '@vue-storefront/core/lib/logger'
import RootState from '@vue-storefront/core/types/RootState'
import PromotedOffersState from './types/PromotedOffersState'

const module: Module<PromotedOffersState, RootState> = {
  namespaced: true,
  state: {
    banners: {
      mainBanners: [],
      smallBanners: [],
      productBanners: []
    },
    headImage: null
  },
  getters: {
    getPromotedOffers: state => {
      return state.banners
    },
    getHeadImage: state => state.headImage
  },
  actions: {
    async updatePromotedOffers ({commit, rootState}, data) {
      let promotedBannersResource = rootState.storeView && rootState.storeView.storeCode ? `banners/${rootState.storeView.storeCode}_promoted_offers` : `promoted_offers`
      try {
        const promotedOffersModule = await import(/* webpackChunkName: "vsf-promoted-offers-[request]" */ `theme/resource/${promotedBannersResource}.json`)
        commit('updatePromotedOffers', promotedOffersModule)
      } catch (err) {
        Logger.debug('Unable to load promotedOffers' + err)()
      }
    },
    async updateHeadImage ({commit, rootState}, data) {
      let mainImageResource = rootState.storeView && rootState.storeView.storeCode ? `banners/${rootState.storeView.storeCode}_main-image` : `main-image`
      try {
        const imageModule = await import(/* webpackChunkName: "vsf-head-img-[request]" */ `theme/resource/${mainImageResource}.json`)
        commit('SET_HEAD_IMAGE', imageModule.image)
      } catch (err) {
        Logger.debug('Unable to load headImage' + err)()
      }
    }
  },
  mutations: {
    updatePromotedOffers (state, data) {
      state.banners = data
    },
    SET_HEAD_IMAGE (state, headImage) {
      state.headImage = headImage
    }
  }
}

const KEY = 'promoted'
export const PromotedOffers = createModule({
  key: KEY,
  store: { modules: [{ key: KEY, module }] }
})
