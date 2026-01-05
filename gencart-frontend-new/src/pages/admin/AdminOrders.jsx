import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  message,
  Typography,
  Tag,
  Spin,
  Drawer,
  Descriptions,
  List,
  Avatar,
  Divider,
  Row,
  Col,
  Card,
  Input,
  Tooltip,
  Badge,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ShoppingOutlined,
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { getValidImageUrl } from "../../utils/imageUtils";
import { useResponsive } from "../../hooks/useResponsive";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrders = () => {
  const { isMobile } = useResponsive();
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  const location = useLocation();
  const navigate = useNavigate();

  const currencyFormat = (v) =>
    `₫${parseFloat(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const orderMetrics = useMemo(() => {
    const total = allOrders.length;
    const pending = allOrders.filter((o) => o.status === "pending").length;
    const processing = allOrders.filter((o) => o.status === "processing").length;
    const shipped = allOrders.filter((o) => o.status === "shipped").length;
    const delivered = allOrders.filter((o) => o.status === "delivered").length;
    const cancelled = allOrders.filter((o) => o.status === "cancelled").length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total_amount) || 0),
      0
    );
    return { total, pending, processing, shipped, delivered, cancelled, totalRevenue };
  }, [allOrders]);

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(
        `http://localhost:8000/api/orders/?page_size=1000`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all orders");
      }

      const data = await response.json();
      const allOrdersList = data.results || data || [];
      
      setAllOrders(allOrdersList);
      
      return true;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return false;
    }
  };

  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://localhost:8000/api/orders/?page=${page}&page_size=${pageSize}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      const ordersList = data.results || data || [];

      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: data.count || ordersList.length,
      }));

      setOrders(ordersList);
      return true;
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to load orders");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchAllOrders();
        await fetchOrders(pagination.current, pagination.pageSize);

        const params = new URLSearchParams(location.search);
        const openId = params.get("openId") || params.get("order_id") || params.get("id");
        if (openId) {
          try {
            const token = localStorage.getItem("access_token");
            const r = await fetch(`http://localhost:8000/api/orders/${openId}/`, {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (r.ok) {
              const data = await r.json();
              setSelectedOrder(data);
              setDrawerVisible(true);
              await fetchAllOrders();
              await fetchOrders(pagination.current, pagination.pageSize);
            }
          } catch (err) {
            console.error("Failed to fetch order from query param:", err);
          }
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [location.search]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const displayedOrders = useMemo(() => {
    if (!searchText.trim()) {
      return orders;
    }
    
    const searchLower = searchText.toLowerCase();
    return orders.filter((order) => {
      const orderId = String(order.id);
      const username = order.user?.username?.toLowerCase() || "";
      const email = order.user?.email?.toLowerCase() || "";
      const firstName = order.user?.first_name?.toLowerCase() || "";
      const lastName = order.user?.last_name?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const status = order.status?.toLowerCase() || "";
      
      return (
        orderId.includes(searchText) ||
        username.includes(searchLower) ||
        email.includes(searchLower) ||
        fullName.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [orders, searchText]);

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDrawerVisible(true);
  };

  const showEditModal = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      status: order.status,
    });
    setModalVisible(true);
  };

  const handleTableChange = (pag) => {
    if (searchText.trim()) {
      setPagination((prev) => ({
        ...prev,
        pageSize: pag.pageSize,
      }));
      return;
    }
    
    fetchOrders(pag.current, pag.pageSize);
  };

  const handleUpdateStatus = async (values) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/orders/${selectedOrder.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: values.status }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      message.success("Order status updated successfully");
      setModalVisible(false);
      
      await fetchAllOrders();
      await fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Failed to update order status");
    }
  };

  const handleRefresh = async () => {
    const hide = message.loading("Refreshing orders...", 0);
    try {
      await fetchAllOrders();
      await fetchOrders(pagination.current, pagination.pageSize);
      hide();
      message.success("Refreshed successfully!");
    } catch (error) {
      hide();
      console.error("Error refreshing orders:", error);
      message.error("Failed to refresh orders");
    }
  };

  // Get status with icon and color
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "#f59e0b",
        bgColor: "linear-gradient(135deg, #fbbf2415 0%, #f59e0b15 100%)",
        borderColor: "#fbbf2430",
        icon: <ClockCircleOutlined />,
        text: "PENDING",
      },
      processing: {
        color: "#3b82f6",
        bgColor: "linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)",
        borderColor: "#3b82f630",
        icon: <InboxOutlined />,
        text: "PROCESSING",
      },
      shipped: {
        color: "#06b6d4",
        bgColor: "linear-gradient(135deg, #22d3ee15 0%, #06b6d415 100%)",
        borderColor: "#22d3ee30",
        icon: <CarOutlined />,
        text: "SHIPPED",
      },
      delivered: {
        color: "#10b981",
        bgColor: "linear-gradient(135deg, #10b98115 0%, #05966915 100%)",
        borderColor: "#10b98130",
        icon: <CheckCircleOutlined />,
        text: "DELIVERED",
      },
      cancelled: {
        color: "#ef4444",
        bgColor: "linear-gradient(135deg, #ef444415 0%, #dc262615 100%)",
        borderColor: "#ef444430",
        icon: <CloseCircleOutlined />,
        text: "CANCELLED",
      },
    };
    return configs[status] || configs.pending;
  };

  const getStatusTag = (status) => {
    const config = getStatusConfig(status);
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 10,
          background: config.bgColor,
          border: `1.5px solid ${config.borderColor}`,
          fontWeight: 700,
          fontSize: 13,
          color: config.color,
        }}
      >
        {config.icon}
        {config.text}
      </div>
    );
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return "G";
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  // Table columns
  const columns = [
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            MÃ ĐƠN HÀNG
          </span>
        </div>
      ),
      dataIndex: "id",
      key: "id",
      width: 120,
      sorter: (a, b) => a.id - b.id,
      render: (text) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
            border: "1.5px solid #667eea30",
            fontWeight: 700,
            fontSize: 13,
            color: "#667eea",
            padding: "0 12px",
          }}
        >
          #{text}
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            KHÁCH HÀNG
          </span>
        </div>
      ),
      dataIndex: "user",
      key: "user",
      width: 240,
      render: (user, record) => {
        if (!user && !record.user_id) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                size={44}
                style={{
                  background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                G
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 14, color: "#64748b" }}>
                  Khách vãng lai
                </Text>
              </div>
            </div>
          );
        }
        if (!user && record.user_id) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                size={44}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                U
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 14 }}>
                  Người dùng #{record.user_id}
                </Text>
              </div>
            </div>
          );
        }

        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={44}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              {getUserInitials(user)}
            </Avatar>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
                @{user.username}
              </Text>
              {fullName && (
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {fullName}
                </Text>
              )}
            </div>
          </div>
        );
      },
      sorter: (a, b) => {
        const aUsername = a.user
          ? a.user.username
          : a.user_id
          ? `User ${a.user_id}`
          : "Guest";
        const bUsername = b.user
          ? b.user.username
          : b.user_id
          ? `User ${b.user_id}`
          : "Guest";
        return aUsername.localeCompare(bUsername);
      },
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            NGÀY ĐẶT HÀNG
          </span>
        </div>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (text) => (
        <Text style={{ fontSize: 13, color: "#64748b" }}>
          {new Date(text).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            TRẠNG THÁI
          </span>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Chờ xử lý", value: "pending" },
        { text: "Đang xử lý", value: "processing" },
        { text: "Đã giao hàng", value: "shipped" },
        { text: "Đã giao", value: "delivered" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            TỔNG TIỀN
          </span>
        </div>
      ),
      dataIndex: "total_amount",
      key: "total_amount",
      width: 140,
      render: (text) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #10b98115 0%, #05966915 100%)",
            border: "1.5px solid #10b98130",
            fontWeight: 700,
            fontSize: 14,
            color: "#059669",
          }}
        >
          <DollarOutlined style={{ fontSize: 14 }} />
          {currencyFormat(text)}
        </div>
      ),
      sorter: (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            SỐ LƯỢNG
          </span>
        </div>
      ),
      dataIndex: "items_count",
      key: "items_count",
      width: 100,
      render: (count, record) => {
        const itemCount = count || (record.items ? record.items.length : 0);
        return (
          <Badge
            count={itemCount}
            style={{
              backgroundColor: "#667eea",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
              fontWeight: 700,
            }}
            showZero
          />
        );
      },
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            HÀNH ĐỘNG
          </span>
        </div>
      ),
      key: "actions",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Xem Chi tiết">
            <Button
              icon={<EyeOutlined style={{ fontSize: 15 }} />}
              onClick={() => showOrderDetails(record)}
              size="middle"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(102, 126, 234, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(102, 126, 234, 0.35)";
              }}
            />
          </Tooltip>
          <Tooltip title="Cập nhật Trạng thái">
            <Button
              icon={<EditOutlined style={{ fontSize: 15 }} />}
              onClick={() => showEditModal(record)}
              size="middle"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                border: "none",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(59, 130, 246, 0.35)";
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: isMobile ? 8 : 12,
        background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
        borderRadius: isMobile ? 12 : 24,
        minHeight: "100%",
      }}
    >
      <Card
        style={{
          borderRadius: isMobile ? 12 : 24,
          background: "linear-gradient(90deg, #5b21b6 0%, #2563eb 100%)",
          color: "#fff",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
          marginBottom: isMobile ? 12 : 12,
          border: "none",
        }}
        bodyStyle={{ padding: isMobile ? 12 : 20 }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={16} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Title level={isMobile ? 3 : 2} style={{ color: "#fff", margin: 0, fontWeight: 650 }}>
                QUẢN LÝ ĐƠN HÀNG
              </Title>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Tag color="geekblue" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Tổng số: {orderMetrics.total}
              </Tag>
              <Tag color="orange" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Chờ xử lý: {orderMetrics.pending}
              </Tag>
              <Tag color="gold" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Đang xử lý: {orderMetrics.processing}
              </Tag>
              <Tag color="cyan" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Đã giao hàng: {orderMetrics.shipped}
              </Tag>
              <Tag color="green" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Đã giao: {orderMetrics.delivered}
              </Tag>
              <Tag color="red" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Đã hủy: {orderMetrics.cancelled}
              </Tag>
              <Tag color="purple" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Doanh thu: {currencyFormat(orderMetrics.totalRevenue)}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Space wrap>
              <Button
                onClick={handleRefresh}
                loading={loading}
                size={isMobile ? "middle" : "default"}
                type="primary"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  color: "#fff",
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        size="small"
        style={{
          borderRadius: 16,
          border: "1px solid rgba(148, 163, 184, 0.25)",
          boxShadow: "0 18px 36px rgba(15, 23, 42, 0.12)",
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          marginTop: -8,
          marginBottom: 12,
        }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, tên đăng nhập, email hoặc trạng thái..."
          style={{ width: "100%" }}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Card>

      <Card
        style={{
          borderRadius: 20,
          border: "1px solid rgba(148, 163, 184, 0.24)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
          background: "#ffffff",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={displayedOrders}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
          pagination={
            searchText.trim()
              ? {
                  current: 1,
                  pageSize: pagination.pageSize,
                  total: displayedOrders.length,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total, range) => (
                    <span style={{ fontWeight: 600, color: "#475569" }}>
                      {range[0]}-{range[1]} của <span style={{ color: "#667eea", fontWeight: 700 }}>{total}</span> đơn hàng
                    </span>
                  ),
                  style: { padding: "20px 24px", margin: 0 },
                }
              : {
                  ...pagination,
                  showTotal: (total, range) => (
                    <span style={{ fontWeight: 600, color: "#475569" }}>
                      {range[0]}-{range[1]} của <span style={{ color: "#667eea", fontWeight: 700 }}>{total}</span> đơn hàng
                    </span>
                  ),
                  style: { padding: "20px 24px", margin: 0 },
                }
          }
          style={{
            borderRadius: 20,
          }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      {/* Edit Status Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Cập nhật Trạng thái Đơn hàng
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={540}
        style={{ top: 40 }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleUpdateStatus}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="status"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Order Status</span>}
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select 
              placeholder="Select status"
              size="large"
              style={{ borderRadius: 10 }}
            >
              <Option value="pending">
                <Space>
                  <ClockCircleOutlined style={{ color: "#f59e0b" }} />
                  Pending
                </Space>
              </Option>
              <Option value="processing">
                <Space>
                  <InboxOutlined style={{ color: "#3b82f6" }} />
                  Processing
                </Space>
              </Option>
              <Option value="shipped">
                <Space>
                  <CarOutlined style={{ color: "#06b6d4" }} />
                  Shipped
                </Space>
              </Option>
              <Option value="delivered">
                <Space>
                  <CheckCircleOutlined style={{ color: "#10b981" }} />
                  Delivered
                </Space>
              </Option>
              <Option value="cancelled">
                <Space>
                  <CloseCircleOutlined style={{ color: "#ef4444" }} />
                  Cancelled
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button
                onClick={() => setModalVisible(false)}
                size="large"
                style={{ 
                  borderRadius: 10, 
                  height: 44, 
                  padding: "0 24px",
                  border: "2px solid #e2e8f0",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: 10,
                  height: 44,
                  padding: "0 32px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  border: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.35)",
                }}
              >
                Update Status
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Details Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              Order #{selectedOrder?.id || ""}
            </span>
          </div>
        }
        placement="right"
        width={isMobile ? "100%" : 680}
        onClose={() => {
          setDrawerVisible(false);
          try { 
            navigate('/admin/orders', { replace: true }); 
          } catch (err) { 
            console.error('Failed to update URL after closing drawer', err); 
          }
        }}
        open={drawerVisible}
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDrawerVisible(false);
              showEditModal(selectedOrder);
            }}
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              border: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            Update Status
          </Button>
        }
      >
        {selectedOrder && (
          <div style={{ padding: "8px 0" }}>
            {/* Order Information */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                marginBottom: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingCartOutlined style={{ color: "#667eea" }} />
                Order Information
              </Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Order ID</span>}
                >
                  <Badge 
                    count={`#${selectedOrder.id}`}
                    style={{ 
                      backgroundColor: "#667eea",
                      fontWeight: 700,
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Date</span>}
                >
                  {new Date(selectedOrder.created_at).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Status</span>}
                >
                  {getStatusTag(selectedOrder.status)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Total Amount</span>}
                >
                  <Text strong style={{ fontSize: 16, color: "#059669" }}>
                    {currencyFormat(selectedOrder.total_amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Payment Status</span>}
                >
                  {selectedOrder.payment_status ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #10b98115 0%, #05966915 100%)",
                        border: "1.5px solid #10b98130",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#059669",
                      }}
                    >
                      <CheckCircleOutlined />
                      Paid
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #fbbf2415 0%, #f59e0b15 100%)",
                        border: "1.5px solid #fbbf2430",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#f59e0b",
                      }}
                    >
                      <ClockCircleOutlined />
                      Pending
                    </div>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Customer Information */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                marginBottom: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <UserOutlined style={{ color: "#667eea" }} />
                Customer Information
              </Title>
              {selectedOrder.user ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Username</span>}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar
                        size={32}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          fontWeight: 700,
                        }}
                      >
                        {getUserInitials(selectedOrder.user)}
                      </Avatar>
                      <Text strong>@{selectedOrder.user.username}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Full Name</span>}
                  >
                    {`${selectedOrder.user.first_name || ""} ${
                      selectedOrder.user.last_name || ""
                    }`.trim() || "No Name Provided"}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Email</span>}
                  >
                    <Space>
                      <MailOutlined style={{ color: "#94a3b8" }} />
                      {selectedOrder.user.email}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              ) : selectedOrder.user_id ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>User ID</span>}
                  >
                    <Text strong>User #{selectedOrder.user_id}</Text>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text style={{ color: "#64748b", fontStyle: "italic" }}>Guest Order</Text>
              )}
            </Card>

            {/* Shipping Address */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                marginBottom: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <HomeOutlined style={{ color: "#667eea" }} />
                Shipping Address
              </Title>
              {selectedOrder.shipping_address ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Name</span>}
                  >
                    {`${selectedOrder.shipping_address.first_name} ${selectedOrder.shipping_address.last_name}`}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Address</span>}
                  >
                    {`${selectedOrder.shipping_address.street_address}${
                      selectedOrder.shipping_address.apartment_address
                        ? ", " + selectedOrder.shipping_address.apartment_address
                        : ""
                    }, ${selectedOrder.shipping_address.city}, ${
                      selectedOrder.shipping_address.state
                    }, ${selectedOrder.shipping_address.zip_code}`}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Phone</span>}
                  >
                    <Space>
                      <PhoneOutlined style={{ color: "#94a3b8" }} />
                      {selectedOrder.shipping_address.phone}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: 600 }}>Email</span>}
                  >
                    <Space>
                      <MailOutlined style={{ color: "#94a3b8" }} />
                      {selectedOrder.shipping_address.email}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text style={{ color: "#64748b", fontStyle: "italic" }}>No shipping address provided</Text>
              )}
            </Card>

            {/* Order Items */}
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingOutlined style={{ color: "#667eea" }} />
                Order Items ({selectedOrder.items?.length || 0})
              </Title>
              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items || []}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape="square"
                          size={72}
                          src={getValidImageUrl(
                            item.product?.primary_image,
                            item.product?.name,
                            72,
                            72
                          )}
                          style={{
                            borderRadius: 10,
                            border: "2px solid #f1f5f9",
                          }}
                        />
                      }
                      title={
                        <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
                          {item.product?.name || "Product"}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Text style={{ fontSize: 13, color: "#64748b" }}>
                              Quantity:
                            </Text>
                            <Badge
                              count={item.quantity}
                              style={{
                                backgroundColor: "#667eea",
                                fontWeight: 700,
                              }}
                            />
                          </div>
                          <Text style={{ fontSize: 13, color: "#64748b" }}>
                            Price: <Text strong style={{ color: "#059669" }}>₫{parseFloat(item.price).toFixed(2)}</Text>
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            Subtotal: <Text strong style={{ color: "#059669" }}>₫{(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Drawer>

      <style>
        {`
          .table-row-light {
            background: #ffffff;
          }
          .table-row-dark {
            background: #fafbfc;
          }
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
            border-bottom: 2px solid #e2e8f0 !important;
            padding: 18px 16px !important;
            font-weight: 700 !important;
          }
          
          /* Fixed column ACTIONS - solid background */
          .ant-table-thead > tr > th.ant-table-cell-fix-right {
            background: #f8fafc !important;
            z-index: 3 !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08) !important;
          }
          
          .ant-table-tbody > tr > td {
            padding: 18px 16px !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          
          /* ACTIONS column - solid white background for light rows */
          .ant-table-tbody > tr.table-row-light > td.ant-table-cell-fix-right {
            background: #ffffff !important;
            z-index: 2 !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08) !important;
          }
          
          /* ACTIONS column - solid background for dark rows */
          .ant-table-tbody > tr.table-row-dark > td.ant-table-cell-fix-right {
            background: #fafbfc !important;
            z-index: 2 !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08) !important;
          }
          
          /* ACTIONS column on hover - solid background */
          .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
            background: #f8fafc !important;
            z-index: 2 !important;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08) !important;
          }
          
          .ant-pagination-item-active {
            border-color: #667eea !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          }
          .ant-pagination-item-active a {
            color: #fff !important;
            font-weight: 700 !important;
          }
          .ant-pagination-item {
            border-radius: 8px !important;
            border: 2px solid #e2e8f0 !important;
            font-weight: 600 !important;
          }
          .ant-pagination-item:hover {
            border-color: #667eea !important;
          }
          .ant-pagination-prev button, .ant-pagination-next button {
            border-radius: 8px !important;
          }
        `}
      </style>
    </div>
  );
};

export default AdminOrders;