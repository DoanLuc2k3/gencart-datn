import React from "react";
import { Row, Col, Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { PRODUCT_LIMITS } from "../constants/constants";

const { Title, Paragraph, Text } = Typography;

const DealsSection = ({ products, loading, ProductCard }) => {
  const navigate = useNavigate();

  if (!loading && products.length === 0) return null;

  return (
    <section
      style={{
        padding: "80px 0 60px",
        background: `
          linear-gradient(135deg, #fef2f2 0%, #fef7f7 25%, #fefefe 50%, #f0f9ff 75%, #e0f2fe 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background:
            "linear-gradient(45deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05))",
          borderRadius: "50%",
          animation: "float 15s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-25%",
          right: "-8%",
          width: "350px",
          height: "350px",
          background:
            "linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(234, 88, 12, 0.04))",
          borderRadius: "50%",
          animation: "float 18s ease-in-out infinite reverse",
        }}
      />

      <div
        style={{
          maxWidth: 1260,
          margin: "0 auto",
          padding: "0 28px",
          position: "relative",
        }}
      >
        {/* Enhanced Section Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 60,
            position: "relative",
          }}
        >
          {/* Urgency badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 25,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse 1.5s infinite",
              }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#dc2626",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Limited Time Offers
            </Text>
          </div>

          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.2,
              background:
                "linear-gradient(135deg, #dc2626 0%, #ef4444 25%, #f97316 50%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Hot Deals
          </Title>

          <Paragraph
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              color: "#64748b",
              maxWidth: 600,
              margin: "0 auto 32px",
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Don't miss out on these incredible discounts! Limited time offers
            with massive savings on premium products.
          </Paragraph>

          {/* Action button */}
          <Button
            size="large"
            onClick={() => navigate("/products")}
            style={{
              fontWeight: 600,
              padding: "0 32px",
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
              border: "none",
              boxShadow: "0 8px 25px rgba(220, 38, 38, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 35px rgba(220, 38, 38, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(220, 38, 38, 0.3)";
            }}
          >
            View All Deals
          </Button>
        </div>

        {/* Enhanced Product Grid */}
        {loading ? (
          <Row gutter={[24, 32]} justify="center">
            {Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={5}>
                <Card loading style={{ borderRadius: 20, height: 380 }} />
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 32]} justify="center">
            {products.slice(0, PRODUCT_LIMITS.DEALS).map((product, index) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={5}>
                <div
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <ProductCard product={product} compact />
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Countdown timer element */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            padding: "20px 32px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 16,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(239, 68, 68, 0.1)",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#dc2626",
              marginRight: 16,
            }}
          >
            ⏰ Offers end soon!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Don't wait - these deals won't last forever
          </Text>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default DealsSection;
