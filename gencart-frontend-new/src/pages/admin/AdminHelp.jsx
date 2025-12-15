import React, { useState, useEffect, useCallback } from 'react';
import {
  Tabs, Layout, Typography, Table, Tag, Space, Card, Row, Col, Input,
  Button, Modal, Form, message, Switch, Alert, Select, List, Avatar, Tooltip
} from 'antd';
import {
  ReloadOutlined, PlusOutlined, ClockCircleOutlined, SolutionOutlined,
  AlertOutlined, EditOutlined, BookOutlined, SettingOutlined,
  DeleteOutlined, LineChartOutlined, EyeOutlined, LikeOutlined, 
  SearchOutlined, MessageOutlined, AppstoreOutlined, BarsOutlined, PushpinOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

// Styles
const GRADIENT_BUTTON_STYLE = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  color: '#fff'
};

// Custom CSS
const customStyles = `
  .help-summary-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
  }
  .help-summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .help-summary-card-mini {
    --accent-color: #1890ff;
  }
  .summary-inner {
    padding: 8px;
    text-align: center;
  }
  .summary-icon {
    font-size: 32px;
    color: var(--accent-color);
    margin-bottom: 8px;
  }
  .summary-number {
    font-size: 32px;
    font-weight: bold;
    color: var(--accent-color);
    margin: 8px 0;
  }
  .summary-progress {
    width: 100%;
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    margin: 8px 0;
    overflow: hidden;
  }
  .summary-progress-fill {
    height: 100%;
    background: var(--accent-color);
    transition: width 0.3s ease;
  }
  .summary-label {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  }
  .admin-help-controls .ant-input-prefix {
    margin-right: 8px;
    color: #94a3b8;
  }
  .admin-help-controls .ant-input-affix-wrapper,
  .admin-help-controls .ant-select-selector,
  .admin-help-controls .ant-btn {
    height: 44px !important;
    min-height: 44px !important;
    line-height: 44px !important;
    display: flex;
    align-items: center;
    border-radius: 8px !important;
  }
  .admin-help-controls .ant-btn {
    padding: 0 12px !important;
    border-radius: 8px !important;
  }
  .admin-help-controls .ant-btn-primary {
    box-shadow: 0 6px 18px rgba(37,99,235,0.12);
  }
  .admin-help-controls .ant-input-affix-wrapper .ant-input {
    padding-right: 48px;
  }
  /* hide default suffix search icon inside Search in admin-help area */
  .admin-help-controls .ant-input-suffix {
    display: none !important;
  }
  /* Ensure Select inner content vertically centers like Search */
  .admin-help-controls .ant-select {
    display: inline-flex;
    align-items: center;
  }
  .admin-help-controls .ant-select-selector {
    display: flex !important;
    align-items: center !important;
  }
  /* View toggle wrapper (grid/list) */
  .admin-help-controls .view-toggle-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    padding: 6px;
    border-radius: 12px;
    border: 1px solid rgba(148,163,184,0.08);
    box-shadow: 0 8px 20px rgba(91,33,182,0.04);
  }
  .admin-help-controls .admin-view-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px !important;
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .admin-help-controls .admin-view-btn.selected {
    background: linear-gradient(90deg,#6b46c1 0%,#5b21b6 100%) !important;
    color: #fff !important;
    box-shadow: 0 8px 20px rgba(91,33,182,0.12) !important;
  }
  /* Make inputs/selects less square and ensure content doesn't overflow rounded corners */
  .admin-help-controls .ant-input-affix-wrapper,
  .admin-help-card .ant-input-affix-wrapper,
  .admin-help-controls .ant-select-selector {
    border-radius: 8px !important;
    overflow: hidden;
  }
  .admin-help-controls .admin-controls-card {
    borderRadius: 16px;
  }
  /* White/soft card wrapper for the controls to match Categories layout */
  .admin-help-card {
    border-radius: 16px;
    border: 1px solid rgba(148,163,184,0.06);
    box-shadow: 0 8px 20px rgba(15,23,42,0.04);
    background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
    margin-top: -8px;
    margin-bottom: 12px;
    padding: 16px 20px;
  }
  /* Grid card visual polish */
  .admin-help-card .ant-list-item .ant-card {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(15,23,42,0.04);
    box-shadow: 0 6px 18px rgba(15,23,42,0.06);
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .admin-help-card .ant-list-item .ant-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(15,23,42,0.08);
  }
  .admin-help-card .ant-card-cover img {
    height: 200px;
    object-fit: cover;
  }
  .admin-help-card .ant-card-meta {
    padding: 12px 16px 8px 16px;
  }
  /* Table inside admin-help card (table mode) */
  .admin-help-card .ant-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 22px rgba(15,23,42,0.06);
    border: 1px solid rgba(15,23,42,0.04);
    background: #fff;
  }
  .admin-help-card .ant-list-item {
    padding: 0 !important;
  }
  /* Hide right search button in Blog card but keep it for Ticket search */
  .admin-help-card .ant-input-search-button {
    display: none !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

// Mock data
const MOCK_CURRENT_USER = 'Doãn Bá Min';
const currentTimestamp = Date.now();

const mockTickets = [
  { 
    key: '1001', 
    id: '#1001', 
    title: 'Lỗi không áp dụng mã giảm giá', 
    status: 'Đang Xử lý', 
    priority: 'TRUNG BÌNH', 
    customer: 'Nguyễn Văn A', 
    assigned: 'Chưa gán', 
    updated: currentTimestamp - 30 * 60 * 1000, 
    source: 'Form Web', 
    SLA_due: currentTimestamp + 60 * 60 * 1000 
  },
  { 
    key: '1002', 
    id: '#1002', 
    title: 'Thắc mắc về chính sách đổi hàng', 
    status: 'Mới', 
    priority: 'TRUNG BÌNH', 
    customer: 'Lê Thị C', 
    assigned: 'Chưa gán', 
    updated: currentTimestamp - 7200000, 
    source: 'Email', 
    SLA_due: currentTimestamp + 3600000 
  },
];

const mockBlogPosts = [
  {
    id: 1,
    title: 'Hướng dẫn sử dụng mã giảm giá',
    description: 'Cách áp dụng và sử dụng mã giảm giá hiệu quả nhất',
    category: 'Khuyên Mái',
    tags: ['Voucher', 'Giảm Giá'],
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    status: 'published',
    views: 1250,
    likes: 89,
    comments: 12,
    commentsData: [],
    author: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
    date: '2024-01-15',
    readTime: '5 phút đọc',
    isPinned: false,
    content: 'Nội dung chi tiết về cách sử dụng mã giảm giá...'
  },
  {
    id: 2,
    title: 'Cập nhật chính sách đổi trả hàng',
    description: 'Thông tin mới nhất về chính sách đổi trả sản phẩm',
    category: 'Thông Báo',
    tags: ['Chính sách', 'Đổi trả'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    status: 'published',
    views: 890,
    likes: 45,
    comments: 8,
    commentsData: [],
    author: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=2',
    date: '2024-01-14',
    readTime: '3 phút đọc',
    isPinned: true,
    content: 'Chi tiết về chính sách đổi trả...'
  },
  {
    id: 3,
    title: 'Mẹo chọn khuyên tai phù hợp với khuôn mặt',
    description: 'Hướng dẫn chọn khuyên tai đẹp cho từng khuôn mặt',
    category: 'Tư Vấn',
    tags: ['Khuyên tai', 'Thời trang'],
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    status: 'published',
    views: 2100,
    likes: 156,
    comments: 23,
    commentsData: [],
    author: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=3',
    date: '2024-01-13',
    readTime: '7 phút đọc',
    isPinned: false,
    content: 'Hướng dẫn chi tiết về cách chọn khuyên tai...'
  },
  {
    id: 4,
    title: 'Sự kiện Flash Sale cuối tuần',
    description: 'Giảm giá khủng lên đến 50% cho tất cả sản phẩm',
    category: 'Sự Kiện',
    tags: ['Flash Sale', 'Giảm giá'],
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400',
    status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    commentsData: [],
    author: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=4',
    date: '2024-01-15',
    readTime: '2 phút đọc',
    isPinned: false,
    content: 'Thông tin về sự kiện Flash Sale...'
  }
];

const mockAutomationRules = [
  { 
    key: 1, 
    name: 'Tự động gán Ticket Thanh toán', 
    condition: 'Tiêu đề chứa "Thanh toán"', 
    action: 'Gán cho Trần B', 
    enabled: true 
  },
];

// Utility functions
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const getStatusTag = (status) => {
  const statusMap = {
    'Mới': <Tag color="blue">Mới</Tag>,
    'Đang Xử lý': <Tag color="gold">Đang Xử lý</Tag>,
    'Chờ Phản hồi': <Tag color="processing">Chờ Phản hồi</Tag>,
    'Khẩn cấp': <Tag color="red" icon={<AlertOutlined />}>Khẩn cấp</Tag>,
    'Đã Đóng': <Tag color="green">Đã Đóng</Tag>
  };
  return statusMap[status] || <Tag>{status}</Tag>;
};

const getPriorityTag = (priority) => {
  const priorityMap = {
    'CAO': <Tag color="red" icon={<AlertOutlined />}>Cao</Tag>,
    'TRUNG BÌNH': <Tag color="orange">Trung Bình</Tag>,
    'THẤP': <Tag color="default">Thấp</Tag>
  };
  return priorityMap[priority] || <Tag>{priority}</Tag>;
};

// Tab 1: Ticket Management
const TicketManagementTab = ({ onTicketsLoaded, refreshKey }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createTicketForm] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailActionLoading, setDetailActionLoading] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;

  const loadTickets = () => {
    let stored = JSON.parse(localStorage.getItem('tickets') || '[]');
    if (stored.length === 0) {
      stored = mockTickets;
      localStorage.setItem('tickets', JSON.stringify(stored));
    }
    return stored;
  };

  const fetchTickets = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const loadedTickets = loadTickets();
      setTickets(loadedTickets);
      if (onTicketsLoaded) onTicketsLoaded(loadedTickets);
      setLoading(false);
      message.success(`Đã tải ${loadedTickets.length} Tickets`);
    }, 500);
  }, [onTicketsLoaded]);

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  const handleUpdateTicket = (ticketKey, changes) => {
    const updated = tickets.map(t => t.key === ticketKey ? { ...t, ...changes } : t);
    setTickets(updated);
    localStorage.setItem('tickets', JSON.stringify(updated));
    if (onTicketsLoaded) onTicketsLoaded(updated);
    message.success('Cập nhật ticket thành công');
  };

  const handleQuickSet = (type) => {
    if (!selectedTicket) return;
    setDetailActionLoading(true);
    setTimeout(() => {
      if (type === 'Khẩn cấp') {
        handleUpdateTicket(selectedTicket.key, { status: 'Khẩn cấp', priority: 'CAO', updated: Date.now() });
      } else {
        handleUpdateTicket(selectedTicket.key, { status: type, updated: Date.now(), priority: type === 'Mới' ? 'TRUNG BÌNH' : undefined });
      }
      setDetailActionLoading(false);
      setDetailModalVisible(false);
      setSelectedTicket(null);
    }, 400);
  };

  const handleCloseTicket = (ticketKey) => {
    handleUpdateTicket(ticketKey, { status: 'Đã Đóng', updated: Date.now() });
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (typeof refreshKey !== 'undefined') {
      fetchTickets();
    }
  }, [refreshKey, fetchTickets]);

  const handleCreateTicket = () => {
    createTicketForm.validateFields().then(values => {
      const newTicket = {
        key: `${Date.now()}`,
        id: `#${1000 + tickets.length + 1}`,
        title: values.title,
        status: 'Mới',
        priority: values.priority,
        customer: values.customer,

        updated: Date.now(),
        source: values.source,
        SLA_due: Date.now() + 6 * 3600000,
      };
      const updatedTickets = [newTicket, ...tickets];
      setTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      message.success(`Đã tạo ticket ${newTicket.id}`);
      setIsCreateModalVisible(false);
      createTicketForm.resetFields();
    });
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    t.customer.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: getStatusTag },
    { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', render: getPriorityTag },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => handleOpenDetail(record)}>Chi tiết</Button>
          <Button size="small" type="link" danger onClick={() => handleCloseTicket(record.key)}>Đóng</Button>
        </Space>
      ),
    },

  ];

  const newTicketsCount = tickets.filter(t => t.status === 'Mới').length;
  const inProgressCount = tickets.filter(t => t.status === 'Đang Xử lý').length;
  const pendingCount = tickets.filter(t => t.status === 'Chờ Phản hồi').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'CAO').length;
  const maxCount = Math.max(newTicketsCount, inProgressCount, pendingCount, highPriorityCount, 1);

  return (
    <>
      <Alert
        message={<Text strong>Chào mừng {MOCK_CURRENT_USER}! Có {tickets.length} tickets đang chờ xử lý.</Text>}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ '--accent-color': '#1890ff' }}>
            <div className="summary-inner">
              <div className="summary-icon"><AlertOutlined /></div>
              <div className="summary-number">{newTicketsCount}</div>
              <div className="summary-progress">
                <div className="summary-progress-fill" style={{ width: `${Math.round((newTicketsCount / maxCount) * 100)}%` }} />
              </div>
              <div className="summary-label">Ticket Mới</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ '--accent-color': '#faad14' }}>
            <div className="summary-inner">
              <div className="summary-icon"><SolutionOutlined /></div>
              <div className="summary-number">{inProgressCount}</div>
              <div className="summary-progress">
                <div className="summary-progress-fill" style={{ width: `${Math.round((inProgressCount / maxCount) * 100)}%` }} />
              </div>
              <div className="summary-label">Đang Xử lý</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ '--accent-color': '#52c41a' }}>
            <div className="summary-inner">
              <div className="summary-icon"><ClockCircleOutlined /></div>
              <div className="summary-number">{pendingCount}</div>
              <div className="summary-progress">
                <div className="summary-progress-fill" style={{ width: `${Math.round((pendingCount / maxCount) * 100)}%` }} />
              </div>
              <div className="summary-label">Chờ Phản hồi</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="help-summary-card help-summary-card-mini" bordered={false} hoverable style={{ '--accent-color': '#f5222d' }}>
            <div className="summary-inner">
              <div className="summary-icon"><AlertOutlined /></div>
              <div className="summary-number">{highPriorityCount}</div>
              <div className="summary-progress">
                <div className="summary-progress-fill" style={{ width: `${Math.round((highPriorityCount / maxCount) * 100)}%` }} />
              </div>
              <div className="summary-label">Khẩn cấp</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="admin-help-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} style={GRADIENT_BUTTON_STYLE}>
            Tạo Ticket Thủ Công
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchTickets} loading={loading}>
            Tải lại
          </Button>
        </Space>
        <Search
          placeholder="Tìm kiếm ticket..."
          onSearch={setSearchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: isMobile ? '100%' : 300, marginRight: 8 }}
          allowClear
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          suffix={null}
          enterButton={false}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredTickets}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={selectedTicket ? `Chi tiết ${selectedTicket.id}` : 'Chi tiết Ticket'}
        open={detailModalVisible}
        onCancel={() => { setDetailModalVisible(false); setSelectedTicket(null); }}
        footer={null}
      >
        {selectedTicket && (
          <div>
            <Row gutter={12} style={{ marginBottom: 12 }}>
              <Col span={24}>
                <Text strong>{selectedTicket.title}</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Khách hàng: </Text>
                  <Text>{selectedTicket.customer}</Text>
                </div>
                {selectedTicket.email && (
                  <div>
                    <Text type="secondary">Email: </Text>
                    <Text>{selectedTicket.email}</Text>
                  </div>
                )}
                {selectedTicket.phone && (
                  <div>
                    <Text type="secondary">Số điện thoại: </Text>
                    <Text>{selectedTicket.phone}</Text>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Nội dung: </Text>
                  <div style={{ padding: 8, background: '#fafafa', borderRadius: 6 }}>{selectedTicket.message}</div>
                </div>
              </Col>
            </Row>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <Button type={selectedTicket.status === 'Mới' ? 'primary' : 'default'} onClick={() => handleQuickSet('Mới')} loading={detailActionLoading}>Mới</Button>
              <Button type={selectedTicket.status === 'Đang Xử lý' ? 'primary' : 'default'} onClick={() => handleQuickSet('Đang Xử lý')} loading={detailActionLoading}>Đang Xử lý</Button>
              <Button type={selectedTicket.status === 'Chờ Phản hồi' ? 'primary' : 'default'} onClick={() => handleQuickSet('Chờ Phản hồi')} loading={detailActionLoading}>Chờ Phản hồi</Button>
              <Button type={selectedTicket.priority === 'CAO' || selectedTicket.status === 'Khẩn cấp' ? 'primary' : 'default'} danger onClick={() => handleQuickSet('Khẩn cấp')} loading={detailActionLoading}>Khẩn cấp</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Tạo Ticket Mới"
        open={isCreateModalVisible}
        onOk={handleCreateTicket}
        onCancel={() => setIsCreateModalVisible(false)}
        width={700}
      >
        <Form form={createTicketForm} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input placeholder="Nhập tiêu đề ticket" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customer" label="Khách hàng" rules={[{ required: true }]}>
                <Input placeholder="Tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Ưu tiên" initialValue="TRUNG BÌNH">
                <Select>
                  <Select.Option value="THẤP">Thấp</Select.Option>
                  <Select.Option value="TRUNG BÌNH">Trung Bình</Select.Option>
                  <Select.Option value="CAO">Cao</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="source" label="Nguồn" initialValue="Form Web">
                <Select>
                  <Select.Option value="Form Web">Form Web</Select.Option>
                  <Select.Option value="Email">Email</Select.Option>
                  <Select.Option value="Điện thoại">Điện thoại</Select.Option>
                </Select>
              </Form.Item>
            </Col>
  
          </Row>
        </Form>
      </Modal>
    </>
  );
};

// Tab 2: Blog Management
const BlogManagementTab = ({ onPostsLoaded, refreshKey }) => {
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [currentPostComments, setCurrentPostComments] = useState(null);

  const categories = [
    { value: 'Khuyên Mái', label: 'Khuyên Mái' },
    { value: 'Sản Phẩm', label: 'Sản Phẩm' },
    { value: 'Sự Kiện', label: 'Sự Kiện' },
    { value: 'Về Chúng Tôi', label: 'Về Chúng Tôi' },
    { value: 'Tư Vấn', label: 'Tư Vấn' },
    { value: 'Mẹo Hay', label: 'Mẹo Hay' },
    { value: 'Thời Trang', label: 'Thời Trang' },
    { value: 'Thông Báo', label: 'Thông Báo' }
  ];

  const handleOpenModal = (post = null) => {
    setEditingPost(post);
    if (post) {
      form.setFieldsValue({
        ...post,
        tags: (post.tags || []).join(', '),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const formValues = {
        ...values,
        tags: (values.tags || '').split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingPost) {
        setBlogPosts(blogPosts.map(p =>
          p.id === editingPost.id ? { ...editingPost, ...formValues } : p
        ));
        message.success('Đã cập nhật bài viết!');
      } else {
        const newPost = {
          ...formValues,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          author: MOCK_CURRENT_USER,
          avatar: 'https://i.pravatar.cc/150?img=1',
          views: 0,
          likes: 0,
          comments: 0,
          commentsData: [],
          readTime: '5 phút đọc',
          status: 'published',
          isPinned: false,
        };
        setBlogPosts([newPost, ...blogPosts]);
        message.success('Đã tạo bài viết mới!');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa bài viết?',
      content: 'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setBlogPosts(blogPosts.filter(p => p.id !== id));
        message.success('Đã xóa bài viết!');
      },
    });
  };

  const handleTogglePin = (id) => {
    setBlogPosts(blogPosts.map(p =>
      p.id === id ? { ...p, isPinned: !p.isPinned } : p
    ));
    const post = blogPosts.find(p => p.id === id);
    message.success(post?.isPinned ? 'Đã bỏ ghim bài viết.' : 'Đã ghim bài viết!');
  };

  const handleTogglePublish = (postId, checked) => {
    const newStatus = checked ? 'published' : 'draft';
    setBlogPosts(prevPosts => 
      prevPosts.map(post =>
        post.id === postId ? { ...post, status: newStatus } : post
      )
    );
    message.success(`Đã cập nhật trạng thái: ${newStatus === 'published' ? 'Xuất bản' : 'Bản nháp'}`);
  };

  useEffect(() => {
    if (typeof onPostsLoaded === 'function') onPostsLoaded(blogPosts);
  }, [blogPosts, onPostsLoaded]);

  useEffect(() => {
    if (typeof refreshKey !== 'undefined') {
      setLoading(true);
      setTimeout(() => {
        setBlogPosts(mockBlogPosts);
        setLoading(false);
      }, 300);
    }
  }, [refreshKey]);

  const showCommentModal = (post) => {
    setCurrentPostComments(post);
    setIsCommentModalVisible(true);
  };

  const processedPosts = blogPosts
    .filter(post => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = !selectedCategory || post.category === selectedCategory;
      return titleMatch && categoryMatch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.id - a.id;
    });

  const tableColumns = [
    {
      title: 'Bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          {record.isPinned && (
            <Tooltip title="Đã ghim">
              <PushpinOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          <Avatar src={record.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${record.author}`} />
          <Text style={{ maxWidth: 300 }} ellipsis={{ tooltip: title }}>{title}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Tooltip title={status === 'published' ? 'Tắt xuất bản (chuyển về Nháp)' : 'Xuất bản bài viết'}>
          <Switch
            checked={status === 'published'}
            onChange={(checked) => handleTogglePublish(record.id, checked)}
          />
        </Tooltip>
      )
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary"><EyeOutlined /> {record.views || 0}</Text>
          <Text type="secondary"><LikeOutlined /> {record.likes || 0}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.views + a.likes) - (b.views + b.likes),
    },
    {
      title: 'Bình luận',
      dataIndex: 'comments',
      key: 'comments',
      width: 120,
      render: (comments, record) => (
        <Button 
          type="link" 
          icon={<MessageOutlined />} 
          onClick={() => showCommentModal(record)}
        >
          {comments || 0}
        </Button>
      ),
      sorter: (a, b) => a.comments - b.comments,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
            <Button
              icon={<PushpinOutlined />}
              style={{ color: record.isPinned ? '#1890ff' : 'inherit' }}
              onClick={() => handleTogglePin(record.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <>
      <div className="admin-help-card admin-help-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm theo tiêu đề..."
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 240 }}
            allowClear
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            suffix={null}
            enterButton={false}
          />
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: 240 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={categories}
            onChange={setSelectedCategory}
            value={selectedCategory}
          />
          <div className="view-toggle-wrap">
            <Tooltip title="Xem dạng Lưới">
              <Button
                className={`admin-view-btn ${viewMode === 'grid' ? 'selected' : ''}`}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
            <Tooltip title="Xem dạng Bảng">
              <Button
                className={`admin-view-btn ${viewMode === 'table' ? 'selected' : ''}`}
                icon={<BarsOutlined />}
                onClick={() => setViewMode('table')}
              />
            </Tooltip>
          </div>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={GRADIENT_BUTTON_STYLE}>
          Tạo bài viết mới
        </Button>
      </div>

      {/* End control card */}

      {viewMode === 'grid' ? (
        <List
          loading={loading}
          grid={{ 
            gutter: 16, 
            xs: 1, 
            sm: 2, 
            md: 2, 
            lg: 3, 
            xl: 4,
            xxl: 4
          }}
          dataSource={processedPosts}
          pagination={{ pageSize: 8, align: 'center' }}
          renderItem={(post) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                cover={
                  <div style={{ position: 'relative' }}>
                    <img
                      alt={post.title}
                      src={post.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                      style={{ height: 200, width: '100%', objectFit: 'cover' }}
                    />
                    {post.status === 'draft' && (
                      <Tag
                        color="gold"
                        style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                      >
                        Bản Nháp
                      </Tag>
                    )}
                    {post.isPinned && (
                      <Tag
                        color="blue"
                        icon={<PushpinOutlined />}
                        style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
                      >
                        Đã ghim
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  <Tooltip title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}>
                    <PushpinOutlined
                      style={{ color: post.isPinned ? '#1890ff' : 'inherit', fontSize: 16 }}
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(post.id); }}
                    />
                  </Tooltip>,
                  <Tooltip title={post.status === 'published' ? 'Tắt xuất bản' : 'Xuất bản'}>
                    <Switch
                      size="small"
                      checked={post.status === 'published'}
                      onChange={(checked) => handleTogglePublish(post.id, checked)}
                      onClick={(_, e) => e.stopPropagation()}
                    />
                  </Tooltip>,
                  <Tooltip title="Chỉnh sửa">
                    <EditOutlined 
                      style={{ fontSize: 16 }}
                      key="edit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(post);
                      }} 
                    />
                  </Tooltip>,
                  <Tooltip title="Xóa">
                    <DeleteOutlined 
                      style={{ fontSize: 16, color: '#ff4d4f' }}
                      key="delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }} 
                    />
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  avatar={<Avatar src={post.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${post.author}`} />}
                  title={
                    <Text strong style={{ fontSize: 15, display: 'block' }} ellipsis={{ tooltip: post.title }}>
                      {post.title}
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', lineHeight: '1.5', marginTop: 4 }} ellipsis={{ rows: 2 }}>
                      {post.description}
                    </Text>
                  }
                  style={{ marginBottom: 12 }}
                />

                <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 12 }}>
                  <div>
                    <Tag color="blue" style={{ marginRight: 0 }}>{post.category}</Tag>
                  </div>
                  <div>
                    <Space size={[4, 4]} wrap>
                      {(post.tags || []).slice(0, 3).map(tag => (
                        <Tag key={tag} style={{ fontSize: 11, padding: '0 6px', margin: 0 }}>{tag}</Tag>
                      ))}
                      {(post.tags || []).length > 3 && (
                        <Tag style={{ fontSize: 11, padding: '0 6px', margin: 0 }}>+{(post.tags || []).length - 3}</Tag>
                      )}
                    </Space>
                  </div>
                </Space>

                <div style={{ 
                  marginTop: 16, 
                  paddingTop: 12, 
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Space size={16}>
                    <Tooltip title="Lượt xem">
                      <Space size={4} style={{ cursor: 'default', fontSize: 13 }}>
                        <EyeOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>{post.views || 0}</Text>
                      </Space>
                    </Tooltip>
                    <Tooltip title="Lượt thích">
                      <Space size={4} style={{ cursor: 'default', fontSize: 13 }}>
                        <LikeOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>{post.likes || 0}</Text>
                      </Space>
                    </Tooltip>
                    <Tooltip title="Bình luận">
                      <Space 
                        size={4}
                        onClick={(e) => { e.stopPropagation(); showCommentModal(post); }} 
                        style={{ cursor: 'pointer', fontSize: 13 }}
                      >
                        <MessageOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {post.commentsData?.length || post.comments || 0}
                        </Text>
                      </Space>
                    </Tooltip>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Table
          loading={loading}
          columns={tableColumns}
          dataSource={processedPosts}
          rowKey="id"
          pagination={{ pageSize: 10, align: 'center' }}
          scroll={{ x: 'max-content' }}
        />
      )}

      <Modal
        title={editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form 
          form={form} 
          layout="vertical" 
          name="blog_post_form"
          initialValues={{ status: 'published' }}
        >
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="image" label="Link Ảnh bìa" rules={[{ required: true, message: 'Vui lòng nhập link ảnh' }, { type: 'url', message: 'Link ảnh không hợp lệ' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  showSearch
                  optionLabelProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={categories}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Tags (phân cách bằng dấu phẩy)">
                <Input placeholder="Voucher, Giảm Giá, 11.11, ..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="Nội dung chi tiết">
            <Input.TextArea rows={10} placeholder="Nội dung chi tiết bài viết... (Bạn có thể dùng text hoặc HTML cơ bản)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <MessageOutlined />
            Bình luận cho bài viết: "{currentPostComments?.title}"
          </Space>
        }
        open={isCommentModalVisible}
        onCancel={() => { setIsCommentModalVisible(false); setCurrentPostComments(null); }}
        footer={[
          <Button key="close" onClick={() => { setIsCommentModalVisible(false); setCurrentPostComments(null); }}>
            Đóng
          </Button>,
        ]}
      >
        <List
          dataSource={currentPostComments?.commentsData || []}
          locale={{ emptyText: "Chưa có bình luận nào cho bài viết này." }}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={comment.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${comment.author}`} />}
                title={<Text strong>{comment.author}</Text>}
                description={comment.content}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{comment.date}</Text>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

// Tab 3: Reports
import { Line } from '@ant-design/plots';

const ReportsTab = ({ blogPosts = [] }) => {
  const [ticketsData, setTicketsData] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [rangeDays, setRangeDays] = useState(14);
  const [statusFilter, setStatusFilter] = useState(null);
  // Blog metrics
  const totalPosts = (blogPosts || []).length;
  const publishedCount = (blogPosts || []).filter(p => p.status === 'published').length;
  const draftCount = totalPosts - publishedCount;
  const pinnedCount = (blogPosts || []).filter(p => p.isPinned).length;
  const totalViews = (blogPosts || []).reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = (blogPosts || []).reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = (blogPosts || []).reduce((s, p) => s + (p.commentsData?.length || p.comments || 0), 0);
  const recentPosts = (blogPosts || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // load tickets from localStorage and listen to storage changes
  useEffect(() => {
    let mounted = true;
    const load = () => {
      setLoadingReports(true);
      try {
        const stored = JSON.parse(localStorage.getItem('tickets') || '[]');
        if (mounted) setTicketsData(stored || []);
      } catch (err) {
        console.error('Failed to load ticket data for reports', err);
        if (mounted) setTicketsData([]);
      } finally {
        if (mounted) setLoadingReports(false);
      }
    };
    load();

    const handler = (e) => {
      if (e.key === 'tickets') load();
    };
    window.addEventListener('storage', handler);
    return () => { mounted = false; window.removeEventListener('storage', handler); };
  }, []);

  // utility: filter tickets by date range and status
  const getFiltered = (tickets, days, status) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    return tickets.filter(t => {
      const d = t.updated ? new Date(t.updated) : null;
      if (!d) return false;
      if (d < start || d > end) return false;
      if (status && t.status !== status) return false;
      return true;
    });
  };

  const filtered = getFiltered(ticketsData, rangeDays, statusFilter);

  // Build time series for line chart
  const buildTimeSeries = (tickets, days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const map = new Map();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }

    tickets.forEach(t => {
      const date = t.updated ? new Date(t.updated) : null;
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, map.get(key) + 1);
    });

    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  };

  const ticketsSeries = buildTimeSeries(filtered, rangeDays);

  // KPIs
  const totalTickets = filtered.length;
  const avgPerDay = rangeDays > 0 ? (totalTickets / rangeDays).toFixed(2) : 0;
  const busiest = ticketsSeries.reduce((acc, cur) => (cur.count > acc.count ? cur : acc), { date: null, count: 0 });
  const statusCounts = filtered.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  // CSV export
  const exportCSV = () => {
    const headers = ['id', 'title', 'status', 'priority', 'customer', 'email', 'phone', 'updated'];
    const rows = filtered.map(t => [t.id, t.title, t.status, t.priority, t.customer, t.email || '', t.phone || '', t.updated ? new Date(t.updated).toISOString() : '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${rangeDays}d${statusFilter?`_${statusFilter}`:''}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const lineConfig = {
    data: ticketsSeries,
    xField: 'date',
    yField: 'count',
    smooth: true,
    height: 300,
    color: '#2563eb',
    point: { size: 4, style: { fill: '#fff' } },
    area: { style: { fill: 'l(270) 0:#ffffff 0.3:#eef2ff 1:#eef2ff' } },
    xAxis: { tickCount: Math.min(rangeDays, 10) },
    meta: { date: { alias: 'Ngày' }, count: { alias: 'Số ticket' } },
  };



  return (
    <div style={{ width: '100%' }}>
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Tổng trong {rangeDays} ngày</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{totalTickets}</div></Card></Col>
        <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Trung bình /ngày</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{avgPerDay}</div></Card></Col>
        <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Ngày đông nhất</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{busiest.date || '-' } ({busiest.count})</div></Card></Col>
        <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Mở</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{(statusCounts['Mới']||0)+(statusCounts['Đang Xử lý']||0)+(statusCounts['Chờ Phản hồi']||0)}</div></Card></Col>
      </Row>

      <Card style={{ marginBottom: 12 }} bodyStyle={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Báo cáo Tickets</Title>
            <Text type="secondary">Thống kê số lượng ticket theo thời gian</Text>
          </div>

          <Space>
            <Button size="small" type={rangeDays === 7 ? 'primary' : 'default'} onClick={() => setRangeDays(7)}>7 ngày</Button>
            <Button size="small" type={rangeDays === 14 ? 'primary' : 'default'} onClick={() => setRangeDays(14)}>14 ngày</Button>
            <Button size="small" type={rangeDays === 30 ? 'primary' : 'default'} onClick={() => setRangeDays(30)}>30 ngày</Button>
            <Select style={{ width: 160 }} placeholder="Lọc trạng thái" allowClear onChange={setStatusFilter} value={statusFilter}>
              <Select.Option value="Mới">Mới</Select.Option>
              <Select.Option value="Đang Xử lý">Đang Xử lý</Select.Option>
              <Select.Option value="Chờ Phản hồi">Chờ Phản hồi</Select.Option>
              <Select.Option value="Khẩn cấp">Khẩn cấp</Select.Option>
              <Select.Option value="Đã Đóng">Đã Đóng</Select.Option>
            </Select>
            <Button icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>
            <Button onClick={() => setTicketsData(JSON.parse(localStorage.getItem('tickets')||'[]'))}>Refresh</Button>
          </Space>
        </div>

        <div style={{ marginTop: 12 }}>
          {loadingReports ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text>Loading...</Text></div>
          ) : (
            <Line {...lineConfig} />
          )}
        </div>
      </Card>

      {/* Blog reports */}
      <Card style={{ marginBottom: 12 }} bodyStyle={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Báo cáo Blog</Title>
            <Text type="secondary">Thống kê bài viết và tương tác</Text>
          </div>
          <Space>
            <Button onClick={() => { /* no-op refresh - parent updates via Blog tab */ }} size="small">Refresh</Button>
          </Space>
        </div>

        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Tổng bài</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{totalPosts}</div></Card></Col>
          <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Xuất bản</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{publishedCount}</div></Card></Col>
          <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Bản nháp</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{draftCount}</div></Card></Col>
          <Col xs={24} sm={6}><Card className="help-summary-card-mini" bordered={false}><Text type="secondary">Đã ghim</Text><div style={{ fontSize: 20, fontWeight: 700 }}>{pinnedCount}</div></Card></Col>
        </Row>

        <div style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}><Card bordered={false}><Text type="secondary">Lượt xem tổng</Text><div style={{ fontSize: 18, fontWeight: 700 }}>{totalViews}</div></Card></Col>
            <Col xs={24} md={8}><Card bordered={false}><Text type="secondary">Lượt thích tổng</Text><div style={{ fontSize: 18, fontWeight: 700 }}>{totalLikes}</div></Card></Col>
            <Col xs={24} md={8}><Card bordered={false}><Text type="secondary">Bình luận tổng</Text><div style={{ fontSize: 18, fontWeight: 700 }}>{totalComments}</div></Card></Col>
          </Row>

          <div style={{ marginTop: 12 }}>
            <Title level={5} style={{ marginBottom: 8 }}>Bài viết gần đây</Title>
            <Table
              columns={[
                { title: 'Bài viết', dataIndex: 'title', key: 'title', render: (t, r) => (<Space><Avatar src={r.avatar} /><Text strong ellipsis={{ tooltip: t }}>{t}</Text></Space>) },
                { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: s => <Tag color={s === 'published' ? 'green' : 'gold'}>{s === 'published' ? 'Xuất bản' : 'Nháp'}</Tag> },
                { title: 'Views', dataIndex: 'views', key: 'views', width: 90 },
                { title: 'Likes', dataIndex: 'likes', key: 'likes', width: 90 },
                { title: 'Comments', dataIndex: 'commentsCount', key: 'commentsCount', width: 110 },
              ]}
              dataSource={recentPosts.map(p => ({ ...p, commentsCount: p.commentsData?.length || p.comments || 0 }))}
              pagination={{ pageSize: 5 }}
              rowKey="id"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Tab 4: Automation
const AutomationTab = () => {
  const [rules, setRules] = useState(mockAutomationRules);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateRule = () => {
    form.validateFields().then(values => {
      const newRule = {
        key: rules.length + 1,
        name: values.ruleName,
        condition: values.condition,
        action: values.action,
        enabled: true
      };
      setRules([...rules, newRule]);
      message.success('Đã tạo quy tắc!');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <>
      <Alert
        message="Quy tắc tự động hóa"
        description="Tự động gán ticket, đặt ưu tiên dựa trên điều kiện"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={GRADIENT_BUTTON_STYLE}>
          Tạo quy tắc mới
        </Button>
      </div>

      <Table
        dataSource={rules}
        pagination={false}
        columns={[
          { title: 'Tên quy tắc', dataIndex: 'name', key: 'name' },
          { title: 'Điều kiện', dataIndex: 'condition', key: 'condition', render: text => <Tag color="blue">{text}</Tag> },
          { title: 'Hành động', dataIndex: 'action', key: 'action', render: text => <Tag color="green">{text}</Tag> },
          {
            title: 'Trạng thái',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled) => <Switch checked={enabled} />
          },
          {
            title: 'Hành động',
            render: () => (
              <Space>
                <Button size="small" icon={<EditOutlined />}>Sửa</Button>
                <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title="Tạo quy tắc tự động"
        open={isModalVisible}
        onOk={handleCreateRule}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="Tên quy tắc" rules={[{ required: true }]}>
            <Input placeholder="VD: Tự động gán ticket từ Email" />
          </Form.Item>
          <Form.Item name="condition" label="Điều kiện" rules={[{ required: true }]}>
            <Select placeholder="Chọn điều kiện">
              <Select.Option value="Tiêu đề chứa từ khóa">Tiêu đề chứa từ khóa</Select.Option>
              <Select.Option value="Nguồn là Email">Nguồn là Email</Select.Option>
              <Select.Option value="Độ ưu tiên là CAO">Độ ưu tiên là CAO</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="action" label="Hành động" rules={[{ required: true }]}>
            <Select placeholder="Chọn hành động">
              <Select.Option value="Gán cho Trần B">Gán cho Trần B</Select.Option>
              <Select.Option value="Đặt Ưu tiên CAO">Đặt Ưu tiên CAO</Select.Option>
              <Select.Option value="Gửi phản hồi tự động">Gửi phản hồi tự động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// Main Component
const SupportPage = () => {
  const [allTickets, setAllTickets] = useState([]);
  const [blogCount, setBlogCount] = useState(0);
  const [blogPosts, setBlogPosts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const width = useWindowWidth();
  const isMobile = width < 768;

  const items = [
    {
      key: '1',
      label: (
        <Space>
          <SolutionOutlined style={{ backgroundColor: '#1890ff', color: 'white', padding: '5px', borderRadius: '8px' }} />
          Quản lý Tickets
        </Space>
      ),
      children: <TicketManagementTab onTicketsLoaded={setAllTickets} refreshKey={refreshKey} />
    },
    {
      key: '2',
      label: (
        <Space>
          <BookOutlined style={{ backgroundColor: '#52c41a', color: 'white', padding: '5px', borderRadius: '8px' }} />
          Quản lý Blog
        </Space>
      ),
      children: <BlogManagementTab onPostsLoaded={(posts) => { setBlogPosts(posts || []); setBlogCount(posts?.length || 0); }} refreshKey={refreshKey} />
    },
    {
      key: '3',
      label: (
        <Space>
          <LineChartOutlined style={{ backgroundColor: '#faad14', color: 'white', padding: '5px', borderRadius: '8px' }} />
          Báo cáo
        </Space>
      ),
      children: <ReportsTab blogPosts={blogPosts} />
    },
    {
      key: '4',
      label: (
        <Space>
          <SettingOutlined style={{ backgroundColor: '#722ed1', color: 'white', padding: '5px', borderRadius: '8px' }} />
          Tự động hóa
        </Space>
      ),
      children: <AutomationTab />
    }
  ];

  return (
    <Layout style={{ padding: '0 24px 24px', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ padding: 0, background: 'transparent', borderRadius: isMobile ? 12 : 24, minHeight: 'auto', marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ borderRadius: isMobile ? 12 : 24, background: 'linear-gradient(90deg, #5b21b6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 6px 18px rgba(15,23,42,0.04)', marginBottom: isMobile ? 8 : 12, border: 'none', padding: isMobile ? 12 : 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Title level={isMobile ? 4 : 2} style={{ color: '#fff', margin: 0, fontWeight: 650 }}>
                  {isMobile ? 'Quản lý Hỗ trợ & Blog' : '🔥 Quản lý Hỗ trợ & Blog'}
                </Title>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Tag color="geekblue" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 6 }}>Tickets: {allTickets?.length || 0}</Tag>
                <Tag color="green" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 6 }}>Bài viết: {blogCount}</Tag>
              </div>
            </div>

            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <Space wrap>
                <Button onClick={() => setRefreshKey(k => k + 1)} size={isMobile ? 'middle' : 'default'} type="primary" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', borderRadius: 6 }}>
                  Refresh
                </Button>
                <Button type="primary" icon={!isMobile && <PlusOutlined />} size={isMobile ? 'middle' : 'default'} style={{ background: 'linear-gradient(90deg, #5b21b6 0%, #2563eb 100%)', border: 'none', color: '#fff', borderRadius: 6 }} onClick={() => setActiveTab('2')}>
                  Add
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </div>

      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          background: '#fff',
          borderRadius: 8,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k)}
          defaultActiveKey="1"
          items={items}
          size={isMobile ? 'small' : 'large'}
        />
      </Content>
    </Layout>
  );
};

export default SupportPage;