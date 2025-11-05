import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Spin,
  message,
  Select,
  Segmented,
  Progress,
  Divider,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useResponsive } from "../../hooks/useResponsive";

// Lazy load heavy chart component
const SentimentChart = lazy(() => import("../../components/admin/SentimentChart"));

const { Title, Text } = Typography;

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const AdminDashboard = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalReviews: 0,
    productsWithReviews: 0,
    recentOrders: [],
  });
  const [sentimentTrends, setSentimentTrends] = useState(null);
  const [sentimentAlerts, setSentimentAlerts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [mode, setMode] = useState("global"); // 'global' | 'product'
  const [sentimentStats, setSentimentStats] = useState(null);
  // Chart UX controls (apply to Global only)
  const [chartMode, setChartMode] = useState("percent"); // 'percent' | 'counts'
  const [minDailyTotal, setMinDailyTotal] = useState(0); // hide days with total reviews less than this

  console.log("AdminDashboard rendered, loading:", loading);

  // Fetch sentiment data first (needed by fetchDashboardStats)
  const loadSentimentData = useCallback(
    async (productId, targetMode) => {
      const actualProductId = productId !== undefined ? productId : selectedProductId;
      const actualMode = targetMode !== undefined ? targetMode : mode;
      
      // Use the simplified, unauthenticated endpoints. Try port 8001, then 8000.
      const buildUrl = (port, path) => `http://localhost:${port}${path}`;
      const ports = [8001, 8000];
      const productQuery =
        actualMode === "product" && actualProductId ? `?product_id=${actualProductId}` : "";
      const statsPaths = ports.map((p) =>
        buildUrl(p, `/api/sentiment/statistics/${productQuery}`)
      );
      const trendsPaths = ports.map((p) =>
        buildUrl(
          p,
          `/api/sentiment/trends/?days=30&mode=analyzed${
            productQuery ? `&product_id=${actualProductId}` : ""
          }`
        )
      );

      const tryFetchJson = async (urls) => {
        for (const u of urls) {
          try {
            const r = await fetch(u);
            if (r.ok) return await r.json();
          } catch {
            // try next
          }
        }
        throw new Error(`All endpoints failed: ${urls.join(", ")}`);
      };

      try {
        // 1) Fetch statistics for summary cards
        const statsJson = await tryFetchJson(statsPaths);
        if (statsJson && statsJson.success) {
          const counts = statsJson.sentiment_counts || {
            positive: 0,
            neutral: 0,
            negative: 0,
          };
          const analyzed = statsJson.analyzed_reviews || 0;
          const total = analyzed > 0 ? analyzed : statsJson.total_reviews || 0;
          const pct = (v) =>
            total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
          setSentimentStats({
            counts,
            percents: {
              positive: pct(counts.positive || 0),
              neutral: pct(counts.neutral || 0),
              negative: pct(counts.negative || 0),
            },
            analyzed,
            total_reviews: statsJson.total_reviews || 0,
            unanalyzed_reviews: statsJson.unanalyzed_reviews || 0,
          });
        }

        // 2) Fetch trends for the 30-day distribution chart (kept as before)
        const trendsJson = await tryFetchJson(trendsPaths);
        if (trendsJson && trendsJson.success) {
          setSentimentTrends(trendsJson.data || null);
        }

        // 3) Alerts (optional) - use port fallback same as above
        try {
          const alertUrls = ports.map((p) =>
            buildUrl(p, "/api/products/sentiment_alerts/?negative_percent=40")
          );
          const a = await tryFetchJson(alertUrls);
          setSentimentAlerts(a.alerts || []);
        } catch {
          // best-effort only
        }
      } catch (err) {
        console.warn("Sentiment load failed", err);
      }
    },
    [] // Remove dependencies to avoid infinite loop
  );

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      // Fetch with auth token for no_pagination to work
      const prodRes = await fetch(
        "http://localhost:8000/api/products/?no_pagination=true",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      let products = [];
      let productsTotalCount = 0;
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        products = prodData.results || prodData || [];
        // Prefer API 'count' when pagination is enabled; otherwise fallback to length
        productsTotalCount =
          typeof prodData?.count === "number"
            ? prodData.count
            : Array.isArray(prodData)
            ? prodData.length
            : Array.isArray(prodData?.results)
            ? prodData.results.length
            : products.length;
        setProductsList(products);
      }
      let users = [];
      let orders = [];
      let usersTotalCount = 0;
      let ordersTotalCount = 0;
      if (token) {
        const [userRes, orderRes] = await Promise.all([
          fetch("http://localhost:8000/api/users/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/orders/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          users = userData.results || userData || [];
          usersTotalCount =
            typeof userData?.count === "number"
              ? userData.count
              : Array.isArray(userData)
              ? userData.length
              : Array.isArray(userData?.results)
              ? userData.results.length
              : users.length;
        }
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          orders = orderData.results || orderData || [];
          ordersTotalCount =
            typeof orderData?.count === "number"
              ? orderData.count
              : Array.isArray(orderData)
              ? orderData.length
              : Array.isArray(orderData?.results)
              ? orderData.results.length
              : orders.length;
        }
      }
      const totalRevenue = orders.reduce(
        (s, o) => s + parseFloat(o.total_amount || 0),
        0
      );
      
      // Calculate total reviews from all products
      const totalReviews = products.reduce(
        (sum, p) => sum + (Number(p.total_reviews) || 0),
        0
      );
      
      setStats((s) => ({
        ...s,
        totalOrders: ordersTotalCount,
        totalUsers: usersTotalCount,
        totalProducts: productsTotalCount,
        totalRevenue,
        totalReviews,
        recentOrders: orders.slice(0, 5),
      }));
      // Fetch sentiment overview to get accurate products_with_reviews count
      try {
        const gRes = await fetch(
          "http://localhost:8000/api/products/sentiment_overview/"
        );
        if (gRes.ok) {
          const overviewData = await gRes.json();
          // Store products_with_reviews from sentiment overview
          if (overviewData.products_with_reviews !== undefined) {
            setStats((s) => ({
              ...s,
              productsWithReviews: overviewData.products_with_reviews,
            }));
          }
        }
      } catch (err) {
        console.warn("Global sentiment fetch failed", err);
      }
      let withReviews = products.find((p) => (p.total_reviews || 0) > 0);
      if (withReviews) setSelectedProductId(withReviews.id);
      
      // Load sentiment data separately
      loadSentimentData(withReviews ? withReviews.id : null, "global");
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      message.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // Initialize dashboard on mount
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setAdminName(userData.username || userData.email || "Admin");
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        await fetchDashboardStats();
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = async (value) => {
    setMode(value);
    // reload sentiment data for new mode
    await loadSentimentData(undefined, value);
    // if switching to product and a product already selected, load product-specific data
    if (value === "product" && selectedProductId) {
      await loadSentimentData(selectedProductId, "product");
    }
  };

  const handleProductChange = async (value) => {
    setSelectedProductId(value);
    if (mode === "product") await loadSentimentData(value, "product");
  };

  // Render dashboard content
  const renderDashboard = () => {
    const avgOrderValue =
      stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
    // Use accurate count from sentiment overview API (products_with_reviews)
    // Fallback to counting from productsList if not available
    const productsWithReviews = stats.productsWithReviews > 0 
      ? stats.productsWithReviews 
      : productsList.filter((p) => (p.total_reviews || 0) > 0).length;
    const productCoverage =
      stats.totalProducts > 0
        ? Math.round((productsWithReviews / stats.totalProducts) * 100)
        : 0;
    const pendingOrders = stats.recentOrders.filter((o) =>
      ["processing", "shipped"].includes(o.status)
    ).length;
    const totalReviewsCount = sentimentStats
      ? sentimentStats.total_reviews || sentimentStats.analyzed || 0
      : 0;
    const analyzedPercentage = sentimentStats
      ? totalReviewsCount > 0
        ? Math.round((sentimentStats.analyzed / totalReviewsCount) * 100)
        : sentimentStats.analyzed > 0
        ? 100
        : 0
      : 0;
    const outstandingReviews =
      sentimentStats?.unanalyzed_reviews ??
      (sentimentStats
        ? Math.max(totalReviewsCount - sentimentStats.analyzed, 0)
        : 0);
    const nowLabel = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const highlightCards = [
      {
        key: "orders",
        title: "Total Orders",
        value: formatNumber(stats.totalOrders),
        accent: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        icon: <ShoppingCartOutlined />,
        secondary:
          pendingOrders > 0
            ? `${formatNumber(pendingOrders)} orders pending`
            : "All orders completed",
        footnote:
          stats.recentOrders.length > 0
            ? `${stats.recentOrders.length} new orders in recent list`
            : "No new orders",
      },
      {
        key: "users",
        title: "Users",
        value: formatNumber(stats.totalUsers),
        accent: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
        icon: <UserOutlined />,
        secondary:
          stats.totalUsers > 0
            ? "Growing community"
            : "Invite your first customer",
        footnote: `${formatNumber(stats.totalUsers || 0)} active accounts`,
      },
      {
        key: "products",
        title: "Product Catalog",
        value: formatNumber(stats.totalProducts),
        accent: "linear-gradient(135deg, #f97316 0%, #fb8c42 100%)",
        icon: <AppstoreOutlined />,
        secondary:
          stats.totalProducts > 0
            ? `${formatNumber(productsWithReviews)} products with reviews`
            : "No products yet",
        footnote:
          stats.totalProducts > 0
            ? "Track inventory and description quality"
            : "Add products to start selling",
      },
      {
        key: "revenue",
        title: "Revenue",
        value: formatCurrency(stats.totalRevenue),
        accent: "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
        icon: <DollarOutlined />,
        secondary:
          stats.totalOrders > 0
            ? `Avg: ${formatCurrency(avgOrderValue)}`
            : "No revenue yet",
        footnote:
          stats.totalRevenue > 0
            ? "View details in Orders section"
            : "Revenue will appear when transactions occur",
      },
    ];

    const sentimentPalette = {
      positive: {
        gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        text: "#166534",
      },
      neutral: {
        gradient: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
        text: "#92400e",
      },
      negative: {
        gradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        text: "#991b1b",
      },
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
        <div
          style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 32,
            color: "#fff",
            boxShadow: "0 24px 48px rgba(15, 23, 42, 0.35)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Title level={isMobile ? 3 : 2} style={{ color: "#fff", marginBottom: 8 }}>
                Hello, {adminName}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: isMobile ? 14 : 16 }}>
                Monitor your business performance and customer sentiment at a glance.
              </Text>
              <div
                style={{
                  marginTop: isMobile ? 12 : 20,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Tag color="success" style={{ borderRadius: 16, fontSize: isMobile ? 12 : 14 }}>
                  {formatNumber(stats.totalOrders)} orders
                </Tag>
                <Tag color="processing" style={{ borderRadius: 16, fontSize: isMobile ? 12 : 14 }}>
                  {formatNumber(stats.totalUsers)} customers
                </Tag>
                <Tag color="purple" style={{ borderRadius: 16, fontSize: isMobile ? 12 : 14 }}>
                  {formatNumber(stats.totalProducts)} products
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  padding: isMobile ? 16 : 24,
                  borderRadius: isMobile ? 12 : 20,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 12 : 14 }}>
                  Current Revenue
                </Text>
                <span style={{ fontSize: isMobile ? 24 : 32, fontWeight: 600 }}>
                  {formatCurrency(stats.totalRevenue)}
                </span>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: isMobile ? 12 : 14 }}>
                  Avg: {formatCurrency(avgOrderValue)}
                </Text>
                <Tag
                  style={{
                    width: "fit-content",
                    borderRadius: 16,
                    marginTop: 4,
                    fontSize: isMobile ? 11 : 12,
                  }}
                >
                  Updated {nowLabel}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>

        <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
          {highlightCards.map((card) => (
            <Col xs={24} sm={12} xl={6} key={card.key}>
              <Card
                bordered={false}
                style={{
                  borderRadius: isMobile ? 12 : 20,
                  background: card.accent,
                  color: "#fff",
                  boxShadow: "0 20px 40px rgba(17, 24, 39, 0.25)",
                }}
                bodyStyle={{ padding: isMobile ? 16 : 24 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: isMobile ? 12 : 16,
                  }}
                >
                  <div>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 500,
                      }}
                    >
                      {card.title}
                    </Text>
                    <div
                      style={{
                        fontSize: isMobile ? 24 : 34,
                        fontWeight: 600,
                        marginTop: 8,
                      }}
                    >
                      {card.value}
                    </div>
                    <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: isMobile ? 11 : 13 }}>
                      {card.secondary}
                    </Text>
                  </div>
                  <div style={{ fontSize: isMobile ? 32 : 44, color: "rgba(255,255,255,0.4)" }}>
                    {card.icon}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {card.footnote}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
          <Col xs={24} lg={14}>
            <Card
              title="Recent Orders"
              bordered={false}
              style={{
                borderRadius: isMobile ? 12 : 20,
                boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
              }}
              extra={
                <Button type="link" size={isMobile ? "small" : "default"} onClick={() => navigate("/admin/orders")}>
                  View All
                </Button>
              }
              bodyStyle={{ padding: 0 }}
            >
              <Table
                dataSource={stats.recentOrders}
                rowKey="id"
                scroll={{ x: true }}
                pagination={{ pageSize: 5, showSizeChanger: false }}
                size={isMobile ? "small" : "middle"}
                style={{ padding: isMobile ? 12 : 24 }}
                locale={{ emptyText: "No orders yet" }}
                columns={[
                  {
                    title: "Order ID",
                    dataIndex: "id",
                    key: "id",
                    render: (value) => `#${value}`,
                  },
                  {
                    title: "Customer",
                    key: "customer",
                    render: (_, record) => {
                      if (record.user && record.user.username) {
                        return `@${record.user.username}`;
                      }
                      if (record.user_id) {
                        return `User ${record.user_id}`;
                      }
                      return "Guest";
                    },
                  },
                  {
                    title: "Created Date",
                    dataIndex: "created_at",
                    key: "created_at",
                    render: (text) =>
                      text
                        ? new Date(text).toLocaleDateString("en-US")
                        : "--",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => {
                      let color = "default";
                      if (status === "processing") color = "blue";
                      if (status === "shipped") color = "cyan";
                      if (status === "delivered") color = "green";
                      if (status === "cancelled") color = "red";

                      return <Tag color={color}>{status.toUpperCase()}</Tag>;
                    },
                  },
                  {
                    title: "Total",
                    dataIndex: "total_amount",
                    key: "total_amount",
                    render: (value) => formatCurrency(value),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title="Quick Metrics"
              bordered={false}
              style={{
                borderRadius: isMobile ? 12 : 20,
                boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
                height: "100%",
              }}
            >
              <Space direction="vertical" size={isMobile ? 12 : 20} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Average Order Value</Text>
                  <Tooltip title="Revenue divided by recorded orders">
                    <Tag color="purple" style={{ fontSize: isMobile ? 11 : 12 }}>Details</Tag>
                  </Tooltip>
                </div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  {formatCurrency(avgOrderValue)}
                </Title>
                <Divider style={{ margin: "4px 0" }} />
                <div>
                  <Text type="secondary">Products with Reviews</Text>
                  <Progress
                    percent={productCoverage}
                    strokeColor="#6366f1"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                  <Text style={{ display: "block", color: "#475569" }}>
                    {formatNumber(productsWithReviews)} / {" "}
                    {formatNumber(stats.totalProducts)} products have reviews
                  </Text>
                </div>
                <Divider style={{ margin: "4px 0" }} />
                <div>
                  <Text type="secondary">Orders Pending</Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <span style={{ fontSize: 32, fontWeight: 600 }}>
                      {formatNumber(pendingOrders)}
                    </span>
                    <Text type="secondary">
                      orders in processing or shipping
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card
          title="Sentiment Analysis"
          bordered={false}
          style={{
            borderRadius: isMobile ? 12 : 20,
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{ padding: isMobile ? 12 : 24 }}
          extra={
            <Space wrap size={isMobile ? 8 : 12}>
              <Segmented
                size={isMobile ? "small" : "middle"}
                value={mode}
                onChange={handleModeChange}
                options={[
                  { label: isMobile ? "All" : "Overview", value: "global" },
                  { label: isMobile ? "Prod" : "By Product", value: "product" },
                ]}
              />
              {mode === "global" ? (
                <>
                  <Segmented
                    size="middle"
                    value={chartMode}
                    onChange={(value) => setChartMode(value)}
                    options={[
                      { label: "% per day", value: "percent" },
                      { label: "Counts", value: "counts" },
                    ]}
                  />
                  <Segmented
                    size="middle"
                    value={String(minDailyTotal)}
                    onChange={(value) => setMinDailyTotal(Number(value))}
                    options={[
                      { label: "All", value: "0" },
                      { label: "≥1", value: "1" },
                      { label: "≥3", value: "3" },
                      { label: "≥5", value: "5" },
                    ]}
                  />
                </>
              ) : (
                <Select
                  placeholder="Select product"
                  value={selectedProductId}
                  onChange={handleProductChange}
                  style={{ minWidth: 240 }}
                  showSearch
                  optionFilterProp="label"
                  options={productsList.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.total_reviews || 0})`,
                  }))}
                />
              )}
            </Space>
          }
        >
          {sentimentStats && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {["positive", "neutral", "negative"].map((key) => (
                <Col xs={24} sm={8} key={key}>
                  <div
                    style={{
                      borderRadius: 16,
                      padding: 18,
                      background: sentimentPalette[key].gradient,
                      color: sentimentPalette[key].text,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {key === "positive"
                        ? "Positive"
                        : key === "neutral"
                        ? "Neutral"
                        : "Negative"}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 600 }}>
                      {formatNumber(sentimentStats.counts[key] || 0)}
                    </div>
                    <div style={{ fontSize: 14 }}>
                      {sentimentStats.percents[key]}% of total reviews
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {sentimentStats && (
            <div
              style={{
                borderRadius: 16,
                background: "#f8fafc",
                padding: 20,
                marginBottom: 24,
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={16}>
                  <Text type="secondary">Review Analysis Progress</Text>
                  <Progress
                    percent={analyzedPercentage}
                    strokeColor="#6366f1"
                    style={{ marginTop: 12 }}
                  />
                  <Text type="secondary">
                    {formatNumber(sentimentStats.analyzed)} / {" "}
                    {formatNumber(stats.totalReviews || totalReviewsCount)} reviews processed
                  </Text>
                </Col>
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={4}>
                    <Text strong>Total Reviews in Database</Text>
                    <Text style={{ fontSize: 24, fontWeight: 600 }}>
                      {formatNumber(totalReviewsCount)}
                    </Text>
                    <Text type="danger">
                      {formatNumber(outstandingReviews)} pending analysis
                    </Text>
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          {sentimentTrends &&
            sentimentTrends.dates &&
            sentimentTrends.dates.length > 0 && (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid #eef2ff",
                  padding: 12,
                }}
              >
                {(() => {
                  const dates = sentimentTrends.dates;
                  const data = dates.flatMap((date, idx) => {
                    const positive_count = Number(
                      sentimentTrends.positive?.[idx] || 0
                    );
                    const neutral_count = Number(
                      sentimentTrends.neutral?.[idx] || 0
                    );
                    const negative_count = Number(
                      sentimentTrends.negative?.[idx] || 0
                    );
                    const total =
                      positive_count + neutral_count + negative_count;
                    const displayMin = mode === "product" ? 0 : minDailyTotal;
                    if (total < displayMin) return [];
                    const displayMode =
                      mode === "product" ? "percent" : chartMode;

                    const mk = (sent, count) => {
                      const percent = total > 0 ? (count / total) * 100 : 0;
                      return {
                        date,
                        sentiment: sent,
                        value: displayMode === "percent" ? percent : count,
                        count,
                        total: total || 0,
                        percentage: percent.toFixed(1),
                      };
                    };
                    return [
                      mk("positive", positive_count),
                      mk("neutral", neutral_count),
                      mk("negative", negative_count),
                    ];
                  });

                  return (
                    <Suspense fallback={<Spin />}>
                      <SentimentChart
                        data={data}
                        mode={mode}
                        chartMode={chartMode}
                      />
                    </Suspense>
                  );
                })()}
              </div>
            )}
        </Card>

        <Card
          title="Negative Alerts"
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          {sentimentAlerts.length === 0 ? (
            <Text type="secondary">No products exceed the threshold.</Text>
          ) : (
            <Table
              size="middle"
              pagination={false}
              dataSource={sentimentAlerts.map((a) => ({
                key: a.product_id,
                ...a,
              }))}
              columns={[
                { title: "Product", dataIndex: "name" },
                {
                  title: "% Negative",
                  dataIndex: "negative_percent",
                  render: (v) => `${v.toFixed(1)}%`,
                },
                {
                  title: "Total Reviews",
                  dataIndex: "total_reviews",
                  render: (v) => formatNumber(v),
                },
              ]}
            />
          )}
          <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 12 }}>
            List displays products that exceed threshold or have highest recent negative sentiment.
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return renderDashboard();
};

export default AdminDashboard;
