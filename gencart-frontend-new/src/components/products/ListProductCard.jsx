import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarFilled } from "@ant-design/icons";
import { getCategoryName, getCategoryGradient } from "../../utils/productUtils";

const { Text } = Typography;

const ListProductCard = ({
  product,
  onView,
  onAdd,
  wishlist,
  toggleWishlist,
  formatCurrency,
  discountPercent,
  getCategoryColor,
}) => {
  const categoryName = getCategoryName(product);
  const hasDiscountValue = discountPercent(product) > 0;
  const inWishlist = wishlist?.includes?.(product.id) || false;
  const rating = product.average_rating || 0;
  const ratingCount = product.total_reviews || 0;
  const price = product.discount_price || product.price || 0;
  const outOfStock = product.inventory <= 0;
  const originalPrice = product.price || 0;

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
        marginBottom: "10px",
        animation: `fadeInUp 0.6s ease-out 0.6s both`,

      }}
      bodyStyle={{ padding: 0 }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.12)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Row gutter={0} align="middle">
        {/* Category gradient section with background image */}
        <Col xs={24} sm={8} md={6}>
          <div
            style={{
              height: "100%",
              minHeight: 200,
              background: "#f8fafc",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
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
                padding: 20,
                mixBlendMode: "multiply"
              }}
            />

            {/* Discount badge */}
            {hasDiscountValue && (
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#dc2626",
                  padding: "6px 12px",
                  fontSize: 12,
                  borderRadius: 20,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  backdropFilter: "blur(10px)",
                  zIndex: 10,
                }}
              >
                {discountPercent(product)}% OFF
              </div>
            )}
          </div>
        </Col>

        {/* Product info section */}
        <Col xs={24} sm={16} md={18}>
          <div style={{ padding: 24 }}>
            <Row gutter={[16, 16]} align="middle">
              {/* Product details */}
              <Col xs={24} lg={14}>
                {/* Category and Stock badges */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {/* Category badge */}
                  <div
                    style={{
                      background: getCategoryGradient(categoryName),
                      color: "#fff",
                      padding: "6px 14px",
                      fontSize: 12,
                      borderRadius: 20,
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {categoryName}
                  </div>

                  {/* Stock badge */}
                  {product.inventory > 0 ? (
                    <div
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "6px 14px",
                        fontSize: 12,
                        borderRadius: 20,
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {product.inventory} IN STOCK
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        padding: "6px 14px",
                        fontSize: 12,
                        borderRadius: 20,
                        fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      OUT OF STOCK
                    </div>
                  )}
                </div>

                {/* Product name */}
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: 12,
                    fontSize: 20,
                    lineHeight: 1.4,
                    color: "#1e293b",
                    fontWeight: 600,
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
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <StarFilled
                        key={i}
                        style={{
                          fontSize: 14,
                          color: i < Math.floor(rating) ? "#fadb14" : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    {rating.toFixed(1)} ({ratingCount})
                  </Text>
                </div>
              </Col>

              {/* Price and actions */}
              <Col xs={24} lg={10}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    alignItems: "flex-end",
                  }}
                >
                  {/* Price block */}
                  <div style={{ textAlign: "right" }}>
                    {hasDiscountValue ? (
                      <>
                        <Text
                          delete
                          style={{
                            fontSize: 14,
                            color: "#94a3b8",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {formatCurrency(originalPrice)}
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: 28,
                            color: "#dc2626",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatCurrency(price)}
                        </Text>
                      </>
                    ) : (
                      <Text
                        strong
                        style={{
                          fontSize: 28,
                          color: "#1e293b",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {formatCurrency(price)}
                      </Text>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
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
                            <HeartOutlined style={{ fontSize: 18 }} />
                          )
                        }
                        style={{
                          background: inWishlist ? "#fef2f2" : "#f8fafc",
                          border: inWishlist ? "2px solid #fecaca" : "2px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                        }}
                      />
                    )}

                    {/* Add to cart button */}
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      disabled={outOfStock}
                      onClick={handleAddToCart}
                      size="large"
                      style={{
                        background: outOfStock
                          ? "#e2e8f0"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: 12,
                        height: 48,
                        padding: "0 24px",
                        fontWeight: 600,
                        fontSize: 15,
                        boxShadow: outOfStock ? "none" : "0 4px 16px rgba(102, 126, 234, 0.4)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!outOfStock) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!outOfStock) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.4)";
                        }
                      }}
                    >
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ListProductCard;
