import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { NEWSLETTER_TRUST_INDICATORS } from "../constants/constants";

const { Title, Paragraph, Text } = Typography;

const NewsletterSection = () => {
  const handleSubmit = (values) => {
    console.log("Newsletter subscription:", values);
    message.success("🎉 Chào mừng bạn đến với bản tin của chúng tôi!");
  };

  return (
    <section
      className="home-section newsletter-section"
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background:
            "linear-gradient(45deg, rgba(139, 92, 246, 0.05), rgba(79, 70, 229, 0.03))",
          borderRadius: "50%",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-8%",
          width: "250px",
          height: "250px",
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.04), rgba(139, 92, 246, 0.02))",
          borderRadius: "50%",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
          padding: "0 28px",
          position: "relative",
        }}
      >
        {/* Newsletter badge */}
        <div
          className="newsletter-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 25,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
              animation: "pulse 2s infinite",
            }}
          />
          <Text
            className="newsletter-badge-text"
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Bản tin
          </Text>
        </div>

        <Title
          className="newsletter-title"
          level={2}
          style={{
            fontWeight: 800,
            fontSize: "clamp(28px, 3.5vw, 40px)",
            marginBottom: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Đăng ký nhận tin
        </Title>

        <Paragraph
          className="newsletter-description"
          style={{
            margin: "0 auto 40px",
            maxWidth: 580,
            fontSize: "clamp(16px, 2vw, 18px)",
            lineHeight: 1.6,
          }}
        >
          Nhận thông tin sản phẩm mới, khuyến mãi đặc biệt và bí quyết mua sắm hữu ích. Tham gia cùng hàng ngàn khách hàng hài lòng không bỏ lỡ ưu đãi nào!
        </Paragraph>

        {/* Enhanced form container */}
        <div
          className="newsletter-container"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 20,
            padding: "32px 40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
            backdropFilter: "blur(10px)",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <Form
            layout="inline"
            style={{ justifyContent: "center", gap: 16 }}
            onFinish={handleSubmit}
          >
            <Form.Item
              className="newsletter-input"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
              style={{ margin: 0, flex: 1, maxWidth: 320 }}
            >
              <Input
                size="large"
                placeholder="Nhập email của bạn"
              />
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button
                className="newsletter-button"
                htmlType="submit"
                type="primary"
                size="large"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          {/* Trust indicators */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid rgba(139, 92, 246, 0.1)",
            }}
          >
            {NEWSLETTER_TRUST_INDICATORS.map((indicator, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Text className="newsletter-trust-text">
                  {indicator.icon}
                </Text>
                <Text className="newsletter-trust-text">
                  {indicator.label_vi}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
