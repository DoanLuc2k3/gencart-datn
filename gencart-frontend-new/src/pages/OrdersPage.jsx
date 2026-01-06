import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import { 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Card, 
  Empty, 
  Spin, 
  Tabs, 
  message, 
  Modal, 
  Row, 
  Col, 
  Tooltip,
  Pagination
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  EyeOutlined,
  StarOutlined,
  CalendarOutlined,
  DollarOutlined,
  BoxPlotOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { getValidImageUrl, handleImageError } from '../utils/imageUtils';
import { formatCurrency } from '../utils/format';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;

const OrdersPage = () => {
  useScrollToTop();

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reviewableProducts, setReviewableProducts] = useState(new Map());
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const pageStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #e0e7ff 100%)',
    minHeight: '100vh'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(99,102,241,0.95) 100%)',
    padding: '56px 24px 110px',
    position: 'relative',
    overflow: 'hidden'
  };

  const headerOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'   };

  const headerContentStyle = {
    maxWidth: '1080px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    textAlign: 'center'
  };

  const mainWrapperStyle = {
    maxWidth: '1100px',
    margin: '-72px auto 0',
    padding: '0 20px 64px'
  };

  const mainCardStyle = {
    borderRadius: 28,
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 38px 80px -48px rgba(15, 23, 42, 0.45)'
  };

  const orderCardStyle = {
    borderRadius: 22,
    border: '1px solid rgba(148,163,184,0.18)',
    boxShadow: '0 20px 40px -32px rgba(15, 23, 42, 0.4)',
    background: 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.96) 100%)',
    backdropFilter: 'blur(12px)'
  };

  const summaryPillStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    borderRadius: 18,
    background: 'rgba(226, 232, 240, 0.58)',
    border: '1px solid rgba(148, 163, 184, 0.18)'
  };

  // Fetch orders data
  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        // If not logged in, redirect to login
        message.info('Vui lòng đăng nhập để xem đơn hàng của bạn');
        navigate('/login');
        return;
      }

      // Fetch orders with pagination
      const response = await fetch(`${API_BASE_URL}/orders/?page=${page}&page_size=${pageSize}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải đơn hàng');
      }

      const data = await response.json();
      
      // Update pagination state
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.count || 0,
      });

      // Format orders data
      const formattedOrders = data.results.map(order => {
        // Format shipping address
        const shippingAddress = order.shipping_address ?
          `${order.shipping_address.street_address}${order.shipping_address.apartment_address ? ', ' + order.shipping_address.apartment_address : ''},
           ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.zip_code}` :
          'No address provided';

        // Check if items exist (list endpoint may not include items)
        const orderItems = order.items || [];

        return {
          id: order.id,
          date: order.created_at, // Keep full datetime
          total: parseFloat(order.total_amount),
          status: order.status,
          items: orderItems.map(item => {
            return {
              id: item.id,
              name: item.product ? item.product.name : 'Product',
              quantity: item.quantity,
              price: parseFloat(item.price),
              image: item.product ? (item.product.image_url || item.product.primary_image) : null,
              product_id: item.product ? item.product.id : null,
              discount_price: item.product && item.product.discount_price ? parseFloat(item.product.discount_price) : null,
            };
          }),
          shipping: {
            address: shippingAddress,
            method: 'Standard Delivery'
          },
          payment: {
            method: order.payment_status ? 'Paid' : 'Pending',
            status: order.payment_status
          }
        };
      });

      setOrders(formattedOrders);

      // Check reviewable products for delivered orders
      checkReviewableProducts(formattedOrders.filter(order => order.status === 'delivered'));
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Check which products can be reviewed
  const checkReviewableProducts = async (deliveredOrders) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const reviewableMap = new Map();

      for (const order of deliveredOrders) {
        const productReviewPromises = order.items.map(async (item) => {
          if (!item.product_id) return null;
          
          try {
            const response = await fetch(`${API_BASE_URL}/products/${item.product_id}/can_review/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              return {
                product_id: item.product_id,
                can_review: data.can_review,
                has_reviewed: data.has_reviewed
              };
            }
          } catch (error) {
            console.error(`Error checking review status for product ${item.product_id}:`, error);
          }
          return null;
        });

        const results = await Promise.all(productReviewPromises);
        const orderReviewData = {};
        
        results.forEach(result => {
          if (result) {
            orderReviewData[result.product_id] = {
              can_review: result.can_review,
              has_reviewed: result.has_reviewed
            };
          }
        });

        reviewableMap.set(order.id, orderReviewData);
      }

      setReviewableProducts(reviewableMap);
    } catch (error) {
      console.error('Error checking reviewable products:', error);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;

    setCancelLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Call API to cancel order
      const response = await fetch(`${API_BASE_URL}/orders/${selectedOrderId}/cancel_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể hủy đơn hàng');
      }

      message.success('Hủy đơn hàng thành công');
      setModalVisible(false);

      // Refresh orders list
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Show cancel confirmation modal
  const showCancelConfirm = (orderId) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  // Navigate to product to review
  const handleReviewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };
  
  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, [navigate]);

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
      processing: { color: 'blue', text: 'Processing', icon: <ClockCircleOutlined /> },
      shipped: { color: 'cyan', text: 'Shipped', icon: <TruckOutlined /> },
      delivered: { color: 'green', text: 'Delivered', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Cancelled', icon: <ExclamationCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text === 'Pending' ? 'Chờ xác nhận' :
         config.text === 'Processing' ? 'Đang xử lý' :
         config.text === 'Shipped' ? 'Đã gửi hàng' :
         config.text === 'Delivered' ? 'Đã giao' :
         config.text === 'Cancelled' ? 'Đã hủy' : config.text}
      </Tag>
    );
  };

  // Check if order has reviewable products
  const hasReviewableProducts = (orderId) => {
    const orderReviewData = reviewableProducts.get(orderId);
    if (!orderReviewData) return false;
    
    return Object.values(orderReviewData).some(data => data.can_review);
  };

  // Render simple order card
  const renderOrderCard = (order) => {
    const orderDate = new Date(order.date);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    deliveryDate.setHours(9, 0, 0, 0); // Set to 9:00 AM

    const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedOrderTime = orderDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + deliveryDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const orderReviewData = reviewableProducts.get(order.id) || {};

    return (
      <Card
        key={order.id}
        bordered={false}
        style={{ ...orderCardStyle, marginBottom: '24px' }}
        bodyStyle={{ padding: '26px 28px 22px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={
            {
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center'
            }
          }>
            <Space size={12} wrap>
              <Text style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>
                Đơn hàng #{order.id}
              </Text>
              <Tag
                color="geekblue"
                style={{ margin: 0, borderRadius: 12, padding: '2px 12px' }}
              >
                {order.items.length} sản phẩm
              </Tag>
            </Space>

            <Space size={16} wrap>
              <Space size={8}>
                <CalendarOutlined style={{ color: '#6366f1' }} />
                <Text type="secondary">{formattedOrderDate}</Text>
              </Space>
              <Space size={8}>
                <ClockCircleOutlined style={{ color: '#6366f1' }} />
                <Text type="secondary">Đặt lúc {formattedOrderTime}</Text>
              </Space>
            </Space>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: '22px', fontWeight: 700, color: '#312e81' }}>
              {formatCurrency(order.total)}
            </Text>
            <div style={{ marginTop: 8 }}>{getStatusTag(order.status)}</div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '18px',
            margin: '26px 0 24px'
          }}
        >
          <div style={summaryPillStyle}>
            <BoxPlotOutlined style={{ fontSize: '20px', color: '#6366f1' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Sản phẩm</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.items.length}</div>
            </div>
          </div>
          <div style={summaryPillStyle}>
            <TruckOutlined style={{ fontSize: '20px', color: '#10b981' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Dự kiến giao</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{formattedDeliveryDate}</div>
            </div>
          </div>
          <div style={summaryPillStyle}>
            <DollarOutlined style={{ fontSize: '20px', color: '#f97316' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Trạng thái thanh toán</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.payment.status ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Sản phẩm trong đơn hàng
          </Text>
          <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
            {order.items.map(item => {
              const productReviewData = orderReviewData[item.product_id] || {};
              const canReviewProduct = productReviewData.can_review;
              const hasReviewedProduct = productReviewData.has_reviewed;

              return (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                  <Card
                    hoverable
                    size="small"
                    style={{
                      height: '100%',
                      borderRadius: 16,
                      border: '1px solid rgba(148,163,184,0.2)',
                      boxShadow: '0 16px 32px -28px rgba(30, 41, 59, 0.45)'
                    }}
                    bodyStyle={{ padding: '12px' }}
                    cover={
                      <div
                        style={{
                          height: '110px',
                          overflow: 'hidden',
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                          background: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)'
                        }}
                      >
                        <img
                          src={getValidImageUrl(item.image, item.name, 110, 110)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => handleImageError(e, item.name, 110, 110)}
                        />
                      </div>
                    }
                  >
                    <Tooltip title={item.name}>
                      <Text style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                        {item.name.length > 30 ? `${item.name.substring(0, 30)}…` : item.name}
                      </Text>
                    </Tooltip>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: '12px', color: '#475569' }}>Số lượng: {item.quantity}</Text>
                      <Text style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{formatCurrency(item.price)}</Text>
                    </div>

                    {order.status === 'delivered' && item.product_id && (
                      <div style={{ textAlign: 'center' }}>
                        {hasReviewedProduct ? (
                          <Tag color="green" style={{ fontSize: '11px', borderRadius: 10 }}>
                            <CheckCircleOutlined /> Đã đánh giá
                          </Tag>
                        ) : canReviewProduct ? (
                          <Button
                            type="link"
                            size="small"
                            icon={<StarOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewProduct(item.product_id);
                            }}
                            style={{ fontSize: '11px', padding: 0 }}
                          >
                            Đánh giá ngay
                          </Button>
                        ) : (
                          <Tag style={{ fontSize: '11px', borderRadius: 10 }}>Không đủ điều kiện</Tag>
                        )}
                      </div>
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(148,163,184,0.2)',
            paddingTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <Space wrap>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              Xem chi tiết
            </Button>

            {(order.status === 'pending' || order.status === 'processing') && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showCancelConfirm(order.id)}
              >
                Hủy đơn hàng
              </Button>
            )}

            {order.status === 'delivered' && hasReviewableProducts(order.id) && (
              <Button icon={<StarOutlined />} onClick={() => navigate(`/orders/${order.id}`)}>
                Đánh giá sản phẩm
              </Button>
            )}
          </Space>

          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cần hỗ trợ? Liên hệ support@gencart.com
          </Text>
        </div>
      </Card>
    );
  };

  // Filter orders by status
  const getFilteredOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const totalOrders = orders.length;
  const pendingCount = getFilteredOrders('pending').length;
  const processingCount = getFilteredOrders('processing').length;
  const shippedCount = getFilteredOrders('shipped').length;
  const deliveredCount = getFilteredOrders('delivered').length;
  const cancelledCount = getFilteredOrders('cancelled').length;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headerOverlayStyle} />
        <div style={headerContentStyle}>
          <Title
            level={2}
            style={{
              marginBottom: 12,
              color: '#fff',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
              textShadow: '0 20px 45px rgba(15, 23, 42, 0.35)'
            }}
          >
            <ShoppingOutlined style={{ marginRight: 12 }} /> Đơn hàng của tôi
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
            Theo dõi đơn hàng, quản lý đổi trả và đánh giá sản phẩm bạn yêu thích.
          </Paragraph>

        </div>
      </div>

      <div style={mainWrapperStyle}>
        {loading ? (
          <Card
            bordered={false}
            style={mainCardStyle}
            bodyStyle={{ padding: '60px 40px', textAlign: 'center' }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 18 }}>
              <Text type="secondary">Đang tải đơn hàng của bạn…</Text>
            </div>
          </Card>
        ) : totalOrders > 0 ? (
          <Card
            bordered={false}
            style={mainCardStyle}
            bodyStyle={{ padding: '32px 28px' }}
          >
            <Tabs
              defaultActiveKey="all"
              tabBarStyle={{ marginBottom: 28 }}
              items={[
                {
                  key: 'all',
                  label: `Tất cả (${totalOrders})`,
                  children: <div>{getFilteredOrders('all').map(order => renderOrderCard(order))}</div>
                },
                {
                  key: 'pending',
                  label: `Chờ xác nhận (${pendingCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('pending').map(order => renderOrderCard(order))}
                      {pendingCount === 0 && <Empty description="Không có đơn chờ xác nhận" />}
                    </div>
                  )
                },
                {
                  key: 'processing',
                  label: `Đang xử lý (${processingCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('processing').map(order => renderOrderCard(order))}
                      {processingCount === 0 && <Empty description="Không có đơn đang xử lý" />}
                    </div>
                  )
                },
                {
                  key: 'shipped',
                  label: `Đã gửi hàng (${shippedCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('shipped').map(order => renderOrderCard(order))}
                      {shippedCount === 0 && <Empty description="Không có đơn đã gửi hàng" />}
                    </div>
                  )
                },
                {
                  key: 'delivered',
                  label: `Đã giao (${deliveredCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('delivered').map(order => renderOrderCard(order))}
                      {deliveredCount === 0 && <Empty description="Không có đơn đã giao" />}
                    </div>
                  )
                },
                {
                  key: 'cancelled',
                  label: `Đã hủy (${cancelledCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('cancelled').map(order => renderOrderCard(order))}
                      {cancelledCount === 0 && <Empty description="Không có đơn đã hủy" />}
                    </div>
                  )
                }
              ]}
            />
            
            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, paddingBottom: 16 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} đơn hàng`}
                  pageSizeOptions={['5', '10', '20', '50']}
                />
              </div>
            )}
          </Card>
        ) : (
          <Card
            bordered={false}
            style={mainCardStyle}
            bodyStyle={{ padding: '60px 40px', textAlign: 'center' }}
          >
            <Empty description="Bạn chưa đặt đơn hàng nào">
              <Button type="primary" size="large" onClick={() => navigate('/products')}>
                Mua sắm ngay
              </Button>
            </Empty>
          </Card>
        )}
      </div>

      <Modal
        title="Hủy đơn hàng"
        open={modalVisible}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => setModalVisible(false)}
        okText="Đồng ý hủy đơn"
        cancelText="Giữ lại đơn"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default OrdersPage;
