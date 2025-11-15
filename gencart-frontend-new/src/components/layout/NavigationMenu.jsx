import React from "react";
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

const NavigationMenu = ({ categories, isAdmin }) => {
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

  // Categories dropdown menu for products
  const categoriesDropdownItems = {
    items: [
      {
        key: 'all-products',
        label: (
          <Link
            to="/products"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              fontWeight: "600",
              color: "#374151",
              textDecoration: "none",
            }}
          >
            <span style={{ marginRight: "8px", color: "#667eea" }}>
              <AppstoreOutlined />
            </span>
            All Products
          </Link>
        ),
      },
      {
        type: 'divider',
      },
      ...categories.map((category) => ({
        key: `category-${category.id}`,
        label: (
          <Link
            to={`/products?category=${encodeURIComponent(category.name)}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              fontWeight: "500",
              color: "#374151",
              textDecoration: "none",
            }}
          >
            <span style={{ marginRight: "8px", color: "#667eea" }}>
              {getCategoryIcon(category.name)}
            </span>
            {category.name}
          </Link>
        ),
      }))
    ],
  };

  const menuItems = [
    {
      key: "home",
      label: (
        <Link
          to="/"
          style={{
            fontWeight: "600",
          }}
        >
          <span style={{ color: "black" }}>Home</span>
        </Link>
      ),
    },
    {
      key: "products",
      label: (
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
              fontWeight: "600",
              color: "black",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            onClick={(e) => e.preventDefault()}
          >
            Products
            <DownOutlined style={{ fontSize: "10px" }} />
          </span>
        </Dropdown>
      ),
    },
    {
      key: "about",
      label: (
        <Link
          to="/about"
          style={{
            fontWeight: "600",
          }}
        >
          <span style={{ color: "black" }}>About Us</span>
        </Link>
      ),
    },
    // Add admin link if user is admin
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: (
              <Link
                to="/admin"
                style={{
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                <span style={{ color: "black" }}>Dashboard</span>
              </Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <Menu
      defaultSelectedKeys={["home"]}
      items={menuItems}
      className="desktop-menu"
      style={{
        border: "none",
        background: "white",
        fontSize: "clamp(14px, 2.2vw, 16px)",
        lineHeight: "clamp(64px, 10vw, 72px)",
        minWidth: "auto",
        height: "clamp(64px, 10vw, 72px)",
        display: "flex",
        alignItems: "center",
        textAlign: "center",
      }}
    />
  );
};

export default NavigationMenu;