// Tỷ giá USD/VND - cập nhật định kỳ hoặc lấy từ API
export const USD_TO_VND_RATE = 25000;

/**
 * Chuyển đổi giá từ USD (database) sang VND để hiển thị
 * @param {number} usdPrice - Giá USD từ database
 * @returns {number} - Giá VND
 */
export const convertUsdToVnd = (usdPrice) => {
  if (usdPrice == null || isNaN(usdPrice)) return 0;
  return usdPrice * USD_TO_VND_RATE;
};

/**
 * Chuyển đổi giá từ VND về USD (dùng khi gửi lên server/blockchain)
 * @param {number} vndPrice - Giá VND hiển thị
 * @returns {number} - Giá USD gốc
 */
export const convertVndToUsd = (vndPrice) => {
  if (vndPrice == null || isNaN(vndPrice)) return 0;
  return vndPrice / USD_TO_VND_RATE;
};

/**
 * Format giá tiền VND từ giá USD trong database
 * @param {number} v - Giá USD từ database
 * @returns {string} - Chuỗi định dạng VND (ví dụ: 6.025.000 ₫)
 */
export const formatCurrency = (v) => {
  if (v == null) return "";
  // Chuyển đổi từ USD sang VND trước khi format
  const vndPrice = convertUsdToVnd(v);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vndPrice);
};

/**
 * Format giá tiền USD (không chuyển đổi, dùng cho blockchain/payment)
 * @param {number} v - Giá USD
 * @returns {string} - Chuỗi định dạng USD (ví dụ: $241.00)
 */
export const formatUsd = (v) => {
  if (v == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
};

export const discountPercent = (product) => {
  if (!product || !product.price || !product.discount_price) return null;
  return Math.round(
    ((product.price - product.discount_price) / product.price) * 100
  );
};
