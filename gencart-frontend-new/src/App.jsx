import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout, ConfigProvider, Spin } from "antd";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { mainnet, polygon, bsc, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import "./App.css";

// Context
import { CartProvider } from "./context/CartContext";

// Components - Eager loading for critical UI
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Wagmi Configuration
const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, polygon, bsc],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});

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
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminHelp = lazy(() => import("./pages/admin/AdminHelp"));
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
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
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
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="help" element={<AdminHelp />} />
              </Route>

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
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
