import React, { useState } from "react";
import "./NavigationMenu.css";
import { Link } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import {
  AppstoreOutlined,
  DownOutlined,
  LaptopOutlined,
  SkinOutlined,
  HomeOutlined,
  MobileOutlined,
  FireOutlined,
  TagsOutlined,
  BookOutlined,
} from "@ant-design/icons";

const NavigationMenu = ({ categories, isAdmin, menuMode = "horizontal", onClose }) => {
  const [categorySearch, setCategorySearch] = useState("");
  // Get category icon helper function
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Electronics: <LaptopOutlined />,
      Clothing: <SkinOutlined />,
      "Home & Kitchen": <HomeOutlined />,
      "Phone & Accessories": <MobileOutlined />,
      Fashion: <SkinOutlined />,
      Technology: <LaptopOutlined />,
      Books: <BookOutlined />,
      "Sports & Outdoors": <FireOutlined />,
    };
    return iconMap[categoryName] || <TagsOutlined />;
  };

  // Filter categories by search input
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );

  // Styles used for a more modern look
  const styles = {
    dropdownOverlay: {
      minWidth: "260px",
      borderRadius: "12px",
      boxShadow: "0 12px 30px rgba(2,6,23,0.12)",
      border: "1px solid rgba(15,23,42,0.06)",
      padding: "8px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.85))",
    },
    searchInput: {
      width: "100%",
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(15,23,42,0.08)",
      marginBottom: "8px",
      outline: "none",
      fontSize: "13px",
    },
    categoryLink: {
      display: "flex",
      alignItems: "center",
      padding: "6px 8px",
      fontWeight: 500,
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.6px",
      color: "#0f172a",
      textDecoration: "none",
      borderRadius: "8px",
      transition: "background 160ms ease, transform 160ms ease",
    },
    categoryIconCircle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      marginRight: "10px",
      background: "rgba(102,126,234,0.12)",
      color: "#4f46e5",
      flex: "0 0 30px",
    },
  };

  // Categories dropdown menu for products (includes a search box)
  const categoriesDropdownItems = {
    items: [
      {
        key: "search",
        label: (
          <div style={{ padding: "6px 6px 2px 6px" }}>
            <input
              aria-label="Tìm kiếm danh mục"
              placeholder="Tìm danh mục..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        ),
      },
      {
        key: "all-products",
        label: (
          <Link to="/products" style={{ ...styles.categoryLink, fontWeight: 500 }} onClick={() => onClose && onClose()}>
            <span style={styles.categoryIconCircle}>
              <AppstoreOutlined />
            </span>
            Tất cả sản phẩm
          </Link>
        ),
      },
      {
        type: "divider",
      },
      ...filteredCategories.map((category) => ({
        key: `category-${category.id}`,
        label: (
          <Link
            to={`/products?category=${encodeURIComponent(category.name)}`}
            style={styles.categoryLink}
            onClick={() => onClose && onClose()}
          >
            <span style={styles.categoryIconCircle}>{getCategoryIcon(category.name)}</span>
            {category.name}
          </Link>
        ),
      })),
    ],
  };

  const menuItems = [
    {
      key: "home",
      label: (
        <Link to="/" style={{ fontWeight: 500 }}>
          <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.6px" }}>Trang chủ</span>
        </Link>
      ),
    },
    {
      key: "products",
      label:
        menuMode === "inline" ? (
          <Link to="/products" style={{ fontWeight: 500 }} onClick={() => onClose && onClose()}>
            <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.6px" }}>Sản phẩm</span>
          </Link>
        ) : (
          <Dropdown
            menu={categoriesDropdownItems}
            trigger={['hover']}
            placement="bottomLeft"
            overlayStyle={{
              minWidth: "220px",
              borderRadius: "12px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span
              style={{
                fontWeight: 500,
                color: "#0f172a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderRadius: "10px",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
              onClick={(e) => e.preventDefault()}
            >
              Sản phẩm
              <DownOutlined style={{ fontSize: "10px", color: "#6b7280" }} />
            </span>
          </Dropdown>
        ),
    },
    {
      key: "about",
      label: (
        <Link to="/about" style={{ fontWeight: 500 }}>
          <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.6px" }}>Về chúng tôi</span>
        </Link>
      ),
    },
    {
      key: "blog",
      label: (
        <Link to="/blog" style={{ fontWeight: 500 }}>
          <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.6px" }}>Blog</span>
        </Link>
      ),
    },
    {
      key: "contact",
      label: (
        <Link to="/contact" style={{ fontWeight: 500 }}>
          <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.6px" }}>Liên hệ</span>
        </Link>
      ),
    },
    // Add admin link if user is admin
    ...(isAdmin
      ? [
          {
            key: "admin",
              label: (
              <Link to="/admin" style={{ textDecoration: "none", fontWeight: 500 }}>
                <span style={{ color: "#0f172a", textTransform: "uppercase", fontSize: "13px", letterSpacing: "0.6px" }}>Quản trị</span>
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <Menu
      mode={menuMode}
      disabledOverflow={true}
      defaultSelectedKeys={["home"]}
      items={menuItems}
      className={menuMode === "horizontal" ? "desktop-menu" : "mobile-menu"}
      style={
        menuMode === "horizontal"
          ? {
              border: "none",
              background: "transparent",
              fontSize: "clamp(12px, 1.6vw, 13px)",
              minWidth: "auto",
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            }
          : {
              border: "none",
              background: "transparent",
              fontSize: "14px",
              minWidth: "100%",
              display: "block",
              textAlign: "left",
            }
      }
    />
  );
};

export default NavigationMenu;