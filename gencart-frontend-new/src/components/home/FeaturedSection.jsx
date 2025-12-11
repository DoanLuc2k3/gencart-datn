import React from "react";
import { Row, Col, Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const FeaturedSection = ({ products, loading, ProductCard }) => {
  const navigate = useNavigate();

  return (
    <section className="home-section featured-section">
      {/* Background decoration */}
      <div className="featured-blob featured-blob-1" />
      <div className="featured-blob featured-blob-2" />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Enhanced Section Header */}
        <div className="featured-header">
          {/* Badge */}
          <div className="featured-badge">
            <div className="featured-badge-dot" />
            <Text className="featured-badge-text">
              Bộ sưu tập nổi bật
            </Text>
          </div>

          <Title className="featured-title" level={2}>
            Sản phẩm nổi bật
          </Title>

          <Paragraph className="featured-description">
            Khám phá những sản phẩm được chọn lọc kỹ càng, mang đến chất lượng và giá trị tốt nhất cho bạn.
          </Paragraph>

          {/* Action button */}
          <Button
            className="featured-button"
            size="large"
            onClick={() => navigate("/products")}
          >
            Xem tất cả sản phẩm
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
            {products.map((product, index) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <div
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
