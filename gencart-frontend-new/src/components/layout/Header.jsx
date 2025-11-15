import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Input, message } from "antd";
import { SearchOutlined, MenuOutlined } from "@ant-design/icons";
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
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // State for user authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // State for categories and mobile
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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
            const response = await fetch("http://localhost:8000/api/users/me/", {
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
        const response = await fetch("http://localhost:8000/api/categories/");
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
          padding: "0",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          height: "clamp(64px, 10vw, 72px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 clamp(12px, 3vw, 24px)",
            height: "100%",
          }}
        >
          <div>
            <Logo />
            <NavigationMenu categories={categories} isMobile={isMobile} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 2vw, 16px)",
              flex: "0 0 auto",
            }}
          >
            <WalletButton />

            <CartButton cartCount={cartCount} />

            <UserAvatar 
              userData={userData}
              isLoggedIn={isLoggedIn}
              showUserMenu={showUserMenu}
            />

            <div style={{ display: isMobile ? "block" : "none" }}>
              <MenuOutlined
                style={{
                  fontSize: "clamp(20px, 3vw, 24px)",
                  color: "white",
                  cursor: "pointer",
                  padding: "8px",
                }}
                onClick={showUserMenu}
              />
            </div>
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
    </>
  );
};

export default Header;