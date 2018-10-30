import Product from '@vue-storefront/store/types/product/Product'

export const CompareProduct = {
  name: 'CompareProduct',
  computed: {
    isOnCompare () : boolean {
      return !!this.$store.state.compare.items.find(p => p.sku === this.product.sku)
    }
  },
  methods: {
    addToCompare (product: Product) {
      return this.$store.state['compare']
        ? this.$store.dispatch('compare/addItem', product)
        : false
    },
    removeFromCompare (product: Product) {
      return this.$store.state['compare']
        ? this.$store.dispatch('compare/removeItem', product)
        : false
    }
  }
}
