import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Spin,
  Drawer,
  Descriptions,
  Switch,
  Popconfirm,
  Tabs,
  Card,
  Row,
  Col,
  Segmented,
  Tooltip,
  Avatar,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useResponsive } from "../../hooks/useResponsive";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Debounce hook
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const AdminUsers = () => {
  const { isMobile } = useResponsive();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const formatNumber = (n) => new Intl.NumberFormat("vi-VN").format(Number(n)||0);

  const usersMetrics = useMemo(() => {
    const total = users.length;
    const staff = users.filter((u) => u.is_staff).length;
    const superusers = users.filter((u) => u.is_superuser).length;
    const active = users.filter((u) => u.is_active).length;
    return { total, staff, superusers, active };
  }, [users]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      const fetchedUsers = data.results || data || [];
      setAllUsers(fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setUsers(allUsers);
      return;
    }
    const searchLower = debouncedSearch.toLowerCase();
    const filtered = allUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.first_name?.toLowerCase().includes(searchLower) ||
        u.last_name?.toLowerCase().includes(searchLower) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchLower)
    );
    setUsers(filtered);
  }, [debouncedSearch, allUsers]);

  // Show user details
  const showUserDetails = async (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/orders/?user=${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user orders");
      const data = await response.json();
      setUserOrders(data.results || data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      message.error("Failed to load user orders");
    }
  };

  // Show edit user modal
  const showEditModal = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
    });
    setModalVisible(true);
  };

  // Show change password modal
  const showPasswordModal = (user) => {
    setSelectedUser(user);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // Handle user update
  const handleUpdateUser = async (values) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/users/${selectedUser.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) throw new Error("Failed to update user");
      const updatedUser = await response.json();
      message.success("User updated successfully");
      setModalVisible(false);
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setAllUsers(allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      if (drawerVisible) setSelectedUser(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Failed to update user");
    }
  };

  // Handle password change
  const handleChangePassword = async (values) => {
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        old_password: values.old_password || "TEMP_PLACEHOLDER",
        new_password: values.password,
        confirm_password: values.confirm || values.password,
      };
      const response = await fetch(
        `http://localhost:8000/api/users/${selectedUser.id}/change_password/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to change password");
      message.success("Password changed successfully");
      setPasswordModalVisible(false);
    } catch (error) {
      console.error("Error changing password:", error);
      message.error("Failed to change password");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");
      message.success("User deleted successfully");
      setUsers(users.filter((user) => user.id !== userId));
      setAllUsers(allUsers.filter((user) => user.id !== userId));
      if (drawerVisible && selectedUser && selectedUser.id === userId) {
        setDrawerVisible(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    }
  };

  // Get user avatar initials
  const getUserInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  // Get avatar color based on role
  const getAvatarColor = (user) => {
    if (user.is_superuser) return "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
    if (user.is_staff) return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
    return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  };

  // Table columns
  const columns = [
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            ID
          </span>
        </div>
      ),
      dataIndex: "id",
      key: "id",
      width: 90,
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
            USER
          </span>
        </div>
      ),
      key: "user",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={48}
            style={{
              background: getAvatarColor(record),
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "3px solid #fff",
            }}
          >
            {getUserInitials(record)}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text strong style={{ fontSize: 14, color: "#0f172a", fontWeight: 700 }}>
                {record.username}
              </Text>
              {record.is_superuser && (
                <CrownOutlined style={{ color: "#fbbf24", fontSize: 14 }} />
              )}
            </div>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              {record.first_name && record.last_name
                ? `${record.first_name} ${record.last_name}`
                : "No name"}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            EMAIL
          </span>
        </div>
      ),
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MailOutlined style={{ color: "#94a3b8", fontSize: 14 }} />
            <Text style={{ fontSize: 13, color: "#475569" }} ellipsis>
              {text}
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            ROLE
          </span>
        </div>
      ),
      key: "role",
      width: 150,
      render: (_, record) => {
        if (record.is_superuser) {
          return (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #fbbf2415 0%, #f59e0b15 100%)",
                border: "1.5px solid #fbbf2430",
                fontWeight: 700,
                fontSize: 13,
                color: "#f59e0b",
              }}
            >
              <CrownOutlined style={{ fontSize: 14 }} />
              Superuser
            </div>
          );
        }
        if (record.is_staff) {
          return (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)",
                border: "1.5px solid #3b82f630",
                fontWeight: 700,
                fontSize: 13,
                color: "#2563eb",
              }}
            >
              <IdcardOutlined style={{ fontSize: 14 }} />
              Staff
            </div>
          );
        }
        return (
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
              fontSize: 13,
              color: "#059669",
            }}
          >
            <UserOutlined style={{ fontSize: 14 }} />
            Customer
          </div>
        );
      },
      filters: [
        { text: "Superuser", value: "superuser" },
        { text: "Staff", value: "staff" },
        { text: "Customer", value: "customer" },
      ],
      onFilter: (value, record) => {
        if (value === "superuser") return record.is_superuser;
        if (value === "staff") return record.is_staff && !record.is_superuser;
        return !record.is_staff && !record.is_superuser;
      },
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            STATUS
          </span>
        </div>
      ),
      dataIndex: "is_active",
      key: "is_active",
      width: 130,
      render: (active) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 10,
            background: active
              ? "linear-gradient(135deg, #10b98115 0%, #05966915 100%)"
              : "linear-gradient(135deg, #ef444415 0%, #dc262615 100%)",
            border: active
              ? "1.5px solid #10b98130"
              : "1.5px solid #ef444430",
            fontWeight: 700,
            fontSize: 13,
            color: active ? "#059669" : "#dc2626",
          }}
        >
          {active ? <CheckCircleOutlined style={{ fontSize: 14 }} /> : <CloseCircleOutlined style={{ fontSize: 14 }} />}
          {active ? "Active" : "Inactive"}
        </div>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            JOINED DATE
          </span>
        </div>
      ),
      dataIndex: "date_joined",
      key: "date_joined",
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
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            ACTIONS
          </span>
        </div>
      ),
      key: "actions",
      className: "actions-column",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <div className="actions-content" style={{ background: "#fff", padding: 6, borderRadius: 8 }}>
          <Space size={8}>
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined style={{ fontSize: 15 }} />}
                onClick={() => showUserDetails(record)}
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
            <Tooltip title="Edit User">
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
            <Tooltip title="Change Password">
              <Button
                icon={<LockOutlined style={{ fontSize: 15 }} />}
                onClick={() => showPasswordModal(record)}
                size="middle"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  border: "none",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(245, 158, 11, 0.35)";
                }}
              />
            </Tooltip>
            <Popconfirm
              title={<span style={{ fontWeight: 600 }}>Delete User</span>}
              description="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                style: {
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  border: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tooltip title={record.is_superuser ? "Cannot delete superusers" : "Delete User"}>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 15 }} />}
                  size="middle"
                  disabled={record.is_superuser}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: record.is_superuser
                      ? "#f1f5f9"
                      : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    border: "none",
                    color: record.is_superuser ? "#cbd5e1" : "#fff",
                    boxShadow: record.is_superuser
                      ? "none"
                      : "0 4px 14px rgba(245, 87, 108, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: record.is_superuser ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!record.is_superuser) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 87, 108, 0.45)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!record.is_superuser) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(245, 87, 108, 0.35)";
                    }
                  }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      ),
    },
  ];

  // Order columns for user details
  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => new Date(text).toLocaleDateString("en-IN"),
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
      render: (text) => `₫${parseFloat(text).toFixed(2)}`,
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
                User Management
              </Title>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Tag color="geekblue" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Total: {formatNumber(usersMetrics.total)}
              </Tag>
              <Tag color="cyan" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Staff: {formatNumber(usersMetrics.staff)}
              </Tag>
              <Tag color="gold" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Superusers: {formatNumber(usersMetrics.superusers)}
              </Tag>
              <Tag color="green" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Active: {formatNumber(usersMetrics.active)}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Space wrap>
              <Button
                onClick={fetchUsers}
                loading={loading}
                size={isMobile ? "middle" : "default"}
                type="primary"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  color: "#fff",
                }}
              >
                Refresh
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
          placeholder="Search by username, email, first name or last name..."
          style={{ width: "100%" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span style={{ fontWeight: 600, color: "#475569" }}>
                Total <span style={{ color: "#667eea", fontWeight: 700 }}>{total}</span> users
              </span>
            ),
            style: { padding: "20px 24px", margin: 0 },
          }}
          style={{
            borderRadius: 20,
          }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      {/* Edit User Modal */}
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
              Edit User
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={620}
        style={{ top: 40 }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleUpdateUser}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Username</span>}
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
              style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Email</span>}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
              style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item 
                name="first_name" 
                label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>First Name</span>}
              >
                <Input 
                  placeholder="First Name" 
                  size="large"
                  style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="last_name" 
                label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Last Name</span>}
              >
                <Input 
                  placeholder="Last Name" 
                  size="large"
                  style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item 
                name="is_active" 
                label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Active</span>} 
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="is_staff"
                label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Staff</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="is_superuser"
                label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Superuser</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

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
                Update User
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Change Password
            </span>
          </div>
        }
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={540}
        style={{ top: 40 }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>New Password</span>}
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
              style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Confirm Password</span>}
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
              style={{ borderRadius: 10, border: "2px solid #e2e8f0" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button
                onClick={() => setPasswordModalVisible(false)}
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
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  border: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(245, 158, 11, 0.35)",
                }}
              >
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={40}
              style={{
                background: selectedUser ? getAvatarColor(selectedUser) : "#667eea",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {selectedUser ? getUserInitials(selectedUser) : "U"}
            </Avatar>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              {selectedUser?.username || ""}
            </span>
          </div>
        }
        placement="right"
        width={isMobile ? "100%" : 640}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDrawerVisible(false);
                showEditModal(selectedUser);
              }}
              style={{
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                border: "none",
                fontWeight: 600,
              }}
            >
              Edit User
            </Button>
          </Space>
        }
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane 
              tab={
                <span style={{ fontWeight: 600 }}>
                  <UserOutlined /> User Information
                </span>
              } 
              key="1"
            >
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>ID</span>}
                >
                  #{selectedUser.id}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Username</span>}
                >
                  {selectedUser.username}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Email</span>}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MailOutlined style={{ color: "#94a3b8" }} />
                    {selectedUser.email}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Full Name</span>}
                >
                  {selectedUser.first_name && selectedUser.last_name
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Date Joined</span>}
                >
                  {new Date(selectedUser.date_joined).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Last Login</span>}
                >
                  {selectedUser.last_login
                    ? new Date(selectedUser.last_login).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Active Status</span>}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 8,
                      background: selectedUser.is_active
                        ? "linear-gradient(135deg, #10b98115 0%, #05966915 100%)"
                        : "linear-gradient(135deg, #ef444415 0%, #dc262615 100%)",
                      border: selectedUser.is_active
                        ? "1.5px solid #10b98130"
                        : "1.5px solid #ef444430",
                      fontWeight: 700,
                      fontSize: 12,
                      color: selectedUser.is_active ? "#059669" : "#dc2626",
                    }}
                  >
                    {selectedUser.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 600 }}>Role</span>}
                >
                  {selectedUser.is_superuser && (
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
                      <CrownOutlined />
                      Superuser
                    </div>
                  )}
                  {selectedUser.is_staff && !selectedUser.is_superuser && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)",
                        border: "1.5px solid #3b82f630",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#2563eb",
                      }}
                    >
                      <IdcardOutlined />
                      Staff
                    </div>
                  )}
                  {!selectedUser.is_staff && !selectedUser.is_superuser && (
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
                      <UserOutlined />
                      Customer
                    </div>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane 
              tab={
                <span style={{ fontWeight: 600 }}>
                  <ShoppingOutlined /> Orders
                </span>
              } 
              key="2"
            >
              <Table
                columns={orderColumns}
                dataSource={userOrders}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      <style>
        {`
          .table-row-light {
            background: #ffffff;
            transition: all 0.3s ease;
          }
          .table-row-dark {
            background: #fafbfc;
            transition: all 0.3s ease;
          }
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
            border-bottom: 2px solid #e2e8f0 !important;
            padding: 18px 16px !important;
            font-weight: 700 !important;
          }
          .ant-table-tbody > tr > td {
            padding: 18px 16px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            transition: all 0.3s ease !important;
          }
          .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%) !important;
            transform: scale(1.001);
          }
          .ant-table-tbody > tr:hover {
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
          }
          /* ACTIONS column overrides: force a solid background, prevent any transparency/blur, and make it sticky */
          .actions-column,
          .ant-table-tbody > tr > td.actions-column,
          .ant-table-thead > tr > th.actions-column {
            background: #fff !important;
            position: -webkit-sticky !important; /* safari */
            position: sticky !important;
            right: 0 !important;
            z-index: 12 !important;
            opacity: 1 !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
          }
          /* Header should sit above cells */
          .ant-table-thead > tr > th.actions-column {
            z-index: 15 !important;
          }
          /* Ensure hover doesn't make the actions cell translucent */
          .ant-table-tbody > tr:hover > td.actions-column {
            background: #fff !important;
            transform: none !important;
            box-shadow: none !important;
          }
          /* Keep content inside the actions area above row backgrounds and add subtle left divider */
          .actions-column .actions-content {
            background: #fff !important;
            z-index: 16 !important;
            position: relative !important;
            opacity: 1 !important;
            min-width: 200px;
            box-shadow: -6px 0 12px rgba(15, 23, 42, 0.04) !important;
          }

          .ant-pagination-item-active {
            border-color: #667eea !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          }
          .ant-pagination-item-active a {
            color: #fff !important;
            fontWeight: 700 !important;
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

export default AdminUsers;