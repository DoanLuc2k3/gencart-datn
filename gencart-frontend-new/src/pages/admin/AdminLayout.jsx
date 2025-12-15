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
  Input,
  Badge,
  Dropdown,
  Popover,
  List,
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
  SearchOutlined,
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import "./adminHeader.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem("adminDarkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = React.useRef(null);

  // Notifications (reviews) state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const reviewsRef = React.useRef([]);
  const pollRef = React.useRef(null);
  const LAST_SEEN_KEY = "admin_last_seen_reviews";
  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    // Save preference
    localStorage.setItem("adminDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    message.success(`${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };

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
    const checkAuth = async () => {
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
            setUserId(userData.id);
            if (userData.avatar_url) {
              setAvatarUrl(userData.avatar_url);
            }

            // Fetch latest user data
            try {
              const response = await api.get('/users/me/');
              setAdminName(response.data.username || response.data.email || "Admin");
              setAvatarUrl(response.data.avatar_url);
              setUserId(response.data.id);
              
              // Update local storage
              localStorage.setItem("user", JSON.stringify({
                  ...userData,
                  ...response.data
              }));
            } catch (err) {
              console.error("Failed to fetch user profile", err);
            }

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
        // If no user data in local storage but token exists, try to fetch
        try {
            const response = await api.get('/users/me/');
            if (response.data.is_superuser) {
                setAdminName(response.data.username || response.data.email || "Admin");
                setAvatarUrl(response.data.avatar_url);
                setUserId(response.data.id);
                localStorage.setItem("user", JSON.stringify(response.data));
                setLoading(false);
            } else {
                 message.error("You do not have permission to access the admin page");
                 navigate("/");
            }
        } catch (err) {
            console.error("Failed to fetch user profile", err);
            setLoading(false);
             navigate("/login?redirect=admin");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch latest reviews for admin notifications and poll periodically
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get('/reviews/?ordering=-created_at&page_size=6');
      const data = res.data.results ? res.data.results : res.data;
      setReviews(data);
      reviewsRef.current = data;

      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      if (!lastSeen) {
        setUnreadCount(data.length || 0);
      } else {
        const last = new Date(lastSeen);
        const newCount = (data || []).filter((r) => new Date(r.created_at) > last).length;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error('Failed to fetch reviews for notifications', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    // Start polling once initial auth/loading resolved
    if (!loading) {
      fetchReviews();
      pollRef.current = setInterval(fetchReviews, 10000); // poll every 10s
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [loading]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!userId) {
        message.error("User ID not found");
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post(`/users/${userId}/upload_avatar/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(response.data.avatar_url);
      message.success("Avatar updated successfully");
      
      // Update local storage
      const userDataStr = localStorage.getItem("user");
      if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userData.avatar_url = response.data.avatar_url;
          localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      message.error("Failed to update avatar");
      console.error(error);
    }
  };

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
    if (path.includes("/admin/help")) return "help";
    return "dashboard";
  };

  // Get active tab label
  const getActiveTabLabel = () => {
    const key = getSelectedKey();
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Return a React icon element for the active tab
  const getActiveTabIcon = () => {
    const key = getSelectedKey();
    switch (key) {
      case "dashboard":
        // show Home icon for dashboard to give a modern feel
        return <HomeOutlined style={{ fontSize: 18 }} />;
      case "products":
        return <AppstoreOutlined style={{ fontSize: 18 }} />;
      case "orders":
        return <ShoppingOutlined style={{ fontSize: 18 }} />;
      case "users":
        return <UserOutlined style={{ fontSize: 18 }} />;
      case "categories":
        return <TagOutlined style={{ fontSize: 18 }} />;
      case "help":
        return <QuestionCircleOutlined style={{ fontSize: 18 }} />;
      default:
        return <DashboardOutlined style={{ fontSize: 18 }} />;
    }
  };

  const _adminInitial = adminName ? adminName.charAt(0).toUpperCase() : "A";

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
        key: "help",
        icon: <QuestionCircleOutlined />,
        label: "Help",
        onClick: () => navigate("/admin/help"),
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
        className={darkMode ? 'dark-mode' : ''}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 1000,
          background: darkMode 
            ? "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #1a1f3a 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
          boxShadow: darkMode
            ? "2px 0 8px rgba(0, 0, 0, 0.3)"
            : "2px 0 12px rgba(99, 102, 241, 0.08), inset -1px 0 0 rgba(99, 102, 241, 0.05)",
          borderRight: darkMode 
            ? "1px solid rgba(148, 163, 184, 0.1)"
            : "1px solid rgba(226, 232, 240, 0.8)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className={`gencart-sidebar-top ${collapsed ? 'compact' : ''}`}>
          <div className={`gencart-text-logo ${collapsed ? 'compact' : ''}`}>
            {!collapsed ? (
              <div className="logo-full">
                <span className="logo-gradient">Gen</span>
                <span className="logo-rest">Cart</span>
              </div>
            ) : (
              <div className="logo-compact" aria-hidden role="img" aria-label="Admin logo">
                {/* show a small admin icon when collapsed, with tooltip */}
                <Tooltip title="Admin" placement="right">
                  <UserOutlined className="logo-compact-icon" />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: collapsed ? "12px 10px" : "16px 16px",
            paddingBottom: collapsed ? 120 : 24, // more space for the bottom control
          }}
        >
          <Menu
            theme={darkMode ? "dark" : "light"}
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
        <div className={`gencart-sidebar-bottom ${collapsed ? 'compact' : ''}`}>
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
                background: darkMode 
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(99, 102, 241, 0.15)",
                border: "none",
                color: darkMode ? "#fff" : "#6366f1",
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
          background: darkMode ? "#0f172a" : "#f5f7fb",
        }}
      >
        <Header
          className="gencart-header"
          style={{
            padding: 0,
            background: darkMode 
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "#ffffff",
            boxShadow: darkMode
              ? "0 4px 12px rgba(0, 0, 0, 0.3)"
              : "0 2px 8px rgba(15, 23, 42, 0.06)",
            height: 72,
            borderBottom: darkMode 
              ? "1px solid rgba(148, 163, 184, 0.1)"
              : "1px solid rgba(226, 232, 240, 0.8)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                className="admin-header-title-wrapper"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  position: mobileView ? "relative" : "absolute",
                  left: "2%",
                  gap: 12,
                  padding: "8px 18px",
                  borderRadius: 12,
                  background: darkMode
                    ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                    : "#fff",
                  boxShadow: darkMode
                    ? "0 8px 24px rgba(0, 0, 0, 0.4)"
                    : "0 6px 18px rgba(16,24,40,0.06)",
                  border: darkMode
                    ? "1px solid rgba(148, 163, 184, 0.15)"
                    : "1px solid rgba(81,48,158,0.06)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div
                  className="admin-header-icon"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "auto",
                    height: "auto",
                    borderRadius: 4,
                    background: "transparent",
                    color: darkMode ? "#f59e0b" : "#6366f1",
                    boxShadow: "none",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  {getActiveTabIcon()}
                </div>
                <Title
                  level={4}
                  className="admin-header-title-text"
                  style={{
                    color: darkMode ? "#f1f5f9" : "#271a51",
                    fontWeight: 700,
                    margin: 0,
                    fontSize: 18,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {getActiveTabLabel()}
                </Title>
              </div>
            <div style={{ display: "flex", alignItems: "center", gap: mobileView ? 8 : 8 }}>
              <div
                className="admin-search-box"
                style={{
                  background: darkMode ? "#1e293b" : "#fff",
                  borderRadius: "30px",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: mobileView ? "150px" : "260px",
                  boxShadow: darkMode
                    ? "0 4px 12px rgba(0,0,0,0.3)"
                    : "0 4px 12px rgba(0,0,0,0.03)",
                  border: darkMode
                    ? "1px solid rgba(148, 163, 184, 0.15)"
                    : "1px solid rgba(0,0,0,0.02)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: 'relative'
                }}
              >
                <SearchOutlined style={{ 
                  color: darkMode ? "#94a3b8" : "#8c90aa", 
                  fontSize: "18px",
                  transition: "color 0.3s ease",
                  flexShrink: 0,
                }} />
                <input
                  type="text"
                  placeholder="Search"
                  style={{ 
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: "14px",
                    color: darkMode ? "#e2e8f0" : "#2d3748",
                    fontFamily: "inherit",
                    paddingRight: mobileView ? 0 : 70,
                  }}
                  className="admin-search-input"
                />
                {/* Small integrated icons inside the search box */}
                <div className="admin-search-icons" style={{display: mobileView ? 'none' : 'flex', gap: 8}}>
                  <Popover
                    placement="bottomRight"
                    trigger="click"
                    getPopupContainer={tooltipContainer}
                    overlayClassName="admin-review-popover"
                    overlayStyle={{ maxWidth: 420, zIndex: 2000 }}
                    content={
                      <div style={{ width: 360, maxHeight: 360, overflow: 'hidden' }}>
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                          <List
                            loading={reviewsLoading}
                            dataSource={reviews}
                            locale={{ emptyText: 'No recent reviews' }}
                            renderItem={(item) => (
                              <List.Item key={item.id} style={{ padding: 8 }}>
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      size={40}
                                      src={item.user_avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.user_name || item.user}`}
                                    />
                                  }
                                  title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                      <div>
                                        <div style={{ fontWeight: 600 }}>{item.user_name || item.user}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{item.title || ''}</div>
                                      </div>
                                      <div style={{ textAlign: 'right', minWidth: 90 }}>
                                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(item.created_at).toLocaleString()}</div>
                                        <div style={{ color: darkMode ? '#fbbf24' : '#f59e0b' }}>{item.rating}★</div>
                                      </div>
                                    </div>
                                  }
                                  description={<div style={{ whiteSpace: 'normal' }}>{item.comment}</div>}
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          <Button type="link" onClick={() => navigate('/admin/reviews')}>View all</Button>
                        </div>
                      </div>
                    }
                    onVisibleChange={(visible) => {
                      if (visible) {
                        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
                        setUnreadCount(0);
                      }
                    }}
                  >
                    <Badge count={unreadCount} showZero={false} offset={[-2, 0]}>
                      <div
                        className="admin-search-icon-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BellOutlined style={{ fontSize: 16, color: darkMode ? '#e2e8f0' : '#68729e'}} />
                      </div>
                    </Badge>
                  </Popover>

                  <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <div
                      onClick={toggleDarkMode}
                      className="admin-search-icon-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {darkMode ? (
                        <SunOutlined style={{ fontSize: 16, color: '#fbbf24' }} />
                      ) : (
                        <MoonOutlined style={{ fontSize: 16, color: '#6366f1' }} />
                      )}
                    </div>
                  </Tooltip>

                  <Tooltip title="Help">
                    <div
                      className="admin-search-icon-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <QuestionCircleOutlined style={{ fontSize: 16, color: darkMode ? '#e2e8f0' : '#68729e' }} />
                    </div>
                  </Tooltip>
                </div>
              </div>

              <Space size={mobileView ? 8 : 8} align="center">

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'home',
                        icon: <HomeOutlined />,
                        label: 'Home',
                        onClick: () => navigate("/")
                      },
                      {
                        key: 'change-avatar',
                        icon: <UploadOutlined />,
                        label: 'Change Avatar',
                        onClick: () => fileInputRef.current.click()
                      },
                      {
                        type: 'divider'
                      },
                      {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: 'Logout',
                        onClick: handleLogout
                      }
                    ]
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <Avatar
                    size={40}
                    src={avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"}
                    style={{
                      cursor: "pointer",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      backgroundColor: "#8b5cf6"
                    }}
                  >
                    {_adminInitial}
                  </Avatar>
                </Dropdown>
              </Space>
            </div>
          </div>
        </Header>
        <Content
          style={{
            // reduce the space above content so it sits closer to the header
            // moved up slightly more per design request
            margin: mobileView ? "4px 8px" : "4px 16px",
            padding: 0,
            background: "transparent",
            minHeight: 280,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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