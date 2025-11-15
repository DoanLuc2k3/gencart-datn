import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { NEWSLETTER_TRUST_INDICATORS } from "../constants/constants";

const { Title, Paragraph, Text } = Typography;

const NewsletterSection = () => {
  const handleSubmit = (values) => {
    console.log("Newsletter subscription:", values);
    message.success("🎉 Welcome to our newsletter!");
  };

  return (
    <section
      style={{
        padding: "80px 0",
        background: `
          linear-gradient(135deg, #fafbff 0%, #f8fafc 25%, #f1f5f9 50%, #fafbff 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: 25,
            marginBottom: 32,
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
            Newsletter
          </Text>
        </div>

        <Title
          level={2}
          style={{
            fontWeight: 800,
            fontSize: "clamp(28px, 3.5vw, 40px)",
            marginBottom: 20,
            background:
              "linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Stay in the loop
        </Title>

        <Paragraph
          style={{
            margin: "0 auto 40px",
            maxWidth: 580,
            color: "#64748b",
            fontSize: "clamp(16px, 2vw, 18px)",
            lineHeight: 1.6,
          }}
        >
          Get exclusive product updates, special promotions, and insider tips.
          Join thousands of satisfied customers who never miss a deal!
        </Paragraph>

        {/* Enhanced form container */}
        <div
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
              name="email"
              rules={[
                { required: true, message: "Email required" },
                { type: "email", message: "Invalid email" },
              ]}
              style={{ margin: 0, flex: 1, maxWidth: 320 }}
            >
              <Input
                size="large"
                placeholder="Enter your email address"
                style={{
                  height: 52,
                  borderRadius: 14,
                  border: "2px solid #e2e8f0",
                  fontSize: 16,
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                style={{
                  height: 52,
                  borderRadius: 14,
                  padding: "0 32px",
                  fontWeight: 600,
                  fontSize: 16,
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  border: "none",
                  boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 12px 35px rgba(139, 92, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 8px 25px rgba(139, 92, 246, 0.3)";
                }}
              >
                Subscribe
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
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {indicator.icon}
                </Text>
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {indicator.label}
                </Text>
              </div>
            ))}
          </div>
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

export default NewsletterSection;
