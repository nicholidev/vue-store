import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import * as types from './mutation-types'
import omit from 'lodash-es/omit'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { ActionTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import OrderState from '../types/OrderState'
import { Order } from '../types/Order'
import { isOnline } from '@vue-storefront/core/lib/search'
import i18n from '@vue-storefront/i18n'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import { sha3_224 } from 'js-sha3'
import { Logger } from '@vue-storefront/core/lib/logger'
import config from 'config'
import { orderHooksExecutors } from '../hooks'
const actions: ActionTree<OrderState, RootState> = {
  /**
   * Place order - send it to service worker queue
   * @param {Object} commit method
   * @param {Order} order order data to be send
   */
  async placeOrder ({ commit, getters, dispatch }, order: Order) {
    if (config.entities.optimize && config.entities.optimizeShoppingCart) {
      order.products = order.products.map(product => omit(product, ['configurable_options', 'configurable_children'])) as Order['products']
    }
    // Check if order is already processed/processing
    const currentOrderHash = sha3_224(JSON.stringify(order))
    const isAlreadyProcessed = getters.getSessionOrderHashes.includes(currentOrderHash)
    if (isAlreadyProcessed) return
    commit(types.ORDER_ADD_SESSION_ORDER_HASH, currentOrderHash)

    const storeView = currentStoreView()
    if (storeView.storeCode) {
      order.store_code = storeView.storeCode
    }

    EventBus.$emit('order-before-placed', { order: order })
    order = orderHooksExecutors.beforePlaceOrder(order)
    if (!config.orders.directBackendSync || !isOnline()) {
      commit(types.ORDER_PLACE_ORDER, order)
      EventBus.$emit('order-after-placed', { order: order })
      orderHooksExecutors.beforePlaceOrder({ order, task: { resultCode: 200 } })
      return {
        resultCode: 200
      }
    } else {
      EventBus.$emit('notification-progress-start', i18n.t('Processing order...'))
      try {
        const task: any = await TaskQueue.execute({ url: config.orders.endpoint, // sync the order
          payload: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(order)
          }
        })
        EventBus.$emit('notification-progress-stop')

        if (task.resultCode === 200) {
          order.transmited = true
          commit(types.ORDER_PLACE_ORDER, order) // archive this order but not trasmit it second time
          commit(types.ORDER_LAST_ORDER_WITH_CONFIRMATION, { order: order, confirmation: task.result })
          orderHooksExecutors.afterPlaceOrder({ order, task })
          EventBus.$emit('order-after-placed', { order: order, confirmation: task.result })

          return task
        } else if (task.resultCode === 400) {
          commit(types.ORDER_REMOVE_SESSION_ORDER_HASH, currentOrderHash)

          Logger.error('Internal validation error; Order entity is not compliant with the schema: ' + JSON.stringify(task.result), 'orders')()
          dispatch('notification/spawnNotification', {
            type: 'error',
            message: i18n.t('Internal validation error. Please check if all required fields are filled in. Please contact us on {email}', { email: config.mailer.contactAddress }),
            action1: { label: i18n.t('OK') }
          }, {root: true})

          order.transmited = true // we don't want to enqueue it
          commit(types.ORDER_PLACE_ORDER, order) // archive this order but not trasmit it second time

          return task
        }

        throw new Error('Unhandled place order request error')
      } catch (e) { // it is assummed that this is probably network/server side issue
        commit(types.ORDER_REMOVE_SESSION_ORDER_HASH, currentOrderHash)

        dispatch('notification/spawnNotification', {
          type: 'error',
          message: i18n.t('The order can not be transfered because of server error. Order has been queued'),
          action1: { label: i18n.t('OK') }
        }, {root: true})

        order.transmited = false // enqueue order
        commit(types.ORDER_PLACE_ORDER, order) // archive this order and trasmit it next time the QUEUE is published

        EventBus.$emit('notification-progress-stop')

        throw e
      }
    }
  }
}

export default actions
