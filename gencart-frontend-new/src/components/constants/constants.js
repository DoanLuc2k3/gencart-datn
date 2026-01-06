import { API_BASE_URL } from '../../utils/api';
// Category Colors Mapping
export const CATEGORY_COLORS = {
  Electronics: {
    primary: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  },
  Clothing: {
    primary: "#10b981",
    gradient: "linear-gradient(135deg, #34d399, #10b981)",
  },
  "Home & Kitchen": {
    primary: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },
  Books: {
    primary: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
  },
  "Sports & Outdoors": {
    primary: "#ef4444",
    gradient: "linear-gradient(135deg, #f87171, #ef4444)",
  },
  "Phone & Accessories": {
    primary: "#06b6d4",
    gradient: "linear-gradient(135deg, #22d3ee, #06b6d4)",
  },
  // Add common categories from screenshot
  Jeans: {
    primary: "#6366f1",
    gradient: "linear-gradient(135deg, #818cf8, #6366f1)",
  },
  Shirt: {
    primary: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6, #ec4899)",
  },
};

export const DEFAULT_CATEGORY_COLOR = {
  primary: "#8b5cf6",
  gradient: "linear-gradient(135deg, #c4b5fd, #8b5cf6)",
};

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/products/?no_pagination=true&ordering=name`,
};

// Hero Features
export const HERO_FEATURES = [
  { heading: "Free Shipping", heading_vi: "Miễn phí vận chuyển", description: "Over ₫500k", sub_vi: "Đơn từ 500.000₫", icon: "🚚" },
  { heading: "Warranty", heading_vi: "Bảo hành", description: "1 Year", sub_vi: "1 năm", icon: "🛡️" },
  { heading: "Support", heading_vi: "Hỗ trợ", description: "24/7", sub_vi: "24/7", icon: "💬" },
];

// CTA Features
export const CTA_FEATURES = [
  { icon: "⚡", label: "Fast Search", label_vi: "Tìm kiếm siêu tốc" },
  { icon: "🛡️", label: "Secure Checkout", label_vi: "Thanh toán an toàn" },
  { icon: "🚚", label: "Free Shipping", label_vi: "Miễn phí vận chuyển" },
  { icon: "💬", label: "24/7 Support", label_vi: "Hỗ trợ 24/7" },
];

// Newsletter Trust Indicators
export const NEWSLETTER_TRUST_INDICATORS = [
  { icon: "🔒", label: "No spam", label_vi: "Không spam" },
  { icon: "✨", label: "Exclusive deals", label_vi: "Ưu đãi độc quyền" },
  { icon: "📧", label: "Weekly updates", label_vi: "Cập nhật hàng tuần" },
];

// Animation durations
export const ANIMATION_DURATIONS = {
  FLOAT: "20s",
  BOUNCE: "3s",
  PULSE: "2s",
  MORPHING: "8s",
};

// Responsive breakpoints (matching Ant Design)
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// Product display limits
export const PRODUCT_LIMITS = {
  FEATURED: 8,
  DEALS: 4,
  DEALS_TOTAL: 12,
};
