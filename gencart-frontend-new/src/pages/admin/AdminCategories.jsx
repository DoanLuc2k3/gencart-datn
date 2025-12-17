import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Typography,
  Spin,
  Popconfirm,
  Switch,
  Card,
  Row,
  Col,
  Tag,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getValidImageUrl } from "../../utils/imageUtils";
import { useResponsive } from "../../hooks/useResponsive";

// Debounce hook
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const AdminCategories = () => {
  const { isMobile } = useResponsive();
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Category");
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const formatNumber = (n) => new Intl.NumberFormat("vi-VN").format(Number(n) || 0);

  const { Title, Text } = Typography;
  const { TextArea } = Input;

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/categories/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const fetchedCategories = data.results || data || [];
      setAllCategories(fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setCategories(allCategories);
      return;
    }
    const searchLower = debouncedSearch.toLowerCase();
    const filtered = allCategories.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
    );
    setCategories(filtered);
  }, [debouncedSearch, allCategories]);

  // Show add/edit modal
  const showModal = (category = null) => {
    setEditingCategory(category);
    setModalTitle(category ? "Edit Category" : "Add Category");

    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });

      if (category.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: category.image,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }

    setModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setUploading(true);
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("is_active", values.is_active);
      if (fileList.length > 0 && fileList[0].originFileObj)
        formData.append("image", fileList[0].originFileObj);

      let url = "http://localhost:8000/api/categories/";
      let method = "POST";
      if (editingCategory) {
        url = `http://localhost:8000/api/categories/${editingCategory.id}/`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save category");

      message.success(
        `Category ${editingCategory ? "updated" : "added"} successfully`
      );
      setModalVisible(false);

      const categoriesResponse = await fetch(
        "http://localhost:8000/api/categories/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const fetchedCategories = categoriesData.results || categoriesData || [];
        setAllCategories(fetchedCategories);
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Failed to save category");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete category
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/categories/${id}/`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to delete category");
      message.success("Category deleted successfully");
      const updatedCategories = allCategories.filter((c) => c.id !== id);
      setAllCategories(updatedCategories);
      setCategories(
        updatedCategories.filter((c) => {
          if (!search.trim()) return true;
          const searchLower = search.toLowerCase();
          return (
            c.name?.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
          );
        })
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  // Upload props
  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  // Categories metrics
  const categoriesMetrics = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.is_active).length;
    const withProducts = categories.filter(
      (c) => c.product_count && c.product_count > 0
    ).length;
    return { total, active, withProducts };
  }, [categories]);

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
            IMAGE
          </span>
        </div>
      ),
      dataIndex: "image",
      key: "image",
      width: 110,
      render: (text, record) => (
        <div
          style={{
            position: "relative",
            width: 64,
            height: 64,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12), 0 0 0 3px #f8fafc",
            border: "2px solid #fff",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08) translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.18), 0 0 0 3px #667eea20";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12), 0 0 0 3px #f8fafc";
          }}
        >
          <img
            src={getValidImageUrl(text, record.name, 64, 64)}
            alt={record.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            CATEGORY NAME
          </span>
        </div>
      ),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Text
            strong
            style={{ 
              fontSize: 15, 
              color: "#0f172a", 
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            DESCRIPTION
          </span>
        </div>
      ),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text || "No description"}>
          <Text style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            {text || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>No description</span>}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#475569", letterSpacing: "0.5px" }}>
            PRODUCTS
          </span>
        </div>
      ),
      dataIndex: "product_count",
      key: "product_count",
      width: 130,
      sorter: (a, b) => a.product_count - b.product_count,
      render: (count) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 10,
            background: count > 0 
              ? "linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)" 
              : "#f8fafc",
            border: count > 0 
              ? "1.5px solid #3b82f630" 
              : "1.5px solid #e2e8f0",
            fontWeight: 700,
            fontSize: 14,
            color: count > 0 ? "#2563eb" : "#94a3b8",
          }}
        >
          <AppstoreOutlined style={{ fontSize: 14 }} />
          {count || count === 0 ? formatNumber(count) : "—"}
        </div>
      ),
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
              ? "linear-gradient(135deg, #10b98115 0%, #059669215 100%)" 
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
            ACTIONS
          </span>
        </div>
      ),
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="Edit Category">
            <Button
              icon={<EditOutlined style={{ fontSize: 15 }} />}
              onClick={() => showModal(record)}
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
          <Popconfirm
            title={<span style={{ fontWeight: 600 }}>Delete Category</span>}
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
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
            <Tooltip title={record.product_count > 0 ? "Cannot delete categories with products" : "Delete Category"}>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined style={{ fontSize: 15 }} />}
                size="middle"
                disabled={record.product_count > 0}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: record.product_count > 0 
                    ? "#f1f5f9" 
                    : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  border: "none",
                  color: record.product_count > 0 ? "#cbd5e1" : "#fff",
                  boxShadow: record.product_count > 0 
                    ? "none" 
                    : "0 4px 14px rgba(245, 87, 108, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: record.product_count > 0 ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (record.product_count === 0) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 87, 108, 0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (record.product_count === 0) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(245, 87, 108, 0.35)";
                  }
                }}
              />
            </Tooltip>
          </Popconfirm>
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
                Product Categories
              </Title>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Tag color="geekblue" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Total: {formatNumber(categoriesMetrics.total)}
              </Tag>
              <Tag color="green" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                Active: {formatNumber(categoriesMetrics.active)}
              </Tag>
              <Tag color="volcano" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
                With Products: {formatNumber(categoriesMetrics.withProducts)}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Space wrap>
              <Button
                onClick={fetchCategories}
                loading={loading}
                size={isMobile ? "middle" : "default"}
                type="primary"
                style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff" }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={!isMobile && <PlusOutlined />}
                onClick={() => showModal()}
                size={isMobile ? "middle" : "default"}
                style={{
                  background: "linear-gradient(90deg, #5b21b6 0%, #2563eb 100%)",
                  border: "none",
                  color: "#fff",
                }}
              >
                {isMobile ? "Add" : "Add Category"}
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
          placeholder="Search by category name or description..."
          style={{ width: "100%" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Table Card */}
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
          dataSource={categories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span style={{ fontWeight: 600, color: "#475569" }}>
                Total <span style={{ color: "#667eea", fontWeight: 700 }}>{total}</span> categories
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

      {/* Modal */}
      <Modal
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
              <AppstoreOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {modalTitle}
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
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Category Name</span>}
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              placeholder="Enter category name"
              size="large"
              style={{ 
                borderRadius: 10,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Description</span>}
          >
            <TextArea
              rows={4}
              placeholder="Enter category description"
              style={{ 
                borderRadius: 10,
                border: "2px solid #e2e8f0",
                fontSize: 14,
              }}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Active Status</span>}
            valuePropName="checked"
          >
            <Switch 
              style={{
                background: form.getFieldValue('is_active') ? '#10b981' : '#cbd5e1',
              }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Category Image</span>}>
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button 
                icon={<UploadOutlined />} 
                size="large" 
                style={{ 
                  borderRadius: 10,
                  border: "2px solid #e2e8f0",
                  fontWeight: 600,
                }}
              >
                Select Image
              </Button>
            </Upload>
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
                loading={uploading}
                size="large"
                style={{
                  borderRadius: 10,
                  height: 44,
                  padding: "0 32px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.35)",
                }}
              >
                {editingCategory ? "Update" : "Add"} Category
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

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
          
          /* FIX: ACTIONS column - solid background, no transparency */
          .ant-table-thead > tr > th.ant-table-cell-fix-right {
            background: #ffffff !important;
            z-index: 3 !important;
            position: sticky !important;
            box-shadow: -4px 0 8px rgba(0, 0, 0, 0.06) !important;
          }
          
          .ant-table-tbody > tr > td {
            padding: 18px 16px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            transition: all 0.3s ease !important;
          }
          
          /* FIX: ACTIONS cells in body - solid background */
          .ant-table-tbody > tr > td.ant-table-cell-fix-right {
            background: #ffffff !important;
            z-index: 2 !important;
            position: sticky !important;
            box-shadow: -4px 0 8px rgba(0, 0, 0, 0.06) !important;
          }
          
          /* FIX: Hover state for rows with ACTIONS column */
          .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
            background: #ffffff !important;
            z-index: 2 !important;
          }
          
          .ant-table-tbody > tr:hover > td {
            background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%) !important;
            transform: scale(1.001);
          }
          
          /* Ensure light rows have white background in ACTIONS */
          .table-row-light > td.ant-table-cell-fix-right {
            background: #ffffff !important;
          }
          
          /* Ensure dark rows have proper background in ACTIONS */
          .table-row-dark > td.ant-table-cell-fix-right {
            background: #ffffff !important;
          }
          
          .ant-table-tbody > tr:hover {
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
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

export default AdminCategories;