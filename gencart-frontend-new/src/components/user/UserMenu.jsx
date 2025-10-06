import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Badge } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  TagsOutlined,
  DownOutlined,
  LaptopOutlined,
  SkinOutlined,
  MobileOutlined,
  FireOutlined,
} from "@ant-design/icons";

const UserMenu = ({
  userMenuVisible,
  closeUserMenu,
  isLoggedIn,
  userData,
  isAdmin,
  handleLogout,
  cartCount,
  isMobile,
  categories,
  categoriesExpanded,
  setCategoriesExpanded,
}) => {
  // Get category icon helper function
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Electronics: <LaptopOutlined />,
      Clothing: <SkinOutlined />,
      "Home & Kitchen": <HomeOutlined />,
      "Phones & Accessories": <MobileOutlined />,
      Fashion: <SkinOutlined />,
      Technology: <LaptopOutlined />,
      Books: <AppstoreOutlined />,
      Sports: <FireOutlined />,
    };
    return iconMap[categoryName] || <TagsOutlined />;
  };

  return (
    <>
      {/* Custom User Menu Offcanvas */}
      <div
        className={`user-menu-overlay ${userMenuVisible ? "visible" : ""}`}
        onClick={closeUserMenu}
      ></div>
      <div className={`user-menu ${userMenuVisible ? "visible" : ""}`}>
        <div className="user-menu-header">
          <h3>User Menu</h3>
          <button className="user-menu-close" onClick={closeUserMenu}>
            ×
          </button>
        </div>

        {isLoggedIn ? (
          <>
            <div className="user-menu-profile">
              <Avatar
                size={64}
                src={userData?.avatar_url}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: userData?.avatar_url
                    ? "transparent"
                    : "#1677ff",
                }}
              />
              <h3>
                {userData
                  ? `${userData.first_name} ${userData.last_name}`.trim() ||
                    userData.username
                  : "User"}
              </h3>
              <p style={{ color: "#666" }}>{userData?.email || ""}</p>
            </div>

            <ul className="user-menu-items">
              {/* Navigation Section - Only on Mobile */}
              {isMobile && (
                <>
                  <li className="user-menu-section-title">Navigation</li>
                  <li className="user-menu-item" onClick={closeUserMenu}>
                    <Link
                      to="/"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <HomeOutlined
                        style={{ marginRight: "10px", fontSize: "18px" }}
                      />
                      <span style={{ fontWeight: "500" }}>Home</span>
                    </Link>
                  </li>
                  <li className="user-menu-item" onClick={closeUserMenu}>
                    <Link
                      to="/products"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <AppstoreOutlined
                        style={{ marginRight: "10px", fontSize: "18px" }}
                      />
                      <span style={{ fontWeight: "500" }}>All Products</span>
                    </Link>
                  </li>
                  
                  {/* Categories toggle button */}
                  <li className="user-menu-item" 
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: categoriesExpanded ? "rgba(102, 126, 234, 0.1)" : "transparent"
                      }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <TagsOutlined
                          style={{ marginRight: "10px", fontSize: "18px" }}
                        />
                        <span style={{ fontWeight: "500" }}>Categories</span>
                      </div>
                      <DownOutlined
                        style={{ 
                          fontSize: "12px",
                          transform: categoriesExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease"
                        }}
                      />
                    </div>
                  </li>
                  
                  {/* Categories submenu for mobile - Collapsible */}
                  {categoriesExpanded && categories.map((category) => (
                    <li key={`mobile-cat-${category.id}`} className="user-menu-item" onClick={closeUserMenu}>
                      <Link
                        to={`/products?category=${encodeURIComponent(category.name)}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          paddingLeft: "30px",
                          backgroundColor: "rgba(0,0,0,0.02)",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#667eea" }}>
                          {getCategoryIcon(category.name)}
                        </span>
                        <span style={{ fontWeight: "400", fontSize: "14px" }}>{category.name}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="user-menu-divider"></li>
                </>
              )}

              {/* Account Section */}
              <li className="user-menu-section-title">My Account</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>Profile</span>
                </Link>
              </li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/orders"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ShoppingOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>View My Orders</span>
                </Link>
              </li>

              {/* Shopping Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">Shopping</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/cart"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ShoppingCartOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>My Cart</span>
                  {cartCount > 0 && (
                    <Badge
                      count={cartCount}
                      size="small"
                      style={{ marginLeft: "8px" }}
                    />
                  )}
                </Link>
              </li>

              {/* Other Section */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">More</li>
              {isAdmin && (
                <li className="user-menu-item" onClick={closeUserMenu}>
                  <Link
                    to="/admin"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <SettingOutlined
                      style={{ marginRight: "10px", fontSize: "18px" }}
                    />
                    <span style={{ fontWeight: "500" }}>Admin Panel</span>
                  </Link>
                </li>
              )}
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/about"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <InfoCircleOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>About Us</span>
                </Link>
              </li>
              <li className="user-menu-divider"></li>
              <li
                className="user-menu-item danger"
                onClick={() => {
                  handleLogout();
                  closeUserMenu();
                }}
                style={{ marginTop: "10px" }}
              >
                <LogoutOutlined
                  style={{ marginRight: "10px", fontSize: "18px" }}
                />
                <span style={{ fontWeight: "500" }}>Logout</span>
              </li>
            </ul>
          </>
        ) : (
          <>
            {/* User not logged in */}
            <div className="user-menu-profile" style={{ textAlign: "center", padding: "20px" }}>
              <h3 style={{ marginBottom: "20px" }}>Welcome!</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>Please login to access your account</p>
            </div>

            <ul className="user-menu-items">
              {/* Navigation Section - Only on Mobile */}
              {isMobile && (
                <>
                  <li className="user-menu-section-title">Navigation</li>
                  <li className="user-menu-item" onClick={closeUserMenu}>
                    <Link
                      to="/"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <HomeOutlined
                        style={{ marginRight: "10px", fontSize: "18px" }}
                      />
                      <span style={{ fontWeight: "500" }}>Home</span>
                    </Link>
                  </li>
                  <li className="user-menu-item" onClick={closeUserMenu}>
                    <Link
                      to="/products"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <AppstoreOutlined
                        style={{ marginRight: "10px", fontSize: "18px" }}
                      />
                      <span style={{ fontWeight: "500" }}>All Products</span>
                    </Link>
                  </li>
                  
                  {/* Categories toggle button */}
                  <li className="user-menu-item" 
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: categoriesExpanded ? "rgba(102, 126, 234, 0.1)" : "transparent"
                      }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <TagsOutlined
                          style={{ marginRight: "10px", fontSize: "18px" }}
                        />
                        <span style={{ fontWeight: "500" }}>Categories</span>
                      </div>
                      <DownOutlined
                        style={{ 
                          fontSize: "12px",
                          transform: categoriesExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease"
                        }}
                      />
                    </div>
                  </li>
                  
                  {/* Categories submenu for mobile - Collapsible */}
                  {categoriesExpanded && categories.map((category) => (
                    <li key={`mobile-guest-cat-${category.id}`} className="user-menu-item" onClick={closeUserMenu}>
                      <Link
                        to={`/products?category=${encodeURIComponent(category.name)}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          paddingLeft: "30px",
                          backgroundColor: "rgba(0,0,0,0.02)",
                        }}
                      >
                        <span style={{ marginRight: "10px", color: "#667eea" }}>
                          {getCategoryIcon(category.name)}
                        </span>
                        <span style={{ fontWeight: "400", fontSize: "14px" }}>{category.name}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="user-menu-divider"></li>
                </>
              )}

              {/* Authentication Section */}
              <li className="user-menu-section-title">Account</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>Login</span>
                </Link>
              </li>
              
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>Register</span>
                </Link>
              </li>

              {/* Shopping Section - available for all users */}
              <li className="user-menu-divider"></li>
              <li className="user-menu-section-title">Shopping</li>
              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/cart"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ShoppingCartOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>My Cart</span>
                  {cartCount > 0 && (
                    <Badge
                      count={cartCount}
                      size="small"
                      style={{ marginLeft: "8px" }}
                    />
                  )}
                </Link>
              </li>

              <li className="user-menu-item" onClick={closeUserMenu}>
                <Link
                  to="/about"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <InfoCircleOutlined
                    style={{ marginRight: "10px", fontSize: "18px" }}
                  />
                  <span style={{ fontWeight: "500" }}>About Us</span>
                </Link>
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default UserMenu;