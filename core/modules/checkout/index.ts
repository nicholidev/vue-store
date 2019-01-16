import { checkoutModule } from './store/checkout'
import { paymentModule } from './store/payment'
import { shippingModule } from './store/shipping'
import { beforeRegistration } from './hooks/beforeRegistration'
import { afterRegistration } from './hooks/afterRegistration'

import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'

export const KEY = 'checkout'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  store: { modules: [
    { key: 'shipping', module: shippingModule },
    { key: 'payment', module: paymentModule },
    { key: 'checkout', module: checkoutModule },
  ] },
  beforeRegistration,
  afterRegistration
}

export const Checkout = new VueStorefrontModule(moduleConfig)
