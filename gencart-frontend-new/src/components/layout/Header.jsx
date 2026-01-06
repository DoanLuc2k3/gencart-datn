import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../../utils/api';
import { useNavigate } from "react-router-dom";
import { Layout, Input, message, Badge, Popover } from "antd";
import { SearchOutlined, MenuOutlined, BellOutlined, EllipsisOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useCart } from "../../context/CartContext";
import Logo from "./Logo";
import NavigationMenu from "./NavigationMenu";
import CartButton from "../cart/CartButton";
import UserAvatar from "../user/UserAvatar";
import UserMenu from "../user/UserMenu";
import WalletButton from "../blockchain/WalletButton";
import "./UserMenu.css";
 
const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header = () => {
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [navMenuVisible, setNavMenuVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [notificationCount, setNotificationCount] = useState(0);

  // State for user authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // State for categories and mobile
  const [categories, setCategories] = useState([]);
  const [, setCategoriesLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 990);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access_token");
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Try to get user data from localStorage first
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
          } catch (error) {
            console.error("Error parsing stored user data:", error);
          }
        }

        // Also fetch fresh user data from API
        const fetchUserData = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/users/me/`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              setUserData(data);
              localStorage.setItem("user", JSON.stringify(data));
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        };

        fetchUserData();
      } else {
        setUserData(null);
      }
    };

    checkLoginStatus();

    const handleStorageChange = () => checkLoginStatus();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login', handleStorageChange);
    window.addEventListener('logout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleStorageChange);
      window.removeEventListener('logout', handleStorageChange);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUserData(null);

    // window.dispatchEvent(new Event('logout'));
    navigate("/login");
    message.success("Logged out successfully!");
  };

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.results || data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const showUserMenu = () => setUserMenuVisible(true);
  const closeUserMenu = () => setUserMenuVisible(false);
  const showNavMenu = () => {
    setNavMenuVisible(true);
    // small delay to allow mount before starting transition
    window.setTimeout(() => setDrawerOpen(true), 10);
  };

  const closeNavMenu = () => {
    // start closing animation then unmount
    setDrawerOpen(false);
    window.setTimeout(() => setNavMenuVisible(false), 260);
  };

  const handleActionsVisibleChange = (visible) => setActionsVisible(visible);
  
  const handleSearch = (value) => {
    if (value) navigate(`/products?search=${value}`);
  };

  const isAdmin = userData && userData.is_superuser;

  return (
    <>
      <AntHeader
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          padding: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          height: isMobile ? "56px" : "clamp(64px, 10vw, 72px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: isMobile ? "100vw" : "1400px",
            margin: "0 auto",
            padding: isMobile ? "0 8px" : "0 clamp(12px, 3vw, 24px)",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Logo />
            {!isMobile && <NavigationMenu categories={categories} isAdmin={isAdmin} />}
            {isMobile && (
              <MenuOutlined
                style={{
                  fontSize: "28px",
                  color: "white",
                  cursor: "pointer",
                  marginLeft: "8px",
                  padding: "6px",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.08)",
                }}
                onClick={showNavMenu}
                title="Mở menu điều hướng"
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "clamp(8px, 2vw, 16px)",
              flex: "0 0 auto",
            }}
          >
            {!isMobile && <WalletButton />}

            {isMobile ? (
              <Popover
                content={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8, minWidth: 160 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => { setActionsVisible(false); navigate('/notifications'); }}
                    >
                      <Badge count={notificationCount} offset={[2, -6]} size="small">
                        <BellOutlined style={{ fontSize: 18, color: '#0f172a' }} />
                      </Badge>
                      <span style={{ fontSize: 14, color: '#0f172a' }}>Thông báo</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <WalletButton />
                    </div>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => { setActionsVisible(false); navigate('/cart'); }}
                    >
                      <ShoppingCartOutlined style={{ fontSize: 18, color: '#0f172a' }} />
                      <span style={{ fontSize: 14, color: '#0f172a' }}>Giỏ hàng</span>
                    </div>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => { setActionsVisible(false); showUserMenu(); }}
                    >
                      <UserAvatar userData={userData} isLoggedIn={isLoggedIn} showUserMenu={showUserMenu} />
                      <span style={{ fontSize: 14, color: '#0f172a' }}>Tài khoản</span>
                    </div>
                  </div>
                }
                trigger="click"
                placement="bottomRight"
                visible={actionsVisible}
                onVisibleChange={handleActionsVisibleChange}
                overlayStyle={{ borderRadius: 8 }}
              >
                <EllipsisOutlined
                  style={{
                    fontSize: 22,
                    color: '#ffffff',
                    transform: 'rotate(90deg)',
                    cursor: 'pointer',
                    padding: 6,
                    background: 'rgba(0,0,0,0.08)',
                    borderRadius: 6,
                  }}
                />
              </Popover>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "2px" : "clamp(4px, 1.2vw, 8px)" }}>
                  <div
                    style={{
                      position: "relative",
                      padding: isMobile ? "6px" : "clamp(8px, 1.5vw, 12px)",
                      borderRadius: "clamp(12px, 2vw, 16px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      minWidth: isMobile ? "36px" : "clamp(40px, 6vw, 52px)",
                      minHeight: isMobile ? "36px" : "clamp(40px, 6vw, 52px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                    }}
                    title="Notifications"
                  >
                    <Badge
                      count={notificationCount}
                      size="default"
                      showZero={false}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        backgroundColor: "#ff6b6b",
                        border: "2px solid white",
                      }}
                      offset={[2, -2]}
                    >
                      <BellOutlined
                        style={{
                          fontSize: isMobile ? "18px" : "clamp(18px, 2.5vw, 22px)",
                          color: "black",
                        }}
                        onClick={() => navigate("/notifications")}
                      />
                    </Badge>
                  </div>

                  <CartButton cartCount={cartCount} />
                </div>

                <UserAvatar 
                  userData={userData}
                  isLoggedIn={isLoggedIn}
                  showUserMenu={showUserMenu}
                />
              </>
            )}
          </div>
        </div>
      </AntHeader>

      <UserMenu
        userMenuVisible={userMenuVisible}
        closeUserMenu={closeUserMenu}
        isLoggedIn={isLoggedIn}
        userData={userData}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
        cartCount={cartCount}
        isMobile={isMobile}
        categories={categories}
        categoriesExpanded={categoriesExpanded}
        setCategoriesExpanded={setCategoriesExpanded}
      />

      {/* NavigationMenu overlay for mobile */}
      {isMobile && navMenuVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: drawerOpen ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)",
            transition: "background 220ms ease",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
          }}
          onClick={closeNavMenu}
        >
          <div
            style={{
              background: "white",
              width: "80vw",
              maxWidth: "340px",
              height: "100vh",
              boxShadow: "2px 0 16px rgba(0,0,0,0.12)",
              padding: "24px 16px 16px 16px",
              overflowY: "auto",
              transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 260ms cubic-bezier(0.2,0.8,0.2,1)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={closeNavMenu}
                aria-label="Đóng menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ×
              </button>
            </div>
            <NavigationMenu categories={categories} isAdmin={isAdmin} menuMode="inline" onClose={closeNavMenu} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;