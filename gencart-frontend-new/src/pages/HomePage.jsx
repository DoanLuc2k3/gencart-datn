import React from "react";
import { Spin } from "antd";
import { useProducts } from "../hooks/useProduct";
import { useWishlist } from "../hooks/useWishlist";
import useScrollToTop from "../hooks/useScrollToTop";
import HeroSection from "../components/home/HeroSection";
import FeaturedSection from "../components/home/FeaturedSection";
import DealsSection from "../components/home/DealsSection";
import NewsletterSection from "../components/home/NewsletterSection";
import FinalCTASection from "../components/home/FinalCTASection";
import ProductCard from "../components/home/ProductCard";
import "../user-css/HomePage.css";

/**
 * HomePage Component
 * Main landing page with multiple sections:
 * - Hero section with CTAs
 * - Featured products showcase
 * - Hot deals section
 * - Newsletter subscription
 * - Final CTA section
 */
const HomePage = () => {
  // Scroll to top when page loads
  useScrollToTop();

  // Fetch products data
  const { featuredProducts, discountedProducts, loading, error } = useProducts();

  // Manage wishlist state
  const { wishlist, toggleWishlist } = useWishlist();

  // Show error state (optional - currently just logs)
  if (error) {
    console.error("HomePage Error:", error);
  }

  // Create ProductCard wrapper with wishlist props
  const ProductCardWithWishlist = (props) => (
    <ProductCard {...props} wishlist={wishlist} toggleWishlist={toggleWishlist} />
  );

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section - with loading state */}
      <FeaturedSection
        products={featuredProducts}
        loading={loading}
        ProductCard={ProductCardWithWishlist}
      />

      {/* Hot Deals Section - with loading state */}
      <DealsSection
        products={discountedProducts}
        loading={loading}
        ProductCard={ProductCardWithWishlist}
      />

      {/* Newsletter Subscription Section */}
      <NewsletterSection />

      {/* Final Call-to-Action Section */}
      <FinalCTASection />
    </div>
  );
};

export default HomePage;
