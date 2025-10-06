// Category Colors Mapping
export const CATEGORY_COLORS = {
  Electronics: {
    primary: "#2196F3",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  Clothing: {
    primary: "#4CAF50",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
  },
  "Home & Kitchen": {
    primary: "#FF9800",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
  Books: {
    primary: "#9C27B0",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  "Sports & Outdoors": {
    primary: "#F44336",
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
  },
  "Phone & Accessories": {
    primary: "#009688",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
  },
};

export const DEFAULT_CATEGORY_COLOR = {
  primary: "#607D8B",
  gradient: "linear-gradient(135deg, #64748b, #475569)",
};

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: "http://localhost:8000/api/products/?no_pagination=true&ordering=name",
};

// Hero Features
export const HERO_FEATURES = [
  { heading: "Free Shipping", description: "Over ₫500k", icon: "🚚" },
  { heading: "Warranty", description: "1 Year", icon: "🛡️" },
  { heading: "Support", description: "24/7", icon: "💬" },
];

// CTA Features
export const CTA_FEATURES = [
  { icon: "⚡", label: "Fast Search" },
  { icon: "🛡️", label: "Secure Checkout" },
  { icon: "🚚", label: "Free Shipping" },
  { icon: "💬", label: "24/7 Support" },
];

// Newsletter Trust Indicators
export const NEWSLETTER_TRUST_INDICATORS = [
  { icon: "🔒", label: "No spam" },
  { icon: "✨", label: "Exclusive deals" },
  { icon: "📧", label: "Weekly updates" },
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
  DEALS: 6,
  DEALS_TOTAL: 12,
};
