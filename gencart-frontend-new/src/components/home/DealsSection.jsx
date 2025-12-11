import React, { useRef } from "react";
import { Row, Col, Button, Typography, Card, Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PRODUCT_LIMITS } from "../constants/constants";

const { Title, Paragraph, Text } = Typography;

const DealsSection = ({ products, loading, ProductCard }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  if (!loading && products.length === 0) return null;

  return (
    <section
      className="home-section deals-section"
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
          className="section-header"
          style={{
            textAlign: "center",
            marginBottom: 60,
            position: "relative",
          }}
        >
          {/* Urgency badge */}
          <div className="deals-badge">
            <div className="deals-badge-dot" />
            <Text className="deals-badge-text">
              Ưu đãi giới hạn
            </Text>
          </div>

          <Title
            className="deals-title"
            level={2}
          >
            Khuyến mãi hot
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
            Đừng bỏ lỡ những ưu đãi hấp dẫn này! Thời gian có hạn với mức giảm giá cực lớn cho các sản phẩm cao cấp.
          </Paragraph>

          {/* Action button */}
          <Button
            className="deals-button"
            size="large"
            onClick={() => navigate("/products")}
          >
            Xem tất cả khuyến mãi
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
          <div className="deals-carousel-container">
            <div 
              className="carousel-arrow left" 
              onClick={() => carouselRef.current?.prev()}
            >
              <LeftOutlined />
            </div>
            
            <Carousel
              ref={carouselRef}
              autoplay
              dots={false}
              slidesToShow={4}
              slidesToScroll={1}
              infinite={true}
              className="deals-carousel"
              responsive={[
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 3,
                  }
                },
                {
                  breakpoint: 992,
                  settings: {
                    slidesToShow: 2,
                  }
                },
                {
                  breakpoint: 576,
                  settings: {
                    slidesToShow: 1,
                  }
                }
              ]}
            >
              {products.slice(0, PRODUCT_LIMITS.DEALS).map((product, index) => (
                <div key={product.id}>
                  <div
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      padding: "10px" // Add padding to prevent shadow clipping
                    }}
                  >
                    <ProductCard product={product} compact isHotDeal />
                  </div>
                </div>
              ))}
            </Carousel>

            <div 
              className="carousel-arrow right" 
              onClick={() => carouselRef.current?.next()}
            >
              <RightOutlined />
            </div>
          </div>
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
            ⏰ Ưu đãi sắp kết thúc!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Đừng chần chừ - các ưu đãi này sẽ không kéo dài lâu đâu
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
