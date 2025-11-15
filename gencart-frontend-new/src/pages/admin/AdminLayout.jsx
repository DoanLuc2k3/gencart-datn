import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Avatar,
  Space,
  message,
  Tooltip,
  Spin,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      if (isMobile) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      const userDataStr = localStorage.getItem("user");

      if (!token) {
        message.error("You must be logged in to access the admin page");
        navigate("/login?redirect=admin");
        return;
      }

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData.is_superuser) {
            setAdminName(userData.username || userData.email || "Admin");
            setLoading(false);
          } else {
            message.error("You do not have permission to access the admin page");
            navigate("/");
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // Get the current selected key based on the path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return "dashboard";
    if (path.includes("/admin/products")) return "products";
    if (path.includes("/admin/categories")) return "categories";
    if (path.includes("/admin/orders")) return "orders";
    if (path.includes("/admin/users")) return "users";
    return "dashboard";
  };

  // Get active tab label
  const getActiveTabLabel = () => {
    const key = getSelectedKey();
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const adminInitial = adminName ? adminName.charAt(0).toUpperCase() : "A";

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        onClick: () => navigate("/admin/dashboard"),
      },
      {
        key: "products",
        icon: <AppstoreOutlined />,
        label: "Products",
        onClick: () => navigate("/admin/products"),
      },
      {
        key: "orders",
        icon: <ShoppingOutlined />,
        label: "Orders",
        onClick: () => navigate("/admin/orders"),
      },
      {
        key: "users",
        icon: <UserOutlined />,
        label: "Users",
        onClick: () => navigate("/admin/users"),
      },
      {
        key: "categories",
        icon: <TagOutlined />,
        label: "Categories",
        onClick: () => navigate("/admin/categories"),
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
      },
    ],
    [navigate]
  );

  const tooltipContainer = useCallback((triggerNode) => {
    if (typeof window !== "undefined") {
      return window.document.body;
    }
    return triggerNode?.ownerDocument?.body;
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={collapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={mobileView ? 0 : 80}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 1000,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "4px 0 24px rgba(15, 23, 42, 0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: collapsed ? "20px 18px" : "24px 24px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Avatar
            size={collapsed ? 36 : 44}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 10px 20px rgba(15, 23, 42, 0.3)",
            }}
          >
            G
          </Avatar>
          {!collapsed && (
            <div style={{ lineHeight: 1.3 }}>
              <Text strong style={{ color: "#fff", fontSize: 16 }}>
                GenCart Admin
              </Text>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Hello, {adminName}
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: collapsed ? "12px 10px" : "16px 16px",
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{
              background: "transparent",
              borderInlineEnd: "none",
              paddingInline: 0,
              gap: 8,
            }}
            items={menuItems}
          />
        </div>
        <div
          style={{
            padding: collapsed ? "16px 12px" : "20px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: 12,
          }}
        >
          <Tooltip
            title={collapsed ? "Expand" : "Collapse"}
            placement={collapsed ? "right" : "top"}
            getPopupContainer={tooltipContainer}
            overlayStyle={{ zIndex: 2000 }}
          >
            <Button
              shape="circle"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "none",
                color: "#fff",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            />
          </Tooltip>
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: mobileView ? 0 : collapsed ? 80 : 200,
          transition: "all 0.2s",
          background: "#f5f7fb",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: "linear-gradient(135deg, #111c44 0%, #1f2a51 100%)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.3)",
            height: "72px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: mobileView ? "0 12px" : "0 24px",
              color: "#fff",
              flexWrap: "wrap",
              gap: 12,
              minHeight: "72px",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {mobileView && (
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    color: "#51309eff",
                    fontSize: 20,
                    border: "1px solid #51309eff",
                  }}
                />
              )}
            </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  position: mobileView ? "" : "absolute",
                  left: "2%",
                  gap: 12,
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 10px 20px rgba(15, 23, 42, 0.18)",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {getSelectedKey().charAt(0).toUpperCase()}
                </span>
                <Title
                  level={4}
                  style={{
                    color: "#51309eff",
                    fontWeight: 700,
                    margin: 0,
                    fontSize: 20,
                    letterSpacing: 0.5,
                    textTransform: "capitalize",
                  }}
                >
                  {getActiveTabLabel()}
                </Title>
              </div>
            <Space align="center" size={mobileView ? 8 : 16} wrap>
                <Button
                  type="primary"
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/")}
                >
                 {mobileView ? "" : "Home"}
                </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                {...(mobileView && { size: "small" })}
              >
                {mobileView ? "" : "Logout"}
              </Button>
            </Space>
          </div>
        </Header>
        <Content
          style={{
            margin: mobileView ? "16px 8px" : "24px 16px",
            padding: 0,
            background: "transparent",
            minHeight: 280,
          }}
        >
          <div style={{ padding: mobileView ? 12 : 24 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
