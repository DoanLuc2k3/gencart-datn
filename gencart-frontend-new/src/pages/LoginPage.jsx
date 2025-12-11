import React, { useState } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Checkbox,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login error response:", errorData);

        let errorMessage = "Login failed";
        if (typeof errorData === "object") {
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            const messages = [];
            for (const [key, value] of Object.entries(errorData)) {
              if (Array.isArray(value)) {
                messages.push(`${key}: ${value.join(", ")}`);
              } else if (typeof value === "string") {
                messages.push(`${key}: ${value}`);
              }
            }
            if (messages.length > 0) {
              errorMessage = messages.join("; ");
            }
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("isLoggedIn", "true");

      const userResponse = await fetch("http://localhost:8000/api/users/me/", {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      let isAdmin = false;
      let userData = null;

      if (userResponse.ok) {
        userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
        isAdmin = userData.is_staff || userData.is_superuser;
        console.log("User data:", userData);
        console.log("Is admin:", isAdmin);
      }

      message.success("Login successful!");
      window.dispatchEvent(new Event("login"));

      if (isAdmin) {
        console.log("Admin user detected, redirecting to admin panel");
        message.info("Welcome Admin! Redirecting to admin panel...");
        navigate("/admin");
      } else {
        console.log("Regular user detected, redirecting to home");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "300px",
          height: "300px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 10s ease-in-out infinite 2s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(255, 255, 255, 0.06)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "float 12s ease-in-out infinite 4s",
        }}
      />

      {/* Main Container */}
      <div
        style={{
          position: "relative",
          width: "850px",
          maxWidth: "95%",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
          background: "white",
          minHeight: "520px",
        }}
      >
        {/* Left Panel - Login Form */}
        <div
          style={{
            flex: "1",
            padding: "40px 35px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "white",
            position: "relative",
          }}
        >
          {/* Logo/Brand */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 12 }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.3)",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "20px" }}>🚀</span>
              </div>
              <Title
                level={1}
                style={{
                  color: "#1a1a2e",
                  margin: 0,
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome Back
              </Title>
            </div>
            <Text
              style={{
                color: "#64748b",
                fontSize: "13px",
                display: "block",
                paddingLeft: "54px",
              }}
            >
              
            </Text>
          </div>

          <div style={{marginBottom: "14px"}}>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                style={{ marginBottom: "14px" }}
              >
                <Input
                  prefix={
                    <UserOutlined
                      style={{ color: "#667eea", fontSize: "14px" }}
                    />
                  }
                  placeholder="Username"
                  size="large"
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    paddingLeft: "18px",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                style={{ marginBottom: "14px" }}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      style={{ color: "#667eea", fontSize: "14px" }}
                    />
                  }
                  placeholder="Password"
                  size="large"
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    paddingLeft: "18px",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </Form.Item>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    Remember me
                  </Checkbox>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#667eea",
                      fontWeight: "600",
                      fontSize: "12px",
                      textDecoration: "none",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  style={{
                    height: "44px",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(102, 126, 234, 0.35)";
                  }}
                >
                  Sign In
                </Button>
              </div>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "16px 0",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e2e8f0",
                  }}
                />
                <span
                  style={{
                    padding: "0 10px",
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                >
                  OR CONTINUE WITH
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "#e2e8f0",
                  }}
                />
              </div>

              {/* Social Login */}
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  size="large"
                  onClick={() =>
                    message.info("Google login not implemented in this demo")
                  }
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: "white",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
                <Button
                  size="large"
                  onClick={() =>
                    message.info("Facebook login not implemented in this demo")
                  }
                  style={{
                    flex: 1,
                    height: "42px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "14px",
                    background: "white",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* Right Panel - Hero Section */}
        <div
          style={{
            flex: "1",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Geometric Background */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-15%",
              width: "350px",
              height: "350px",
              background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "pulse 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-25%",
              left: "-20%",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: "pulse 10s ease-in-out infinite 2s",
            }}
          />

          {/* Floating Modern Elements */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "8%",
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              transform: "rotate(15deg)",
              animation: "float 7s ease-in-out infinite",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "65%",
              right: "10%",
              width: "45px",
              height: "45px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              borderRadius: "50%",
              backdropFilter: "blur(10px)",
              animation: "float 9s ease-in-out infinite 1.5s",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "18%",
              left: "12%",
              width: "38px",
              height: "38px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "10px",
              transform: "rotate(-20deg)",
              animation: "float 6s ease-in-out infinite 0.5s",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "35%",
              right: "5%",
              width: "25px",
              height: "25px",
              background: "rgba(255, 255, 255, 0.25)",
              borderRadius: "6px",
              transform: "rotate(45deg)",
              animation: "float 8s ease-in-out infinite 3s",
            }}
          />

          {/* Main Content Card */}
          <div 
            style={{ 
              textAlign: "center", 
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              padding: "45px 35px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
              maxWidth: "340px",
            }}
          >
            {/* Animated Icon Container */}
            <div
              style={{
                width: "100px",
                height: "100px",
                margin: "0 auto 25px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                animation: "float 5s ease-in-out infinite",
                border: "3px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                }}
              >
                👋
              </div>
            </div>

            <Title
              level={1}
              style={{
                color: "white",
                fontSize: "2rem",
                marginBottom: 12,
                fontWeight: "800",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.15)",
                letterSpacing: "-0.5px",
              }}
            >
              New Here?
            </Title>
            
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.95)",
                fontSize: "13.5px",
                display: "block",
                lineHeight: "1.65",
                marginBottom: 28,
                fontWeight: "400",
              }}
            >
              Create an account and discover a world of possibilities. Join our community today!
            </Text>
            
            <Button
              size="large"
              onClick={() => navigate("/register")}
              style={{
                height: "46px",
                paddingLeft: 32,
                paddingRight: 32,
                borderRadius: "23px",
                border: "2px solid white",
                background: "white",
                color: "#667eea",
                fontSize: "14px",
                fontWeight: "700",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0, 0, 0, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
              }}
            >
              Create Account →
            </Button>

            {/* Feature Pills */}
            <div style={{ 
              display: "flex", 
              gap: "8px", 
              marginTop: "24px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}>
              {["✨ Free", "🚀 Fast", "🔒 Secure"].map((feature, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "20px",
                    fontSize: "11px",
                    color: "white",
                    fontWeight: "600",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Decorative Glow */}
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "120px",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(8deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;