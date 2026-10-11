// Cart endpoints return Cart entities, with product details nested under `product`.
// Keep the fallbacks for older API responses that returned flattened cart fields.
import { getProductImage } from './productImages';

export const cartProduct = (item) => item?.product ?? item ?? {};

export const cartItemPrice = (item) => {
  const price = Number(cartProduct(item)?.price ?? item?.price);
  return Number.isFinite(price) ? price : 0;
};

export const cartItemQuantity = (item) => {
  const quantity = Number(item?.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
};

export const cartItemName = (item) =>
  cartProduct(item)?.name ?? item?.productName ?? 'Handcrafted item';

export const cartItemImage = (item) => {
  return getProductImage(cartProduct(item)) ?? item?.productImage ?? null;
};
