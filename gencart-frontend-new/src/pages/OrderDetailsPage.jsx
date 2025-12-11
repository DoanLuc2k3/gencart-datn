import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Button,
  Space,
  Descriptions,
  List,
  Avatar,
  Tag,
  Divider,
  Row,
  Col,
  Spin,
  Empty,
  message,
  Modal,
  Form,
  Steps,
  Rate,
  Input
} from 'antd';
import { getValidImageUrl, handleImageError } from '../utils/imageUtils';
import useScrollToTop from '../hooks/useScrollToTop';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InboxOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;


const OrderDetailsPage = () => {
  useScrollToTop();

  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  const pageStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0e7ff 100%)',
    minHeight: '100vh'
  };

  const contentWrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px 72px'
  };

  const headerCardStyle = {
    borderRadius: 26,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(59,130,246,0.95) 100%)',
    color: '#fff',
    padding: '32px 28px',
    border: '1px solid rgba(148,163,184,0.18)',
    boxShadow: '0 40px 80px -48px rgba(30,41,59,0.45)',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden'
  };

  const headerOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  };

  const headerContentStyle = {
    position: 'relative',
    zIndex: 1
  };

  const detailCardStyle = {
    borderRadius: 20,
    border: '1px solid rgba(148,163,184,0.16)',
    background: 'rgba(255,255,255,0.98)',
    boxShadow: '0 24px 60px -40px rgba(30,41,59,0.4)'
  };

  const sectionCardStyle = {
    borderRadius: 18,
    border: '1px solid rgba(148,163,184,0.18)',
    background: 'rgba(248,250,252,0.96)'
  };

  const headerMetaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    whiteSpace: 'nowrap'
  };

  // Format number to VND currency
  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    } catch (e) {
      return `₫${Number(value).toFixed(2)}`;
    }
  };

  // Map order status to steps index
  const statusToStepIndex = (status) => {
    const map = {
      processing: 0,
      shipped: 1,
      delivered: 2,
      cancelled: 1
    };

    return map[status] ?? 0;
  };

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          message.error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
          navigate('/login');
          return;
        }

        // Fetch order details from API
        const response = await fetch(`http://localhost:8000/api/orders/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();

        // Log raw data for debugging
        console.log('Raw order data:', data);
        if (data.items && data.items.length > 0 && data.items[0].product) {
          console.log('First product image URL:', data.items[0].product.primary_image);
        }

        // Calculate expected delivery date (5 days from order date)
        const orderDate = new Date(data.created_at);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 5);

        // Format delivery date with time
        const formattedDeliveryDate = `${deliveryDate.toLocaleDateString('en-IN')} by ${deliveryDate.getHours()}:${String(deliveryDate.getMinutes()).padStart(2, '0')}`;

        // Format order data
        const formattedOrder = {
          id: data.id,
          date: new Date(data.created_at).toISOString().split('T')[0],
          deliveryDate: formattedDeliveryDate,
          total: parseFloat(data.total_amount),
          status: data.status,
          items: data.items.map(item => {
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
            name: data.user ? `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || data.user.username || 'N/A' : 'N/A',
            address: data.shipping_address ?
              `${data.shipping_address.street_address}${data.shipping_address.apartment_address ? ', ' + data.shipping_address.apartment_address : ''},
               ${data.shipping_address.city}, ${data.shipping_address.state}, ${data.shipping_address.zip_code}` :
              'No address provided',
            phone: data.user ? data.user.phone_number || 'N/A' : 'N/A',
            email: data.user ? data.user.email || 'N/A' : 'N/A',
            method: 'Standard Delivery'
          },
          payment: {
            method: data.payment_status ? 'Paid' : 'Pending',
            status: data.payment_status
          }
        };

        setOrder(formattedOrder);

        // If order is delivered, check which products have been reviewed
        if (formattedOrder.status === 'delivered') {
          checkReviewedProducts(formattedOrder.items);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('Tải chi tiết đơn hàng thất bại. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  // Check which products in the order have been reviewed
  const checkReviewedProducts = async (items) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const reviewCheckPromises = items.map(async (item) => {
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
            return { product_id: item.product_id, has_reviewed: data.has_reviewed };
          }
        } catch (error) {
          console.error(`Error checking review status for product ${item.product_id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(reviewCheckPromises);
      const reviewedSet = new Set();
      
      results.forEach(result => {
        if (result && result.has_reviewed) {
          reviewedSet.add(result.product_id);
        }
      });

      setReviewedProducts(reviewedSet);
    } catch (error) {
      console.error('Error checking reviewed products:', error);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
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
      const response = await fetch(`http://localhost:8000/api/orders/${id}/cancel_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Hủy đơn thất bại');
      }

      message.success('Hủy đơn thành công');
      setModalVisible(false);

      // Refresh order details
      const updatedResponse = await fetch(`http://localhost:8000/api/orders/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setOrder({
          ...order,
          status: updatedData.status
        });
      }
      } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.message || 'Hủy đơn thất bại. Vui lòng thử lại.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle review product
  const handleReviewProduct = (item) => {
    setSelectedProduct(item);
    setReviewModalVisible(true);
  };

  // Submit review
  const handleReviewSubmit = async (values) => {
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Please login to add a review');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${selectedProduct.product_id}/add_review/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: values.rating,
          title: values.title,
          comment: values.comment,
        }),
      });

      if (response.ok) {
        setReviewModalVisible(false);
        reviewForm.resetFields();
        message.success('Đã thêm đánh giá!');
        
        // Update reviewed products set
        setReviewedProducts(prev => new Set([...prev, selectedProduct.product_id]));
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Thêm đánh giá thất bại');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      message.error('Thêm đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    const config = {
      processing: { color: 'gold', text: 'Đang xử lý', icon: <ClockCircleOutlined /> },
      shipped: { color: 'cyan', text: 'Đã gửi', icon: <CarOutlined /> },
      delivered: { color: 'green', text: 'Đã giao', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Đã hủy', icon: <ExclamationCircleOutlined /> }
    };

    const { color, text, icon } = config[status] || { color: 'default', text: status, icon: null };

    return (
      <Tag
        color={color}
        icon={icon}
        style={{ borderRadius: 12, padding: '2px 12px', fontWeight: 500 }}
      >
        {text}
      </Tag>
    );
  };

  // Show cancel confirmation modal
  const showCancelConfirm = () => {
    setModalVisible(true);
  };

  // Go back to orders page
  const handleGoBack = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Card style={detailCardStyle} bodyStyle={{ padding: '40px' }}>
          <Empty description="Không tìm thấy đơn hàng" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={handleGoBack}>
              Quay lại danh sách đơn
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={contentWrapperStyle}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{ marginBottom: 16, padding: 0, color: '#6366f1', fontWeight: 500 }}
        >
          Quay lại danh sách đơn
        </Button>

        <div style={headerCardStyle}>
          <div style={headerOverlayStyle} />
          <div style={headerContentStyle}>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <Space size={12} wrap>
                <ShoppingOutlined style={{ fontSize: 26 }} />
                <Title level={3} style={{ margin: 0, color: '#fff' }}>
                  Đơn hàng #{order.id}
                </Title>
              </Space>
              <Space size={24} wrap>
                <div style={headerMetaStyle}>
                  <ClockCircleOutlined />
                  <span>Đặt vào {new Date(order.date).toLocaleDateString('en-IN')}</span>
                </div>
                <div style={headerMetaStyle}>
                  <CarOutlined />
                  <span>Dự kiến giao hàng: {order.deliveryDate}</span>
                </div>
              </Space>
            <div style={{ marginTop: 8 }}>
              <Steps
                current={statusToStepIndex(order.status)}
                size="small"
                items={[
                  { title: 'Đang xử lý' },
                  { title: 'Đã gửi' },
                  { title: 'Đã giao' }
                ]}
                style={{ maxWidth: 520 }}
              />
            </div>
            </Space>

            <div style={{ position: 'absolute', top: 0, right: 28, textAlign: 'right' }}>
              <div style={{ marginBottom: 8 }}>{getStatusTag(order.status)}</div>
              <Text style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                Tổng: {formatCurrency(order.total)}
              </Text>
            </div>

            {(order.status === 'pending' || order.status === 'processing') && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={showCancelConfirm}
                style={{ marginTop: 20 }}
              >
                Hủy đơn
              </Button>
            )}
          </div>
        </div>

        <Card
          bordered={false}
          style={detailCardStyle}
          bodyStyle={{ padding: '28px 26px' }}
        >
          <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} md={14}>
              <Card
                title="Thông tin giao hàng"
                bordered={false}
                style={{ ...sectionCardStyle, height: '100%' }}
                headStyle={{ background: 'transparent', borderBottom: '1px solid rgba(148,163,184,0.18)', fontWeight: 600 }}
                bodyStyle={{ padding: '18px 20px' }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={<><UserOutlined /> Tên</>}>
                    {order.shipping.name}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>}>
                    {order.shipping.address}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                    {order.shipping.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {order.shipping.email}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={10}>
              <Card
                title="Thông tin thanh toán"
                bordered={false}
                style={{ ...sectionCardStyle, height: '100%' }}
                headStyle={{ background: 'transparent', borderBottom: '1px solid rgba(148,163,184,0.18)', fontWeight: 600 }}
                bodyStyle={{ padding: '18px 20px' }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Phương thức">
                    {order.payment.method}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {order.payment.status ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Divider style={{ margin: '28px 0' }} />

          <Title level={4} style={{ marginBottom: 18 }}>Sản phẩm đã đặt ({order.items.length})</Title>
          <Row gutter={[18, 18]}>
            {order.items.map(item => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: 18,
                    border: '1px solid rgba(148,163,184,0.18)',
                    boxShadow: '0 20px 38px -34px rgba(30,41,59,0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                  cover={
                    <div
                      style={{
                        height: 160,
                        borderTopLeftRadius: 18,
                        borderTopRightRadius: 18,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)'
                      }}
                    >
                      <img
                        src={getValidImageUrl(item.image, item.name, 220, 220)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, item.name, 220, 220)}
                      />
                    </div>
                  }
                  actions={
                            order.status === 'delivered' && item.product_id ? [
                              reviewedProducts.has(item.product_id) ? (
                                <span style={{ color: '#16a34a', fontWeight: 500 }}>
                                  <CheckCircleOutlined /> Đã đánh giá
                                </span>
                              ) : (
                                <Button type="link" icon={<StarOutlined />} onClick={() => handleReviewProduct(item)}>
                                  Đánh giá sản phẩm
                                </Button>
                              )
                            ] : []
                  }
                >
                          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 8, flexGrow: 1 }}>{item.name}</div>
                          <Space direction="vertical" size={4}>
                    <Text type="secondary">Số lượng: {item.quantity}</Text>
                          <Text strong style={{ fontSize: '15px' }}>{formatCurrency(item.price * item.quantity)}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        title="Hủy đơn"
        open={modalVisible}
        onOk={handleCancelOrder}
        confirmLoading={cancelLoading}
        onCancel={() => setModalVisible(false)}
        okText="Có, hủy đơn"
        cancelText="Không, giữ đơn"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn hủy đơn hàng này?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={`Đánh giá ${selectedProduct?.name}`}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReviewSubmit}
        >
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: 'Vui lòng cho điểm!' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề đánh giá"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề đánh giá!' },
              { max: 200, message: 'Tiêu đề không quá 200 ký tự!' }
            ]}
          >
            <Input placeholder="Tóm tắt trải nghiệm của bạn" />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Nội dung đánh giá"
            rules={[{ required: true, message: 'Vui lòng viết đánh giá!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Hãy kể về trải nghiệm của bạn với sản phẩm này"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submittingReview}>
                Gửi đánh giá
              </Button>
              <Button onClick={() => setReviewModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetailsPage;
