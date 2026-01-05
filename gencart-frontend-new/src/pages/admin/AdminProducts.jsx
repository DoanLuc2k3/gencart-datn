import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Popconfirm,
  Typography,
  Switch,
  Spin,
  Tag,
  Tooltip,
  Card,
  Row,
  Col,
  Segmented,
  Skeleton,
  Badge,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FireOutlined,
  TagOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  StockOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Debounce helper
const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const currencyFormat = (v) =>
  `₫${parseFloat(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const _formatNumber = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const AdminProducts = () => {
  const [allProducts, setAllProducts] = useState([]); // Lưu trữ TẤT CẢ products gốc (không pagination)
  const [products, setProducts] = useState([]); // Products sau khi filter để hiển thị
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add Product");
  const [form] = Form.useForm();
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // UX/Filter state
  const [viewMode, setViewMode] = useState("Table"); // 'Table' | 'Grid'
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [onlyActive, setOnlyActive] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  // QUAN TRỌNG: Tính metrics từ allProducts (dữ liệu gốc KHÔNG pagination)
  const productMetrics = useMemo(() => {
    const total = allProducts.length;
    const active = allProducts.filter((p) => p.is_active).length;
    const lowStock = allProducts.filter(
      (p) => p.inventory !== undefined && Number(p.inventory) < 10
    ).length;
    const discounted = allProducts.filter((p) => {
      if (!p.discount_price) return false;
      const price = Number(p.price);
      const discount = Number(p.discount_price);
      return !Number.isNaN(price) && !Number.isNaN(discount) && discount < price;
    }).length;
    const totalInventory = allProducts.reduce(
      (sum, p) => sum + (Number(p.inventory) || 0),
      0
    );
    const avgInventory = total ? Math.round(totalInventory / total) : 0;
    const categorySet = new Set(
      allProducts
        .filter((p) => p.category?.name)
        .map((p) => p.category.name)
    );

    return {
      total,
      active,
      lowStock,
      discounted,
      avgInventory,
      categories: categorySet.size,
    };
  }, [allProducts]);

  // Function to fetch ALL products for metrics (không pagination)
  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // Fetch với page_size rất lớn để lấy tất cả
      const url = new URL("http://localhost:8000/api/products/");
      url.searchParams.append("page_size", "1000"); // Lấy 1000 products (adjust nếu cần)
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      if (!response.ok) throw new Error(`Failed to fetch all products`);
      
      const data = await response.json();
      const list = data.results || data || [];
      
      // Lưu TẤT CẢ products vào allProducts
      setAllProducts(list);
      
      return true;
    } catch (e) {
      console.error("Error fetching all products:", e);
      return false;
    }
  };

  // Function to fetch products for display (với pagination và filters)
  const fetchProducts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const url = new URL("http://localhost:8000/api/products/");
      url.searchParams.append("page", page);
      url.searchParams.append("page_size", pageSize);
      if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
      
      const productsResponse = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!productsResponse.ok)
        throw new Error(`Failed products ${productsResponse.status}`);
      const data = await productsResponse.json();
      const list = data.results || data || [];
      
      // Apply filters cho display
      let processed = [...list];
      if (onlyActive) processed = processed.filter((p) => p.is_active);
      if (lowStockOnly)
        processed = processed.filter(
          (p) => p.inventory !== undefined && p.inventory < 10
        );
      if (selectedCategories.length) {
        processed = processed.filter(
          (p) => p.category && selectedCategories.includes(p.category.name)
        );
      }
      
      setProducts(processed);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: data.count || list.length,
      }));
      return true;
    } catch (e) {
      console.error(e);
      message.error("Failed to load products");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh products
  const handleRefresh = async () => {
    const hide = message.loading("Refreshing products...", 0);
    try {
      // Fetch cả allProducts và display products
      await fetchAllProducts();
      await fetchProducts(pagination.current, pagination.pageSize);
      hide();
      message.success(`Refreshed successfully!`);
    } catch (error) {
      hide();
      console.error("Error refreshing products:", error);
      message.error(`Failed to refresh product list: ${error.message}`);
    }
  };

  // Fetch products and categories khi component mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          message.error("Auth error");
          setLoading(false);
          return;
        }
        
        // Fetch categories
        const categoriesResponse = await fetch(
          "http://localhost:8000/api/categories/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (categoriesResponse.ok) {
          const catData = await categoriesResponse.json();
          setCategories(catData.results || catData || []);
        }
        
        // Fetch ALL products cho metrics
        await fetchAllProducts();
        
        // Fetch paginated products cho display
        await fetchProducts(1, pagination.pageSize);
      } catch (e) {
        console.error(e);
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when search / filters change
  useEffect(() => {
    fetchProducts(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategories, onlyActive, lowStockOnly]);

  // Handle add/edit product
  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalTitle(product ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm");

    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        discount_price: product.discount_price
          ? parseFloat(product.discount_price)
          : null,
        category_id: product.category ? product.category.id : null,
        inventory: product.inventory,
        is_active: product.is_active,
      });

      // Determine the image URL to display
      let imageUrl = null;

      // Try different image sources in order of preference
      if (product.image_url) {
        imageUrl = product.image_url;
      } else if (product.primary_image) {
        imageUrl = product.primary_image;
      } else if (product.image && typeof product.image === "string") {
        imageUrl = product.image.startsWith("http")
          ? product.image
          : `http://localhost:8000${product.image}`;
      }

      if (imageUrl) {
        setFileList([
          {
            uid: "-1",
            name: `product-${product.id}-image.jpg`,
            status: "done",
            url: imageUrl,
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
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price);
      if (values.discount_price) {
        formData.append("discount_price", values.discount_price);
      }
      formData.append("category_id", values.category_id);
      formData.append("inventory", values.inventory);
      formData.append("is_active", values.is_active);

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj || fileList[0];
        if (file && file instanceof File) {
          formData.append("primary_image", file);
        }
      }

      let url = "http://localhost:8000/api/products/";
      let method = "POST";
      if (editingProduct) {
        url = `http://localhost:8000/api/products/${editingProduct.id}/`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errJson = await response.json();
          detail =
            typeof errJson === "string" ? errJson : JSON.stringify(errJson);
        } catch {
          // ignore
        }
        throw new Error(`Failed to save product${detail ? `: ${detail}` : ""}`);
      }

      const _productResponse = await response.json();

      message.success(
        `Sản phẩm ${editingProduct ? "đã được cập nhật" : "đã được thêm"} thành công`
      );
      setModalVisible(false);
      form.resetFields();
      setFileList([]);

      // Refresh both allProducts and display products
      await fetchAllProducts();
      await fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error saving product:", error);
      message.error(error.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  // Handle table changes (pagination, sorting, filtering)
  const handleTableChange = (pag) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
    fetchProducts(pag.current, pag.pageSize);
  };

  // Handle delete product
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/products/${id}/`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed");
      message.success("Sản phẩm đã được xóa");
      
      // Refresh both allProducts and display products
      await fetchAllProducts();
      await fetchProducts(pagination.current, pagination.pageSize);
    } catch (e) {
      console.error(e);
      message.error("Failed to delete product");
    }
  };

  // Inline active toggle
  const toggleActive = async (record) => {
    try {
      const token = localStorage.getItem("access_token");
      const updated = { is_active: !record.is_active };
      const res = await fetch(
        `http://localhost:8000/api/products/${record.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      
      // Refresh both allProducts and display products
      await fetchAllProducts();
      await fetchProducts(pagination.current, pagination.pageSize);
      
      message.success("Trạng thái đã được cập nhật");
    } catch {
      message.error("Toggle failed");
    }
  };

  const renderInventoryTag = (inv) => {
    if (inv === 0) return <Tag color="red">Hết hàng</Tag>;
    if (inv < 5) return <Tag color="volcano">Tồn kho thấp ({inv})</Tag>;
    if (inv < 15) return <Tag color="gold">{inv} trong kho</Tag>;
    return <Tag color="green">{inv} trong kho</Tag>;
  };

  const renderPrice = (price, discount) => {
    if (discount && parseFloat(discount) < parseFloat(price)) {
      return (
        <span>
          <span
            style={{
              textDecoration: "line-through",
              color: "#999",
              marginRight: 4,
            }}
          >
            {currencyFormat(price)}
          </span>
          <Tag color="magenta" icon={<FireOutlined />}>
            {currencyFormat(discount)}
          </Tag>
        </span>
      );
    }
    return <span>{currencyFormat(price)}</span>;
  };

  const buildImageUrl = (record) => {
    return (
      record.image_url ||
      `https://placehold.co/300x400?text=${encodeURIComponent(
        record.category?.name?.split(" ")[0] || record.name.charAt(0)
      )}`
    );
  };

  const ProductCard = ({ item }) => {
    const img = buildImageUrl(item);
    return (
      <Card
        hoverable
        style={{
          borderRadius: 18,
          border: "1px solid rgba(99, 102, 241, 0.12)",
          boxShadow: "0 22px 40px rgba(15, 23, 42, 0.12)",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        bodyStyle={{ display: "flex", flexDirection: "column", gap: 10, padding: 18 }}
        cover={
          <Badge.Ribbon
            text={item.is_active ? "Hoạt Động" : "Không Hoạt Động"}
            color={item.is_active ? "green" : "gray"}
            style={{ fontWeight: 600 }}
          >
            <div
              style={{
                height: 240,
                overflow: "hidden",
                background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={img}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
          </Badge.Ribbon>
        }
        actions={[
          <Tooltip title="Chỉnh sửa" key="edit">
            <EditOutlined onClick={() => showModal(item)} />
          </Tooltip>,
          <Tooltip title="Xóa" key="delete">
            <Popconfirm
              title="Xóa sản phẩm?"
              onConfirm={() => handleDelete(item.id)}
            >
              <DeleteOutlined style={{ color: "#ff4d4f" }} />
            </Popconfirm>
          </Tooltip>,
          <Tooltip title="Chuyển trạng thái" key="active">
            <Switch
              size="small"
              checked={item.is_active}
              onChange={() => toggleActive(item)}
            />
          </Tooltip>,
        ]}
      >
        <Tag
          icon={<TagOutlined />}
          color="purple"
          style={{
            alignSelf: "flex-start",
            borderRadius: 16,
            padding: "2px 12px",
            marginBottom: 6,
          }}
        >
          {item.category?.name || "Chưa Phân Loại"}
        </Tag>
        <Title level={5} style={{ marginBottom: 4 }}>
          {item.name}
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 32,
          }}
        >
          {item.description || "Không có mô tả"}
        </Text>
        <div style={{ marginBottom: 6 }}>
          {renderPrice(item.price, item.discount_price)}
        </div>
        <div style={{ marginBottom: 6 }}>
          {renderInventoryTag(item.inventory)}
        </div>
        {item.discount_price && (
          <Tag color="red" style={{ marginBottom: 4 }}>
            Tiết kiệm{" "}
            {(
              (1 - parseFloat(item.discount_price) / parseFloat(item.price)) *
              100
            ).toFixed(0)}
            %
          </Tag>
        )}
        <Text type="secondary" style={{ fontSize: 12 }}>
          Mã: {item.id}
        </Text>
      </Card>
    );
  };

  // Handle file upload change
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Upload props
  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
    onChange: handleFileChange,
  };

  // Table columns
  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Hình Ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 80,
      render: (_, record) => {
        const imageUrl = buildImageUrl(record);
        return (
          <img
            src={imageUrl}
            alt={record.name}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        );
      },
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Tooltip title={record.description}>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Danh Mục",
      dataIndex: ["category", "name"],
      key: "category",
      filters: categories.map((c) => ({ text: c.name, value: c.name })),
      onFilter: (value, record) => record.category?.name === value,
      render: (value) => <Tag>{value || "—"}</Tag>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
      render: (text, record) => renderPrice(text, record.discount_price),
    },
    {
      title: "Giảm Giá",
      dataIndex: "discount_price",
      key: "discount_price",
      render: (text) =>
        text ? (
          <Tag color="magenta">{currencyFormat(text)}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Tồn Kho",
      dataIndex: "inventory",
      key: "inventory",
      sorter: (a, b) => a.inventory - b.inventory,
      render: (inv) => renderInventoryTag(inv),
    },
    {
      title: "Hoạt Động",
      dataIndex: "is_active",
      key: "is_active",
      filters: [
        { text: "Hoạt Động", value: true },
        { text: "Không Hoạt Động", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (active, record) => (
        <Switch
          checked={active}
          size="small"
          onChange={() => toggleActive(record)}
        />
      ),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sản phẩm này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const FiltersBar = (
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
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12} lg={8}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Tìm kiếm theo tên hoặc mô tả"
            style={{ width: "100%" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Select
            mode="multiple"
            maxTagCount={2}
            placeholder="Chọn danh mục"
            style={{ width: "100%" }}
            value={selectedCategories}
            onChange={setSelectedCategories}
            allowClear
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.name}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={12} lg={4}>
          <Tooltip title="Chỉ hiển thị sản phẩm hoạt động">
            <Space align="center">
              <Switch
                checked={onlyActive}
                onChange={setOnlyActive}
                size="small"
              />
              <Text>Hoạt Động</Text>
            </Space>
          </Tooltip>
        </Col>
        <Col xs={24} md={12} lg={4}>
          <Tooltip title="Lọc sản phẩm có tồn kho dưới 10">
            <Space align="center">
              <Switch
                checked={lowStockOnly}
                onChange={setLowStockOnly}
                size="small"
              />
              <Text>Tồn Kho Thấp</Text>
            </Space>
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );

  const ProductGrid = (
    <Card
      style={{
        borderRadius: 20,
        border: "1px solid rgba(148, 163, 184, 0.24)",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        background: "#ffffff",
      }}
      bodyStyle={{ padding: 24 }}
    >
      <div style={{ minHeight: 200 }}>
        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Col xs={12} sm={8} md={6} lg={6} key={i}>
                <Card style={{ borderRadius: 16 }}>
                  <Skeleton.Image style={{ width: "100%", height: 180 }} />
                  <Skeleton active title={false} paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : products.length ? (
          <Row gutter={[16, 16]}>
            {products.map((p) => (
              <Col xs={12} sm={12} md={8} lg={6} key={p.id}>
                <ProductCard item={p} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không tìm thấy sản phẩm" />
        )}
      </div>
    </Card>
  );

  const ProductTable = (
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
        dataSource={products}
        rowKey="id"
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
        size="middle"
        scroll={{ x: 900 }}
        style={{ borderRadius: 20 }}
        locale={{
          emptyText: (
            <div style={{ padding: "20px 0" }}>
              <p>No products found</p>
              <Button
                type="primary"
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
              >
                Tải Lại Sản Phẩm
              </Button>
            </div>
          ),
        }}
      />
    </Card>
  );

  // Header section
  const headerSection = (
    <Card
      style={{
        borderRadius: 24,
        background: "linear-gradient(90deg, #5b21b6 0%, #2563eb 100%)",
        color: "#fff",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.25)",
        marginBottom: 12,
        border: "none",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Row gutter={[24, 24]} align="middle" justify="space-between">
        <Col xs={24} md={14} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 650 }}>
              QUẢN LÝ SẢN PHẨM
            </Title>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Tag color="geekblue" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
              Tổng: {productMetrics.total}
            </Tag>
            <Tag color="green" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
              Hoạt Động: {productMetrics.active}
            </Tag>
            <Tag color="volcano" style={{ background: "rgba(255,255,255,0.08)", color: '#fff' }}>
              Tồn Kho Thấp: {productMetrics.lowStock}
            </Tag>
          </div>
        </Col>
        <Col xs={24} md={10}>
          <Space size={12} style={{ width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title={viewMode === 'Table' ? 'Chế độ bảng' : 'Chế độ lưới'}>
              <Segmented
                size="middle"
                options={[
                  {
                    label: <Tooltip title="Table"><UnorderedListOutlined style={{ fontSize: 16 }} /></Tooltip>,
                    value: "Table",
                  },
                  {
                    label: <Tooltip title="Grid"><AppstoreOutlined style={{ fontSize: 16 }} /></Tooltip>,
                    value: "Grid",
                  },
                ]}
                value={viewMode}
                onChange={setViewMode}
                style={{ minWidth: 120, borderRadius: 8 }}
              />
            </Tooltip>

            <Tooltip title="Làm mới sản phẩm">
              <Button
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff' }}
              />
            </Tooltip>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              style={{ borderRadius: 10 }}
            >
              Thêm Sản Phẩm
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div
      style={{
        padding: 8,
        background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
        borderRadius: 24,
        minHeight: "100%",
      }}
    >
      {headerSection}
      {FiltersBar}
      {viewMode === "Table" ? ProductTable : ProductGrid}

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Sản Phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh Mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              formatter={(value) =>
                `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
              placeholder="Nhập giá"
            />
          </Form.Item>

          <Form.Item name="discount_price" label="Giá Giảm (Tùy Chọn)">
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              formatter={(value) =>
                value ? `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
              placeholder="Nhập giá giảm"
            />
          </Form.Item>

          <Form.Item
            name="inventory"
            label="Tồn Kho"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng tồn kho" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng tồn kho"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Hoạt Động"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Hình Ảnh Sản Phẩm"
            tooltip="Tải lên hình ảnh lên Cloudinary qua backend"
          >
            <Upload
              {...uploadProps}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Chọn Hình Ảnh</Button>
            </Upload>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary">
                Hình ảnh sẽ được tải lên Cloudinary khi bạn lưu sản phẩm.
              </Text>
            </div>
          </Form.Item>

          <Form.Item>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                {editingProduct ? "Cập Nhật" : "Thêm"} Sản Phẩm
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;