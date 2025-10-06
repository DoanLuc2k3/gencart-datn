import { useState } from "react";
import { message } from "antd";

/**
 * Custom hook to manage wishlist
 * @returns {Object} Wishlist state and methods
 */
export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(new Set());

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        message.info("Removed from wishlist");
      } else {
        next.add(productId);
        message.success("Added to wishlist");
      }
      return next;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.has(productId);
  };

  const clearWishlist = () => {
    setWishlist(new Set());
    message.success("Wishlist cleared");
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };
};
