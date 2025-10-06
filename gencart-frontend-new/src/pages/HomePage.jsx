import React from "react";
import { Spin } from "antd";
import { useProducts } from "../hooks/useProduct";
import { useWishlist } from "../hooks/useWishlist";
import HeroSection from "../components/home/HeroSection";
import FeaturedSection from "../components/home/FeaturedSection";
import DealsSection from "../components/home/DealsSection";
import NewsletterSection from "../components/home/NewsletterSection";
import FinalCTASection from "../components/home/FinalCTASection";
import ProductCard from "../components/home/ProductCard";

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
  // Fetch products data
  const { featuredProducts, discountedProducts, loading, error } = useProducts();

  // Manage wishlist state
  const { wishlist, toggleWishlist } = useWishlist();

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Loading products..." />
      </div>
    );
  }

  // Show error state (optional - currently just logs)
  if (error) {
    console.error("HomePage Error:", error);
  }

  // Create ProductCard wrapper with wishlist props
  const ProductCardWithWishlist = (props) => (
    <ProductCard {...props} wishlist={wishlist} toggleWishlist={toggleWishlist} />
  );

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <FeaturedSection
        products={featuredProducts}
        loading={loading}
        ProductCard={ProductCardWithWishlist}
      />

      {/* Hot Deals Section */}
      <DealsSection
        products={discountedProducts}
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
