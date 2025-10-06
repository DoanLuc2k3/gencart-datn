import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../components/constants/constants";

/**
 * Get category name from product
 * @param {Object} product - Product object
 * @returns {string} Category name
 */
export const getCategoryName = (product) =>
  (product?.category && product.category.name) || "Product";

/**
 * Get category color by name
 * @param {string} categoryName - Category name
 * @returns {string} Color hex code
 */
export const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName]?.primary || DEFAULT_CATEGORY_COLOR.primary;
};

/**
 * Get category gradient by name
 * @param {string} categoryName - Category name
 * @returns {string} CSS gradient string
 */
export const getCategoryGradient = (categoryName) => {
  return CATEGORY_COLORS[categoryName]?.gradient || DEFAULT_CATEGORY_COLOR.gradient;
};

/**
 * Get product image URL or placeholder
 * @param {Object} product - Product object
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Image URL
 */
export const getProductImage = (product, width = 600, height = 400) => {
  if (product.image_url) return product.image_url;
  const categoryName = getCategoryName(product);
  const color = getCategoryColor(categoryName).replace("#", "");
  return `https://placehold.co/${width}x${height}/${color}/FFFFFF?text=${encodeURIComponent(
    categoryName
  )}`;
};

/**
 * Handle image error by creating a canvas fallback
 * @param {Event} e - Image error event
 * @param {string} productName - Product name for fallback
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export const handleImageError = (e, productName, width = 300, height = 200) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(productName || "Product", width / 2, height / 2);
  
  e.target.src = canvas.toDataURL();
};

/**
 * Check if product has discount
 * @param {Object} product - Product object
 * @returns {boolean} True if product has discount
 */
export const hasDiscount = (product) => {
  return (
    product.discount_price &&
    parseFloat(product.discount_price) < parseFloat(product.price)
  );
};

/**
 * Calculate discount percentage
 * @param {Object} product - Product object
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (product) => {
  if (!hasDiscount(product)) return 0;
  return Math.round(
    (1 - parseFloat(product.discount_price) / parseFloat(product.price)) * 100
  );
};

/**
 * Get product price (with or without discount)
 * @param {Object} product - Product object
 * @returns {number} Product price
 */
export const getProductPrice = (product) => {
  return parseFloat(
    hasDiscount(product) ? product.discount_price : product.price
  );
};

/**
 * Generate product rating (placeholder for demo)
 * @param {Object} product - Product object
 * @returns {string} Rating value
 */
export const getProductRating = (product) => {
  return (
    product.average_rating ||
    (Math.round(((product.id % 5) + 3) * 10) / 10).toFixed(1)
  );
};

/**
 * Generate review count (placeholder for demo)
 * @param {Object} product - Product object
 * @returns {number} Review count
 */
export const getReviewCount = (product) => {
  return product.review_count || ((product.id * 13) % 160) + 20;
};

/**
 * Check if product is out of stock
 * @param {Object} product - Product object
 * @returns {boolean} True if out of stock
 */
export const isOutOfStock = (product) => {
  return product.inventory !== undefined && product.inventory <= 0;
};

/**
 * Filter discounted products
 * @param {Array} products - Array of products
 * @returns {Array} Filtered discounted products
 */
export const filterDiscountedProducts = (products) => {
  return products.filter((p) => hasDiscount(p));
};
