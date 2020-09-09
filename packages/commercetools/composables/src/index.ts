/* istanbul ignore file */

import useCategory from './useCategory';
import useProduct from './useProduct';
import { setCart, useCart } from './useCart';
import useCheckout from './useCheckout';
import { setUser, useUser } from './useUser';
import useLocale from './useLocale';
import useUserOrders from './useUserOrders';
import { setWishlist, useWishlist } from './useWishlist';
import useReview from './useReview';
import { track } from '@vue-storefront/core';

import {
  cartGetters,
  categoryGetters,
  checkoutGetters,
  productGetters,
  reviewGetters,
  userGetters,
  orderGetters,
  wishlistGetters
} from './getters';

track('VSFCommercetools');

export {
  useCategory,
  useProduct,
  useCart,
  setCart,
  useCheckout,
  useUser,
  setUser,
  useLocale,
  useUserOrders,
  useWishlist,
  setWishlist,
  useReview,
  cartGetters,
  categoryGetters,
  checkoutGetters,
  productGetters,
  reviewGetters,
  userGetters,
  orderGetters,
  wishlistGetters
};

