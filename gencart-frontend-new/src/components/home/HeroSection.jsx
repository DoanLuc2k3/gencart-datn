import React from "react";
import { Row, Col, Button, Typography, Space, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { HERO_FEATURES } from "../constants/constants";
import { handleImageError } from "../../utils/productUtils";

const { Title, Paragraph, Text } = Typography;

const BANNERS = [
  {
    id: 1,
    badge: "Trải nghiệm mới đang chờ bạn",
    title: (
      <>
        Mua sắm thông minh 
        <br />
        <span style={{ color: "#1e293b" }}>Cảm nhận nhẹ nhàng </span>
      </>
    ),
    subtitle: "Khám phá giá cả minh bạch, chất lượng được chọn lọc và giao diện thân thiện giúp mỗi khoảnh khắc mua sắm đều dễ chịu, tiện lợi.",
    primaryButton: "Xem sản phẩm",
    secondaryButton: "Tạo tài khoản",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    primaryLink: "/products",
    secondaryLink: "/register",
    theme: {
      badgeBg: "rgba(6, 182, 212, 0.1)",
      badgeBorder: "rgba(6, 182, 212, 0.2)",
      badgeDot: "#06b6d4",
      badgeText: "#0891b2",
      titleColor: "#0284c7",
      buttonGradient: "linear-gradient(135deg, #0284c7, #0ea5e9)",
      buttonShadow: "rgba(14, 165, 233, 0.4)"
    }
  },
  {
    id: 2,
    badge: "Bộ sưu tập Hè 2025",
    title: (
      <>
        Phong cách mới
        <br />
        <span style={{ color: "#1e293b" }}>Chọn lựa táo bạo</span>
      </>
    ),
    subtitle: "Nâng cấp tủ đồ với bộ sưu tập hè mới nhất. Chất liệu cao cấp, thiết kế hợp xu hướng, thoải mái cả ngày dài.",
    primaryButton: "Mua ngay",
    secondaryButton: "Xem Lookbook",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    primaryLink: "/products?category=summer",
    secondaryLink: "/lookbook",
    theme: {
      badgeBg: "rgba(249, 115, 22, 0.1)",
      badgeBorder: "rgba(249, 115, 22, 0.2)",
      badgeDot: "#f97316",
      badgeText: "#ea580c",
      titleColor: "#ea580c",
      buttonGradient: "linear-gradient(135deg, #ea580c, #f43f5e)",
      buttonShadow: "rgba(249, 115, 22, 0.4)"
    }
  }
];

const BannerContent = ({ banner, navigate }) => (
  <Space direction="vertical" size={32} style={{ width: "100%" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {/* Badge */}
      <div
        className="hero-badge-interactive"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: banner.theme.badgeBg,
          border: `1px solid ${banner.theme.badgeBorder}`,
          borderRadius: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: banner.theme.badgeDot,
            animation: "pulse 2s infinite",
          }}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: banner.theme.badgeText,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {banner.badge}
        </Text>
      </div>

      <Title
        className="hero-title hero-title-interactive"
        level={1}
        style={{
          margin: 0,
          fontWeight: 900,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.1,
          color: banner.theme.titleColor,
          letterSpacing: "-0.02em",
          marginBottom: 20,
        }}
      >
        {banner.title}
      </Title>

      <Paragraph
        className="hero-subtitle hero-subtitle-interactive"
        style={{
          fontSize: "clamp(16px, 2.5vw, 20px)",
          maxWidth: 580,
          marginTop: 0,
          color: "#64748b",
          lineHeight: 1.6,
          fontWeight: 400,
        }}
      >
        {banner.subtitle}
      </Paragraph>
    </div>

    <Space size={20} wrap>
      <Button
        type="primary"
        size="large"
        onClick={() => navigate(banner.primaryLink)}
        style={{
          fontWeight: 700,
          padding: "0 40px",
          height: 56,
          borderRadius: 16,
          background: banner.theme.buttonGradient,
          border: "none",
          boxShadow: `0 8px 25px -8px ${banner.theme.buttonShadow}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: 16,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = `0 12px 35px -8px ${banner.theme.buttonShadow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = `0 8px 25px -8px ${banner.theme.buttonShadow}`;
        }}
      >
        {banner.primaryButton}
      </Button>
      <Button
        size="large"
        onClick={() => navigate(banner.secondaryLink)}
        style={{
          fontWeight: 600,
          padding: "0 36px",
          height: 56,
          borderRadius: 16,
          background: "#ffffff",
          border: "2px solid #e2e8f0",
          color: "#475569",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: 16,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.borderColor = "#c7d2fe";
          e.target.style.boxShadow = "0 8px 25px -8px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.borderColor = "#e2e8f0";
          e.target.style.boxShadow = "none";
        }}
      >
        {banner.secondaryButton}
      </Button>
    </Space>

    {/* Enhanced features */}
    <Row gutter={[24, 16]} style={{ marginTop: 8 }}>
      {HERO_FEATURES.map((feature) => (
        <Col key={feature.heading_vi} xs={24} sm={8} style={{ minWidth: 140 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(139, 92, 246, 0.1)",
              borderRadius: 12,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Text style={{ fontSize: 20 }}>{feature.icon}</Text>
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "#8b5cf6",
                  fontWeight: 700,
                }}
              >
                {feature.heading_vi}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              >
                {feature.sub_vi}
              </Text>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </Space>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="home-section hero-section"
    >
      {/* Animated background elements */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />

      <div
        style={{
          maxWidth: 1260,
          margin: "0 auto",
          padding: "0 28px",
          position: "relative",
        }}
      >
        <Carousel 
          autoplay 
          autoplaySpeed={5000} 
          speed={800} 
          effect="scrollx" 
          dots={{ className: "hero-dots" }}
          easing="cubic-bezier(0.645, 0.045, 0.355, 1)"
        >
          {BANNERS.map((banner) => (
            <div key={banner.id}>
              <div style={{ padding: "10px 24px" }}>
                {banner.id === 2 ? (
                  <Row gutter={[48, 32]} align="middle">
                    <Col xs={24} md={10}>
                      <HeroImage src={banner.image} />
                    </Col>
                    <Col xs={24} md={14}>
                      <div style={{ paddingLeft: 40 }}>
                        <BannerContent banner={banner} navigate={navigate} />
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Row gutter={[48, 32]} align="middle">
                    <Col xs={24} md={14}>
                      <BannerContent banner={banner} navigate={navigate} />
                    </Col>
                    <Col xs={24} md={10}>
                      <HeroImage src={banner.image} />
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
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
      `}</style>
    </section>
  );
};

const HeroImage = ({ src }) => {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: 420 }}>
      {/* Geometric background shapes */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 120,
          height: 120,
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(79, 70, 229, 0.05))",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          animation: "morphing 8s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: 80,
          height: 80,
          background:
            "linear-gradient(45deg, rgba(168, 85, 247, 0.08), rgba(139, 92, 246, 0.04))",
          borderRadius: "50%",
          animation: "float 12s ease-in-out infinite reverse",
        }}
      />

      {/* Main image container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100%, 480px)",
            height: 380,
            padding: "20px",
            background: `
              linear-gradient(145deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8)),
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1), transparent 60%)
            `,
            borderRadius: 32,
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.3),
              0 8px 32px rgba(139, 92, 246, 0.15),
              0 0 0 1px rgba(255,255,255,0.8)
            `,
            backdropFilter: "blur(10px)",
            transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)";
            e.currentTarget.style.boxShadow = `
              inset 0 2px 4px rgba(255,255,255,0.4),
              0 12px 48px rgba(139, 92, 246, 0.2),
              0 0 0 1px rgba(255,255,255,0.9)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "perspective(1000px) rotateY(-5deg) rotateX(2deg) scale(1)";
            e.currentTarget.style.boxShadow = `
              inset 0 2px 4px rgba(255,255,255,0.3),
              0 8px 32px rgba(139, 92, 246, 0.15),
              0 0 0 1px rgba(255,255,255,0.8)
            `;
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            }}
          >
            <img
              alt="Hero"
              src={src}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 20,
                transition: "all 0.4s ease",
              }}
              onError={(e) => handleImageError(e, "Featured", 460, 360)}
            />

            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 50%, rgba(79, 70, 229, 0.03) 100%)",
                borderRadius: 20,
              }}
            />
          </div>

          {/* Floating badges */}
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: 70,
              height: 70,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 8px 32px rgba(251, 191, 36, 0.4)",
              animation: "bounce 3s ease-in-out infinite",
              border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            🛒
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-15px",
              left: "-15px",
              width: 60,
              height: 60,
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 6px 24px rgba(16, 185, 129, 0.4)",
              animation: "bounce 3s ease-in-out infinite 1.5s",
              border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            ⭐
          </div>
        </div>

        {/* Decorative dots */}
        {[
          { top: "5%", left: "10%", size: 6, delay: "0s", color: "#8b5cf6" },
          { top: "20%", right: "15%", size: 4, delay: "0.5s", color: "#fbbf24" },
          { bottom: "10%", left: "20%", size: 8, delay: "1s", color: "#10b981" },
        ].map((dot, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              ...Object.fromEntries(
                Object.entries(dot).filter(([key]) =>
                  ["top", "bottom", "left", "right"].includes(key)
                )
              ),
              width: dot.size,
              height: dot.size,
              background: `linear-gradient(45deg, ${dot.color}, ${dot.color})`,
              borderRadius: "50%",
              animation: `pulse 2s ease-in-out infinite ${dot.delay}`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes morphing {
          0%,
          100% {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            transform: rotate(0deg);
          }
          25% {
            border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
            transform: rotate(90deg);
          }
          50% {
            border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
            transform: rotate(180deg);
          }
          75% {
            border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
            transform: rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
