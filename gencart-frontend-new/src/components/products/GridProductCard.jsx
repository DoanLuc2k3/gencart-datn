import React from "react";
import { Card, Button, Typography, Image } from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarFilled } from "@ant-design/icons";
import { getCategoryName ,getCategoryGradient } from "../../utils/productUtils";

const { Text } = Typography;

const GridProductCard = ({
  product,
  onView,
  onAdd,
  wishlist,
  toggleWishlist,
  formatCurrency,
  discountPercent,
  compact = false,
}) => {
  const categoryName = getCategoryName(product);
  const hasDiscountValue = discountPercent(product) > 0;
  const inWishlist = wishlist?.includes?.(product.id) || false;
  const rating = product.average_rating || 0;
  const ratingCount = product.total_reviews || 0;
  const price = product.discount_price || product.price || 0;
  const outOfStock = product.inventory <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!outOfStock) {
      onAdd(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product.id);
    }
  };

  return (
    <Card
      onClick={() => onView(product)}
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
        margin: "10px",
        animation: `fadeInUp 0.6s ease-out 0.6s both`,

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
      {/* Product image with gradient background and category overlay */}
      <div
        style={{
          height: compact ? 120 : 160,
          background: "#f8fafc",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {/* Product Image - Background */}
        <img
          src={
            product.image_url ||
            product.primary_image ||
            "https://placehold.co/300x300/lightgray/darkgray?text=No+Image"
          }
          alt={product.name}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 0,
            padding: compact ? 10 : 20,
            mixBlendMode: "multiply"
          }}
        />

        {/* Wishlist button */}
        {toggleWishlist && (
          <Button
            className="wishlist-button"
            shape="circle"
            size="large"
            aria-label="wishlist"
            onClick={handleWishlistToggle}
            icon={
              inWishlist ? (
                <HeartFilled style={{ color: "#ef4444", fontSize: 18 }} />
              ) : (
                <HeartOutlined
                  style={{ color: "#94a3b8", fontSize: 18 }}
                />
              )
            }
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#ffffff",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}

        {/* Discount badge */}
        {hasDiscountValue && (
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              background: "linear-gradient(135deg, #ff4d4f, #f5222d)",
              color: "#fff",
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: "0 4px 10px rgba(245, 34, 45, 0.3)",
              zIndex: 10,
            }}
          >
            -{discountPercent(product)}%
          </div>
        )}

        {/* Stock badge */}
        {product.inventory > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              background: "rgba(34, 197, 94, 0.95)",
              color: "#fff",
              padding: "6px 12px",
              fontSize: 11,
              borderRadius: 20,
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
              zIndex: 10,
            }}
          >
            {product.inventory} IN STOCK
          </div>
        )}
      </div>

      {/* Product content */}
      <div style={{ padding: 20 }}>
        {/* Category Tag */}
        <Text
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            color: "#8b5cf6",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 4,
          }}
        >
          {categoryName}
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
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </Text>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>({ratingCount})</Text>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Text
            strong
            style={{
              fontSize: 20,
              color: hasDiscountValue ? "#dc2626" : "#1f2937",
              fontWeight: 700,
            }}
          >
            {formatCurrency(price)}
          </Text>
          {hasDiscountValue && product.price && (
            <>
              <Text delete style={{ color: "#9ca3af", fontSize: 14 }}>
                {formatCurrency(product.price)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#16a34a",
                  fontWeight: 600,
                  background: "rgba(34, 197, 94, 0.1)",
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                SAVE {formatCurrency(product.price - price)}
              </Text>
            </>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          type="primary"
          icon={!outOfStock && <ShoppingCartOutlined />}
          disabled={outOfStock}
          block
          onClick={handleAddToCart}
          style={{
            fontWeight: 600,
            height: 44,
            borderRadius: 12,
            background: outOfStock
              ? "#f1f5f9"
              : hasDiscountValue
              ? "linear-gradient(135deg, #f43f5e, #e11d48)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
            border: outOfStock ? "1px solid #e2e8f0" : "none",
            color: outOfStock ? "#94a3b8" : "#fff",
            fontSize: 14,
            transition: "all 0.3s ease",
            boxShadow: outOfStock
              ? "none"
              : hasDiscountValue
              ? "0 4px 15px rgba(244, 63, 94, 0.3)"
              : "0 4px 15px rgba(99, 102, 241, 0.3)",
          }}
          onMouseEnter={(e) => {
            if (!outOfStock) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = hasDiscountValue
                ? "0 8px 25px rgba(244, 63, 94, 0.4)"
                : "0 8px 25px rgba(99, 102, 241, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!outOfStock) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = hasDiscountValue
                ? "0 4px 15px rgba(244, 63, 94, 0.3)"
                : "0 4px 15px rgba(99, 102, 241, 0.3)";
            }
          }}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </Card>
  );
};

export default GridProductCard;
