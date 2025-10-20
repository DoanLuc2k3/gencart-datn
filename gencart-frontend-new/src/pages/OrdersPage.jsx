import React, { useState, useEffect } from 'react';
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
  Tooltip
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
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        // If not logged in, redirect to login
        message.info('Please login to view your orders');
        navigate('/login');
        return;
      }

      // Fetch orders from API
      const response = await fetch('http://localhost:8000/api/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Format orders data
      const formattedOrders = data.results.map(order => {
        // Format shipping address
        const shippingAddress = order.shipping_address ?
          `${order.shipping_address.street_address}${order.shipping_address.apartment_address ? ', ' + order.shipping_address.apartment_address : ''},
           ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.zip_code}` :
          'No address provided';

        // Log order items for debugging
        console.log('Order items:', order.items);
        if (order.items.length > 0 && order.items[0].product) {
          console.log('First product image URL:', order.items[0].product.primary_image);
        }

        return {
          id: order.id,
          date: new Date(order.created_at).toISOString().split('T')[0],
          total: parseFloat(order.total_amount),
          status: order.status,
          items: order.items.map(item => {
            // Log each product's image URL
            if (item.product) {
              console.log(`Product ${item.product.name} image:`, item.product.primary_image);
            }

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
      message.error('Failed to load orders. Please try again.');
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
            const response = await fetch(`http://localhost:8000/api/products/${item.product_id}/can_review/`, {
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
        message.error('Authentication error. Please login again.');
        navigate('/login');
        return;
      }

      // Call API to cancel order
      const response = await fetch(`http://localhost:8000/api/orders/${selectedOrderId}/cancel_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel order');
      }

      message.success('Order cancelled successfully');
      setModalVisible(false);

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.message || 'Failed to cancel order. Please try again.');
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

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      processing: { color: 'blue', text: 'Processing', icon: <ClockCircleOutlined /> },
      shipped: { color: 'cyan', text: 'Shipped', icon: <TruckOutlined /> },
      delivered: { color: 'green', text: 'Delivered', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Cancelled', icon: <ExclamationCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
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
                Order #{order.id}
              </Text>
              <Tag
                color="geekblue"
                style={{ margin: 0, borderRadius: 12, padding: '2px 12px' }}
              >
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Tag>
            </Space>

            <Space size={16} wrap>
              <Space size={8}>
                <CalendarOutlined style={{ color: '#6366f1' }} />
                <Text type="secondary">{formattedOrderDate}</Text>
              </Space>
              <Space size={8}>
                <ClockCircleOutlined style={{ color: '#6366f1' }} />
                <Text type="secondary">Placed {formattedOrderTime}</Text>
              </Space>
            </Space>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: '22px', fontWeight: 700, color: '#312e81' }}>
              ₫{order.total.toFixed(2)}
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
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Items</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.items.length}</div>
            </div>
          </div>
          <div style={summaryPillStyle}>
            <TruckOutlined style={{ fontSize: '20px', color: '#10b981' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Expected Delivery</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{formattedDeliveryDate}</div>
            </div>
          </div>
          <div style={summaryPillStyle}>
            <DollarOutlined style={{ fontSize: '20px', color: '#f97316' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', letterSpacing: 0.2 }}>Payment Status</Text>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>{order.payment.status ? 'Paid' : 'Pending'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
            Products in this order
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
                      <Text style={{ fontSize: '12px', color: '#475569' }}>Qty: {item.quantity}</Text>
                      <Text style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>₫{item.price}</Text>
                    </div>

                    {order.status === 'delivered' && item.product_id && (
                      <div style={{ textAlign: 'center' }}>
                        {hasReviewedProduct ? (
                          <Tag color="green" style={{ fontSize: '11px', borderRadius: 10 }}>
                            <CheckCircleOutlined /> Reviewed
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
                            Review now
                          </Button>
                        ) : (
                          <Tag style={{ fontSize: '11px', borderRadius: 10 }}>Not eligible</Tag>
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
              View Details
            </Button>

            {(order.status === 'pending' || order.status === 'processing') && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showCancelConfirm(order.id)}
              >
                Cancel Order
              </Button>
            )}

            {order.status === 'delivered' && hasReviewableProducts(order.id) && (
              <Button icon={<StarOutlined />} onClick={() => navigate(`/orders/${order.id}`)}>
                Review Products
              </Button>
            )}
          </Space>

          <Text type="secondary" style={{ fontSize: '12px' }}>
            Need help? Contact support@gencart.com
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
            <ShoppingOutlined style={{ marginRight: 12 }} /> My Orders
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
            Track packages, manage returns, and review products you love.
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
              <Text type="secondary">Loading your orders…</Text>
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
                  label: `All Orders (${totalOrders})`,
                  children: <div>{getFilteredOrders('all').map(order => renderOrderCard(order))}</div>
                },
                {
                  key: 'processing',
                  label: `Processing (${processingCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('processing').map(order => renderOrderCard(order))}
                      {processingCount === 0 && <Empty description="No processing orders" />}
                    </div>
                  )
                },
                {
                  key: 'shipped',
                  label: `Shipped (${shippedCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('shipped').map(order => renderOrderCard(order))}
                      {shippedCount === 0 && <Empty description="No shipped orders" />}
                    </div>
                  )
                },
                {
                  key: 'delivered',
                  label: `Delivered (${deliveredCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('delivered').map(order => renderOrderCard(order))}
                      {deliveredCount === 0 && <Empty description="No delivered orders" />}
                    </div>
                  )
                },
                {
                  key: 'cancelled',
                  label: `Cancelled (${cancelledCount})`,
                  children: (
                    <div>
                      {getFilteredOrders('cancelled').map(order => renderOrderCard(order))}
                      {cancelledCount === 0 && <Empty description="No cancelled orders" />}
                    </div>
                  )
                }
              ]}
            />
          </Card>
        ) : (
          <Card
            bordered={false}
            style={mainCardStyle}
            bodyStyle={{ padding: '60px 40px', textAlign: 'center' }}
          >
            <Empty description="You haven't placed any orders yet">
              <Button type="primary" size="large" onClick={() => navigate('/products')}>
                Start Shopping
              </Button>
            </Empty>
          </Card>
        )}
      </div>

      <Modal
        title="Cancel Order"
        open={modalVisible}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => setModalVisible(false)}
        okText="Yes, Cancel Order"
        cancelText="Keep Order"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to cancel this order?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default OrdersPage;
