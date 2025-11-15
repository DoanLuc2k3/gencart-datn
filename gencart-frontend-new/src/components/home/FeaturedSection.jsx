import React from "react";
import { Row, Col, Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const FeaturedSection = ({ products, loading, ProductCard }) => {
  const navigate = useNavigate();

  return (
    <section
      style={{
        padding: "80px 0 60px",
        background:
          "linear-gradient(135deg, #fafbff 0%, #f8fafc 50%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          background:
            "linear-gradient(45deg, rgba(139, 92, 246, 0.03), rgba(79, 70, 229, 0.02))",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-8%",
          width: "250px",
          height: "250px",
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.04), rgba(139, 92, 246, 0.02))",
          borderRadius: "50%",
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
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: 25,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#8b5cf6",
                animation: "pulse 2s infinite",
              }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#8b5cf6",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Featured Collection
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
                "linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Featured Products
          </Title>

          <Paragraph
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              color: "#64748b",
              maxWidth: 600,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Discover our handpicked selection of premium products, carefully
            curated to bring you the best quality and value.
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
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              border: "none",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 35px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.3)";
            }}
          >
            View All Products
          </Button>
        </div>

        {loading ? (
          <Row gutter={[24, 32]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card loading style={{ borderRadius: 20, height: 380 }} />
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 32]} justify="center">
            {products.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedSection;
