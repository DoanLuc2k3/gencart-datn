import React from "react";
import { Card, Button, Typography } from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { message } from "antd";
import {
  getCategoryName,
  getCategoryGradient,
  hasDiscount,
  calculateDiscountPercentage,
  getProductPrice,
  getProductRating,
  getReviewCount,
  isOutOfStock,
} from "../../utils/productUtils";

const { Text } = Typography;

const ProductCard = ({ product, compact = false, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const categoryName = getCategoryName(product);
  const productHasDiscount = hasDiscount(product);
  const inWishlist = wishlist?.has(product.id);
  const rating = getProductRating(product);
  const ratingCount = getReviewCount(product);
  const price = getProductPrice(product);
  const outOfStock = isOutOfStock(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (outOfStock) {
      message.error("This product is out of stock!");
      return;
    }
    addToCart(product);
    message.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product.id);
    }
  };

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card
      onClick={handleProductClick}
      style={{
        borderRadius: 20,
        border: "none",
        background: "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        position: "relative",
        height: "100%",
      }}
      bodyStyle={{ padding: 0 }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.15)";
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Category header with gradient */}
      <div
        style={{
          height: compact ? 120 : 160,
          background: getCategoryGradient(categoryName),
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
          }}
        />

        {/* Category text */}
        <Text
          style={{
            fontSize: compact ? 20 : 24,
            fontWeight: 800,
            color: "#fff",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            letterSpacing: "-0.02em",
          }}
        >
          {categoryName}
        </Text>

        {/* Wishlist button */}
        {toggleWishlist && (
          <Button
            shape="circle"
            size="large"
            aria-label="wishlist"
            onClick={handleWishlistToggle}
            icon={
              inWishlist ? (
                <HeartFilled style={{ color: "#ef4444", fontSize: 18 }} />
              ) : (
                <HeartOutlined
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }}
                />
              )
            }
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: inWishlist ? "#fff" : "rgba(255, 255, 255, 0.2)",
              border: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = inWishlist
                ? "#fef2f2"
                : "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = inWishlist
                ? "#fff"
                : "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        )}

        {/* Discount badge */}
        {productHasDiscount && (
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              background: "rgba(255, 255, 255, 0.95)",
              color: "#dc2626",
              padding: "6px 12px",
              fontSize: 12,
              borderRadius: 20,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            -{calculateDiscountPercentage(product)}%
          </div>
        )}
      </div>

      {/* Product content */}
      <div style={{ padding: 20 }}>
        {/* Subcategory */}
        <Text
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "#8b5cf6",
            fontWeight: 700,
            display: "block",
            marginBottom: 8,
          }}
        >
          {categoryName.toUpperCase()}
        </Text>

        {/* Product name */}
        <Text
          strong
          style={{
            display: "block",
            marginBottom: 12,
            fontSize: 16,
            lineHeight: 1.4,
            color: "#1e293b",
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          {product.name}
        </Text>

        {/* Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <StarFilled
                key={i}
                style={{
                  color: i < Math.floor(rating) ? "#fbbf24" : "#e2e8f0",
                  fontSize: 14,
                }}
              />
            ))}
          </div>
          <Text strong style={{ fontSize: 13, color: "#374151" }}>
            {rating}
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>({ratingCount})</Text>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 20,
              color: productHasDiscount ? "#dc2626" : "#1f2937",
              fontWeight: 700,
            }}
          >
            ₫{price.toFixed(2)}
          </Text>
          {productHasDiscount && (
            <Text delete style={{ color: "#9ca3af", fontSize: 14 }}>
              ₫{parseFloat(product.price).toFixed(2)}
            </Text>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={outOfStock}
          block
          onClick={handleAddToCart}
          style={{
            fontWeight: 600,
            height: 44,
            borderRadius: 12,
            background: productHasDiscount
              ? "linear-gradient(135deg, #dc2626, #ef4444)"
              : "linear-gradient(135deg, #8b5cf6, #a855f7)",
            border: "none",
            fontSize: 14,
            transition: "all 0.3s ease",
            boxShadow: productHasDiscount
              ? "0 4px 15px rgba(220, 38, 38, 0.3)"
              : "0 4px 15px rgba(139, 92, 246, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!outOfStock) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = productHasDiscount
                ? "0 8px 25px rgba(220, 38, 38, 0.4)"
                : "0 8px 25px rgba(139, 92, 246, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!outOfStock) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = productHasDiscount
                ? "0 4px 15px rgba(220, 38, 38, 0.3)"
                : "0 4px 15px rgba(139, 92, 246, 0.3)";
            }
          }}
        >
          {outOfStock ? "Out of Stock" : "Add To Cart"}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
