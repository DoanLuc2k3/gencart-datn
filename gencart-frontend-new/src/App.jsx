import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, ConfigProvider, Spin } from "antd";
import "./App.css";

// Context
import { CartProvider } from "./context/CartContext";

// Components - Eager loading for critical UI
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages - Lazy loading for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductListPage = lazy(() => import("./pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const { Content } = Layout;

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
        },
      }}
    >
      <CartProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Admin route with its own layout */}
              <Route path="/admin/*" element={<AdminPage />} />

              {/* Regular routes with standard layout */}
              <Route
                path="/*"
                element={
                  <Layout className="layout">
                    <Header />
                    <Layout>
                      <Content
                        className="site-layout-content"
                        style={{
                          margin: 0,
                          minHeight: "calc(100vh - 72px)",
                          background:
                            "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                        }}
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                              path="/products"
                              element={<ProductListPage />}
                            />
                            <Route
                              path="/products/:id"
                              element={<ProductDetailPage />}
                            />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route
                              path="/orders/:id"
                              element={<OrderDetailsPage />}
                            />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </Suspense>
                      </Content>
                      <Footer />
                    </Layout>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </ConfigProvider>
  );
}

export default App;
