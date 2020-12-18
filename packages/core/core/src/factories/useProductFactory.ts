import { CustomQuery, ProductsSearchParams, UseProduct, Context, FactoryParams } from '../types';
import { Ref, computed } from '@vue/composition-api';
import { sharedRef, Logger, generateContext } from '../utils';

export interface ProductsSearchResult<PRODUCT> {
  data: PRODUCT[];
  total: number;
}

export interface UseProductFactoryParams<PRODUCT, PRODUCT_SEARCH_PARAMS extends ProductsSearchParams> extends FactoryParams {
  productsSearch: (context: Context, params: PRODUCT_SEARCH_PARAMS & { customQuery?: CustomQuery }) => Promise<ProductsSearchResult<PRODUCT>>;
}

export function useProductFactory<PRODUCT, PRODUCT_SEARCH_PARAMS>(
  factoryParams: UseProductFactoryParams<PRODUCT, PRODUCT_SEARCH_PARAMS>
) {
  return function useProduct(id: string): UseProduct<PRODUCT, PRODUCT_SEARCH_PARAMS> {
    const products: Ref<PRODUCT[]> = sharedRef([], `useProduct-products-${id}`);
    const totalProducts: Ref<number> = sharedRef(0, `useProduct-totalProducts-${id}`);
    const loading = sharedRef(false, `useProduct-loading-${id}`);
    const context = generateContext(factoryParams);

    const search = async (searchParams) => {
      Logger.debug('useProduct.search', searchParams);

      loading.value = true;
      try {
        const { data, total } = await factoryParams.productsSearch(context, searchParams);
        products.value = data;
        totalProducts.value = total;
      } catch (e) {
        Logger.error('useProduct.search', e);
        throw e;
      } finally {
        loading.value = false;
      }
    };

    return {
      search,
      products: computed(() => products.value),
      totalProducts: computed(() => totalProducts.value),
      loading: computed(() => loading.value)
    };
  };
}
