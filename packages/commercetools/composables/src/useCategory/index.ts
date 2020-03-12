import { UseCategory } from '@vue-storefront/interfaces';
import { getCategory } from '@vue-storefront/commercetools-api';
import { Category } from './../types/GraphQL';
import { useCategoryFactory, UseCategoryFactoryParams } from '@vue-storefront/factories';

const params: UseCategoryFactoryParams<Category, any> = {
  categorySearch: async (params) => {
    const categoryResponse = await getCategory(params);
    return categoryResponse.data.categories.results;
  }
};

const useCategory: (id: string) => UseCategory<Category> = useCategoryFactory<Category, any>(params);

export default useCategory;
