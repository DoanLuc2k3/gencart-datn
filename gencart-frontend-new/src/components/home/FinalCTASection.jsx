import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CTA_FEATURES } from "../constants/constants";

const { Title, Paragraph, Text } = Typography;

const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="home-section final-cta-section"
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(79, 70, 229, 0.05))",
          borderRadius: "50%",
          animation: "float 25s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40%",
          right: "-15%",
          width: "600px",
          height: "600px",
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(139, 92, 246, 0.04))",
          borderRadius: "50%",
          animation: "float 30s ease-in-out infinite reverse",
        }}
      />

      {/* Floating particles */}
      {[
        { top: "20%", left: "10%", size: 4, delay: "0s" },
        { top: "60%", right: "20%", size: 6, delay: "1s" },
        { bottom: "30%", left: "25%", size: 3, delay: "2s" },
      ].map((particle, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            ...Object.fromEntries(
              Object.entries(particle).filter(([key]) =>
                ["top", "bottom", "left", "right"].includes(key)
              )
            ),
            width: particle.size,
            height: particle.size,
            background: [
              "rgba(139, 92, 246, 0.6)",
              "rgba(168, 85, 247, 0.5)",
              "rgba(79, 70, 229, 0.7)",
            ][index],
            borderRadius: "50%",
            animation: `pulse 3s ease-in-out infinite ${particle.delay}`,
          }}
        />
      ))}

      <div
        className="final-cta-content"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
          padding: "0 28px",
          position: "relative",
        }}
      >
        {/* CTA badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: "rgba(139, 92, 246, 0.2)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: 25,
            marginBottom: 32,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#8b5cf6",
              animation: "pulse 2s infinite",
            }}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#c084fc",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Bắt đầu mua sắm
          </Text>
        </div>

        <Title
          level={1}
          style={{
            color: "#fff",
            fontWeight: 900,
            marginBottom: 24,
            fontSize: "clamp(36px, 5vw, 56px)",
            lineHeight: 1.1,
            background:
              "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Sẵn sàng khám phá?
        </Title>

        <Paragraph
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "clamp(16px, 2.5vw, 20px)",
            margin: "0 auto 48px",
            maxWidth: 600,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Khám phá sản phẩm tuyệt vời với tìm kiếm siêu tốc, giao diện trực quan và trải nghiệm thanh toán mượt mà.
        </Paragraph>

        {/* Enhanced buttons */}
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Button
            className="cta-button"
            type="primary"
            size="large"
            onClick={() => navigate("/products")}
            style={{
              fontWeight: 700,
              height: 56,
              padding: "0 40px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              border: "none",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
              transition: "all 0.3s ease",
              fontSize: 16,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 12px 35px rgba(139, 92, 246, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.4)";
            }}
          >
            Xem sản phẩm
          </Button>

          <Button
            size="large"
            onClick={() => navigate("/register")}
            style={{
              fontWeight: 600,
              height: 56,
              padding: "0 40px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              fontSize: 16,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.target.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Tạo tài khoản
          </Button>
        </div>

        {/* Feature highlights */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 48,
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          {CTA_FEATURES.map((feature, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 8,
                }}
              >
                {feature.icon}
              </div>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                {feature.label_vi}
              </Text>
            </div>
          ))}
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
      `}</style>
    </section>
  );
};

export default FinalCTASection;
