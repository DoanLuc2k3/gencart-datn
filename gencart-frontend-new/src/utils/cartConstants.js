// Constants for cart calculations
export const CART_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD: 999,
  SHIPPING_FEE: 50,
  TAX_RATE: 0, // Set to 0 to disable tax, or 0.18 for 18%
};

// Calculate shipping fee
export const calculateShippingFee = (subtotal) => {
  return subtotal >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD ? 0 : CART_CONSTANTS.SHIPPING_FEE;
};

// Calculate tax
export const calculateTax = (subtotal) => {
  return subtotal * CART_CONSTANTS.TAX_RATE;
};

// Calculate total
export const calculateTotal = (subtotal) => {
  const shipping = calculateShippingFee(subtotal);
  const tax = calculateTax(subtotal);
  return subtotal + shipping + tax;
};