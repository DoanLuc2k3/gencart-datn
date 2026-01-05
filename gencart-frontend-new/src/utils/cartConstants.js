import { USD_TO_VND_RATE, convertUsdToVnd } from './format';

// Constants for cart calculations (giá trị được lưu trong database là USD)
// Các hằng số này là giá trị USD, sẽ được convert sang VND khi hiển thị
export const CART_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD: 4, // $4 USD = 100,000 VND - Miễn phí ship cho đơn trên 100k VND
  SHIPPING_FEE: 1.2, // $1.2 USD = 30,000 VND - Phí ship hợp lý
  TAX_RATE: 0, // Set to 0 to disable tax, or 0.18 for 18%
  USD_TO_VND_RATE: USD_TO_VND_RATE, // Re-export tỷ giá
};

// Calculate shipping fee (input: USD amount from database)
export const calculateShippingFee = (subtotal) => {
  return subtotal >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD ? 0 : CART_CONSTANTS.SHIPPING_FEE;
};

// Calculate tax (input: USD amount)
export const calculateTax = (subtotal) => {
  return subtotal * CART_CONSTANTS.TAX_RATE;
};

// Calculate total (input: USD amount, output: USD amount)
export const calculateTotal = (subtotal) => {
  const shipping = calculateShippingFee(subtotal);
  const tax = calculateTax(subtotal);
  return subtotal + shipping + tax;
};

// Format giá VND từ giá USD (để hiển thị)
export const formatPriceVND = (usdAmount) => {
  if (usdAmount == null) return "";
  const vndAmount = convertUsdToVnd(usdAmount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vndAmount);
};

// Format giá VND đã convert sẵn (không cần convert lại)
export const formatVNDAmount = (vndAmount) => {
  if (vndAmount == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vndAmount);
};

// Lấy giá trị VND của FREE_SHIPPING_THRESHOLD để hiển thị
export const getFreeShippingThresholdVND = () => {
  return convertUsdToVnd(CART_CONSTANTS.FREE_SHIPPING_THRESHOLD);
};

// Lấy giá trị VND của SHIPPING_FEE để hiển thị
export const getShippingFeeVND = () => {
  return convertUsdToVnd(CART_CONSTANTS.SHIPPING_FEE);
};