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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getValidImageUrl } from "../../utils/imageUtils";

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

  
  const formatNumber = (n) => new Intl.NumberFormat("vi-VN").format(Number(n)||0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Refresh category list
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
      setCategories(updatedCategories.filter((c) => {
        if (!search.trim()) return true;
        const searchLower = search.toLowerCase();
        return c.name?.toLowerCase().includes(searchLower) ||
               c.description?.toLowerCase().includes(searchLower);
      }));
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

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <img
          src={getValidImageUrl(text, record.name, 50, 50)}
          alt={record.name}
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Products",
      dataIndex: "product_count",
      key: "product_count",
      sorter: (a, b) => a.product_count - b.product_count,
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => <Switch checked={active} disabled />,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.product_count > 0} // Prevent deleting categories with products
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
        borderRadius: 24,
        minHeight: "100%",
      }}
    >
      <Card
        style={{
          borderRadius: 24,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          boxShadow: "0 28px 60px rgba(15, 23, 42, 0.45)",
          marginBottom: 24,
          border: "none",
        }}
        bodyStyle={{ padding: 28 }}
      >
        <Row gutter={[24, 24]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              Product Categories
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.72)" }}>
              Manage categories, images, and activation status.
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button onClick={fetchCategories} loading={loading}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                Add Category
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
          marginBottom: 20,
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

      <Card
        style={{
          borderRadius: 20,
          border: "1px solid rgba(148, 163, 184, 0.24)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
          background: "#ffffff",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter category description" />
          </Form.Item>

          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Category Image">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                {editingCategory ? "Update" : "Add"} Category
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
