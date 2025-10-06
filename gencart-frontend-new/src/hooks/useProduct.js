import { useState, useEffect } from "react";
import { message } from "antd";
import { API_ENDPOINTS, PRODUCT_LIMITS } from "../components/constants/constants";
import { filterDiscountedProducts } from "../utils/productUtils";

/**
 * Custom hook to fetch and manage products
 * @returns {Object} Products data and loading state
 */
export const useProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(API_ENDPOINTS.PRODUCTS);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();
        const allProducts = data.results || data || [];
        
        // Set featured products (first 8)
        setFeaturedProducts(allProducts.slice(0, PRODUCT_LIMITS.FEATURED));
        
        // Set discounted products
        const discounted = filterDiscountedProducts(allProducts).slice(
          0,
          PRODUCT_LIMITS.DEALS_TOTAL
        );
        setDiscountedProducts(discounted);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        message.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    featuredProducts,
    discountedProducts,
    loading,
    error,
  };
};