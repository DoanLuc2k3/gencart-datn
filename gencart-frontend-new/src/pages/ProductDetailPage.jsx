import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Tabs,
  Breadcrumb,
  Image,
  Spin,
  message,
  Rate,
  Form,
  Input,
  Modal,
  Avatar,
  Divider,
  Space,
  Empty,
  Tag
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  HomeOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { inventoryEvents } from '../utils/inventoryEvents';
import { getCategoryName, getCategoryGradient } from '../utils/productUtils';
import { formatCurrency } from '../utils/format';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Helper function to get a color based on category name
const getCategoryColor = (categoryName) => {
  const categoryColors = {
    'Electronics': '2196F3',
    'Clothing': '4CAF50',
    'Home & Kitchen': 'FF9800',
    'Books': '9C27B0',
    'Sports & Outdoors': 'F44336',
    'Phone & Accessories': '009688',
  };

  // Return the color for the category or a default color
  return categoryColors[categoryName] || '607D8B';
};

const ProductDetailPage = () => {
  // Scroll to top when page loads
  useScrollToTop();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Add request headers to ensure we get proper URLs
        const headers = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        const response = await fetch(`http://localhost:8000/api/products/${id}/`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        console.log('Product detail data:', data);

        // Log image-related fields
        console.log('Image URL from API:', data.image_url);

        setProduct(data);
        setReviews(data.reviews || []);

        // Fetch related products from the same category
        if (data.category && data.category.id) {
          fetchRelatedProducts(data.category.id, data.id);
        }

        // Check if user can review this product
        checkCanReview();
      } catch (error) {
        console.error('Error fetching product:', error);
        message.error('Không thể tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async (categoryId, productId) => {
      try {
        // Add request headers to ensure we get proper URLs
        const headers = {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };

        const response = await fetch(`http://localhost:8000/api/products/?category=${categoryId}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
        const data = await response.json();
        // Filter out the current product and limit to 4 related products
        let filtered = (data.results || data)
          .filter(p => p.id !== parseInt(productId))
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    const checkCanReview = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch(`http://localhost:8000/api/products/${id}/can_review/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCanReview(data.can_review);
          setHasReviewed(data.has_reviewed);
          setHasPurchased(data.has_purchased);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };

    if (id) {
      fetchProduct();
    }

    // Listen for inventory refresh events
    const unsubscribe = inventoryEvents.subscribe((event) => {
      if (event.type === 'ALL_REFRESH' || 
          (event.type === 'PRODUCT_REFRESH' && event.productId === parseInt(id))) {
        console.log('Refreshing product inventory due to event:', event);
        fetchProduct(); // Refetch product data to get updated inventory
      }
    });

    // Cleanup listener on unmount or when id changes
    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  // Get cart functions from context
  const { addToCart: addToCartContext } = useCart();

  const addToCart = () => {
    if (product) {
      addToCartContext(product, quantity);
      message.success(`${quantity} ${product.name}(s) đã thêm vào giỏ hàng!`);
    }
  };

  const handleAddReview = () => {
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async (values) => {
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('Vui lòng đăng nhập để đánh giá');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${id}/add_review/`, {
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
        const newReview = await response.json();
        setReviews([newReview, ...reviews]);
        setReviewModalVisible(false);
        setCanReview(false);
        setHasReviewed(true);
        reviewForm.resetFields();
        message.success('Đánh giá thành công!');
        
        // Refresh product data to get updated average rating
        const productResponse = await fetch(`http://localhost:8000/api/products/${id}/`);
        if (productResponse.ok) {
          const updatedProduct = await productResponse.json();
          setProduct(updatedProduct);
        }
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Không thể thêm đánh giá');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      message.error('Không thể thêm đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStarRating = (rating, totalReviews) => {
    return (
      <Space>
        <Rate disabled value={rating} />
        <Text strong>{rating}</Text>
        <Text type="secondary">({totalReviews} reviews)</Text>
      </Space>
    );
  };

  const renderReviews = () => {
    if (reviews.length === 0) {
      return (
        <Empty 
          description={
            <Text style={{ fontSize: 16, color: '#94a3b8' }}>
              Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm!
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            padding: '60px 0',
          }}
        >
          {canReview && (
            <Button 
              type="primary" 
              onClick={handleAddReview}
              size="large"
              style={{
                borderRadius: 24,
                height: 44,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              }}
            >
              Be the first to review
            </Button>
          )}
        </Empty>
      );
    }

    return (
      <div>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {reviews.map(review => (
            <Card 
              key={review.id}
              style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Space align="start">
                  <Avatar 
                    icon={<UserOutlined />}
                    size={48}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {review.user_first_name && review.user_last_name 
                          ? `${review.user_first_name} ${review.user_last_name}`
                          : review.user_name}
                      </Text>
                      {review.verified_purchase && (
                        <Tag 
                          color="success" 
                          icon={<CheckCircleOutlined />}
                          style={{
                            borderRadius: 12,
                            padding: '2px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Verified Purchase
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </div>
                </Space>
                
                <div>
                  <Rate disabled value={review.rating} style={{ fontSize: 18, marginBottom: 8 }} />
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                    {review.title}
                  </Text>
                  <Paragraph style={{ 
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#475569',
                    marginBottom: 0,
                  }}>
                    {review.comment}
                  </Paragraph>
                </div>
              </Space>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Không tìm thấy sản phẩm</Title>
        <Button type="primary" onClick={() => navigate('/products')}>
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  const categoryName = getCategoryName(product);
  const categoryGradient = getCategoryGradient(categoryName);
  const discountPercentage = product.discount_price 
    ? Math.round((1 - parseFloat(product.discount_price) / parseFloat(product.price)) * 100)
    : 0;

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      paddingBottom: '60px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '24px' }}>
          <Breadcrumb.Item>
            <Link to="/" style={{ color: '#667eea' }}>
              <HomeOutlined /> Trang chủ
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/products" style={{ color: '#667eea' }}>
              Sản phẩm
            </Link>
          </Breadcrumb.Item>
          {product.category && (
            <Breadcrumb.Item>
              <Link 
                to={`/products?category=${product.category.id}`}
                style={{ color: '#667eea' }}
              >
                {product.category.name}
              </Link>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item>
            <Text strong>{product.name}</Text>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Product Details */}
        <Card
          style={{
            borderRadius: 20,
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={0}>
            {/* Product Images with Gradient */}
            <Col xs={24} lg={10}>
              <div
                style={{
                  background: categoryGradient,
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background pattern */}
                <div
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: 250,
                    height: 250,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    zIndex: 1,
                  }}
                />

                {/* Discount badge */}
                {discountPercentage > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 24,
                      top: 24,
                      background: 'rgba(255, 255, 255, 0.95)',
                      color: '#dc2626',
                      padding: '12px 24px',
                      fontSize: 18,
                      borderRadius: 30,
                      fontWeight: 700,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 10,
                    }}
                  >
                    {discountPercentage}% GIẢM
                  </div>
                )}

                <Image
                  src={
                    product.image_url ||
                    product.primary_image ||
                    "https://placehold.co/500x500/lightgray/darkgray?text=No+Image"
                  }
                  alt={product.name}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: 500,
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 0,
                    padding: 40,
                  }}
                  preview={{
                    mask: <div style={{ color: 'white' }}>Xem kích thước đầy đủ</div>
                  }}
                />
              </div>
            </Col>

            {/* Product Info */}
            <Col xs={24} lg={14}>
              <div style={{ padding: '40px' }}>
                {/* Category and Stock badges */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {/* Category badge */}
                  <div
                    style={{
                      background: categoryGradient,
                      color: '#fff',
                      padding: '8px 20px',
                      fontSize: 14,
                      borderRadius: 25,
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {categoryName}
                  </div>

                  {/* Stock badge */}
                  {product.inventory > 0 ? (
                    <div
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '8px 20px',
                        fontSize: 14,
                        borderRadius: 25,
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {product.inventory} CÒN HÀNG
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        padding: '8px 20px',
                        fontSize: 14,
                        borderRadius: 25,
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      HẾT HÀNG
                    </div>
                  )}
                </div>

                <Title 
                  level={1}
                  style={{
                    marginBottom: 16,
                    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {product.name}
                </Title>

                {/* Rating - same style as GridProductCard */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: '16px 0',
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <StarFilled
                        key={i}
                        style={{
                          color: i < Math.floor(product.average_rating || 0) ? "#fbbf24" : "#e2e8f0",
                          fontSize: 20,
                        }}
                      />
                    ))}
                  </div>
                  <Text strong style={{ fontSize: 16, color: "#374151" }}>
                    {product.average_rating > 0 ? product.average_rating.toFixed(1) : "0.0"}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                    ({product.total_reviews || 0} đánh giá)
                  </Text>
                </div>

                {/* Price */}
                <div style={{ 
                  margin: '24px 0',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderRadius: 16,
                }}>
                  {product.discount_price ? (
                    <>
                      <Text delete style={{ fontSize: 20, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
                        {formatCurrency(product.price)}
                      </Text>
                      <Text strong style={{ fontSize: 36, color: '#dc2626' }}>
                        {formatCurrency(product.discount_price)}
                      </Text>
                      <Text style={{ marginLeft: 16, color: '#10b981', fontSize: 18, fontWeight: 600 }}>
                        Tiết kiệm {formatCurrency(parseFloat(product.price) - parseFloat(product.discount_price))}
                      </Text>
                    </>
                  ) : (
                    <Text strong style={{ fontSize: 36, color: '#1e293b' }}>
                      {formatCurrency(product.price)}
                    </Text>
                  )}
                </div>

                {/* Short Description */}
                <Paragraph style={{ 
                  margin: '24px 0',
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: '#475569',
                }}>
                  {product.description ? product.description.split('\n')[0] : 'No description available.'}
                </Paragraph>

                <Divider />

                {/* Quantity and Add to Cart */}
                <div style={{ margin: '24px 0' }}>
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                    Số lượng
                  </Text>
                  <Space size="large">
                    <InputNumber
                      min={1}
                      max={product.inventory}
                      defaultValue={1}
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={product.inventory <= 0}
                      size="large"
                      style={{ width: 120 }}
                    />
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      size="large"
                      onClick={addToCart}
                      disabled={product.inventory <= 0}
                      style={{
                        height: 48,
                        borderRadius: 24,
                        fontSize: 16,
                        fontWeight: 600,
                        padding: '0 32px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </Space>
                </div>

                {/* Review Action Button */}
                {canReview && (
                  <div style={{ margin: '20px 0' }}>
                    <Button
                      icon={<StarOutlined />}
                      onClick={handleAddReview}
                      size="large"
                      style={{
                        borderRadius: 24,
                        height: 44,
                        fontWeight: 600,
                      }}
                    >
                      Viết đánh giá
                    </Button>
                  </div>
                )}

                {hasReviewed && (
                  <div style={{ 
                    margin: '20px 0',
                    padding: '12px 20px',
                    background: '#f0fdf4',
                    borderRadius: 12,
                    border: '1px solid #86efac',
                  }}>
                    <Text style={{ color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircleOutlined /> Bạn đã đánh giá sản phẩm này
                    </Text>
                  </div>
                )}

                {!hasPurchased && !canReview && !hasReviewed && (
                  <div style={{ 
                    margin: '20px 0',
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}>
                    <Text type="secondary">
                      Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Product Tabs */}
        <Card
          style={{
            marginTop: 32,
            borderRadius: 20,
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Tabs 
            defaultActiveKey="description"
            size="large"
            style={{
              '& .ant-tabs-tab': {
                fontSize: 16,
                fontWeight: 600,
              }
            }}
          >
            <Tabs.TabPane tab="Mô tả" key="description">
              <div style={{ padding: '20px 0' }}>
                <Paragraph style={{ 
                  whiteSpace: 'pre-line',
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: '#475569',
                }}>
                  {product.description || 'Chưa có mô tả.'}
                </Paragraph>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Thông số kỹ thuật" key="specifications">
              <div style={{ padding: '20px 0' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 16 }}>Danh mục:</Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 16, color: '#475569' }}>{categoryName}</Text>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <Text strong style={{ fontSize: 16 }}>Tình trạng:</Text>
                    </Col>
                    <Col span={16}>
                      <Text style={{ fontSize: 16, color: product.inventory > 0 ? '#10b981' : '#ef4444' }}>
                        {product.inventory > 0 ? `${product.inventory} sản phẩm còn hàng` : 'Hết hàng'}
                      </Text>
                    </Col>
                  </Row>
                  {product.average_rating > 0 && (
                    <Row>
                      <Col span={8}>
                        <Text strong style={{ fontSize: 16 }}>Đánh giá:</Text>
                      </Col>
                      <Col span={16}>
                        <Space>
                          <Rate disabled value={product.average_rating} style={{ fontSize: 16 }} />
                          <Text style={{ fontSize: 16, color: '#475569' }}>
                            ({product.total_reviews} đánh giá)
                          </Text>
                        </Space>
                      </Col>
                    </Row>
                  )}
                </Space>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Đánh giá (${reviews.length})`} key="reviews">
              <div style={{ padding: '20px 0' }}>
                {canReview && (
                  <Button
                    type="primary"
                    icon={<StarOutlined />}
                    onClick={handleAddReview}
                    size="large"
                    style={{ 
                      marginBottom: 24,
                      borderRadius: 24,
                      height: 44,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    Viết đánh giá
                  </Button>
                )}
                {renderReviews()}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <Title 
              level={2}
              style={{
                marginBottom: 24,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sản phẩm liên quan
            </Title>
            <Row gutter={[24, 24]}>
              {relatedProducts.map(relatedProduct => {
                const relatedCategoryName = getCategoryName(relatedProduct);
                const relatedGradient = getCategoryGradient(relatedCategoryName);
                const hasRelatedDiscount = relatedProduct.discount_price && 
                  parseFloat(relatedProduct.discount_price) < parseFloat(relatedProduct.price);
                const relatedDiscountPercent = hasRelatedDiscount
                  ? Math.round((1 - parseFloat(relatedProduct.discount_price) / parseFloat(relatedProduct.price)) * 100)
                  : 0;
                
                return (
                  <Col xs={24} sm={12} lg={6} key={relatedProduct.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 20,
                        border: 'none',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-8px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          height: 180,
                          background: relatedGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Background pattern circles */}
                        <div
                          style={{
                            position: 'absolute',
                            top: -15,
                            right: -15,
                            width: 60,
                            height: 60,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            zIndex: 1,
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -20,
                            left: -20,
                            width: 80,
                            height: 80,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                            zIndex: 1,
                          }}
                        />

                        {/* Product Image - Background */}
                        <img
                          alt={relatedProduct.name}
                          src={
                            relatedProduct.image_url ||
                            relatedProduct.primary_image ||
                            'https://placehold.co/300x200/lightgray/darkgray?text=No+Image'
                          }
                          style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            zIndex: 0,
                            padding: 15,
                          }}
                        />

                        {/* Discount badge */}
                        {hasRelatedDiscount && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 12,
                              top: 12,
                              background: 'rgba(255, 255, 255, 0.95)',
                              color: '#dc2626',
                              padding: '4px 10px',
                              fontSize: 11,
                              borderRadius: 16,
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              backdropFilter: 'blur(10px)',
                              zIndex: 10,
                            }}
                          >
                            {relatedDiscountPercent}% OFF
                          </div>
                        )}

                        {/* Stock badge */}
                        {relatedProduct.inventory > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 12,
                              background: 'rgba(34, 197, 94, 0.95)',
                              color: '#fff',
                              padding: '4px 10px',
                              fontSize: 10,
                              borderRadius: 16,
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              backdropFilter: 'blur(10px)',
                              zIndex: 10,
                            }}
                          >
                            {relatedProduct.inventory} IN STOCK
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        padding: 16, 
                        display: 'flex', 
                        flexDirection: 'column',
                        flex: 1,
                      }}>
                        <Text
                          strong
                          style={{
                            fontSize: 15,
                            display: 'block',
                            marginBottom: 10,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#1e293b',
                            fontWeight: 600,
                            minHeight: 21,
                          }}
                        >
                          {relatedProduct.name}
                        </Text>
                        
                        {/* Rating - same style as GridProductCard */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            minHeight: 30,
                          }}
                        >
                          <div style={{ display: "flex", gap: 2 }}>
                            {[...Array(5)].map((_, i) => (
                              <StarFilled
                                key={i}
                                style={{
                                  color: i < Math.floor(relatedProduct.average_rating || 0) ? "#fbbf24" : "#e2e8f0",
                                  fontSize: 13,
                                }}
                              />
                            ))}
                          </div>
                          <Text strong style={{ fontSize: 12, color: "#374151" }}>
                            {relatedProduct.average_rating > 0 ? relatedProduct.average_rating.toFixed(1) : "0.0"}
                          </Text>
                          <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                            ({relatedProduct.total_reviews || 0})
                          </Text>
                        </div>
                        
                        <div style={{ marginBottom: 12, minHeight: 52 }}>
                          {hasRelatedDiscount ? (
                            <>
                              <Text delete style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                                {formatCurrency(relatedProduct.price)}
                              </Text>
                              <Text strong style={{ fontSize: 20, color: '#dc2626' }}>
                                {formatCurrency(relatedProduct.discount_price)}
                              </Text>
                            </>
                          ) : (
                            <Text strong style={{ fontSize: 20, color: '#667eea' }}>
                              {formatCurrency(relatedProduct.price)}
                            </Text>
                          )}
                        </div>
                        
                        <Link to={`/products/${relatedProduct.id}`} style={{ marginTop: 'auto' }}>
                          <Button 
                            type="primary" 
                            block
                            style={{
                              height: 38,
                              borderRadius: 20,
                              fontWeight: 600,
                              fontSize: 14,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              boxShadow: '0 2px 12px rgba(102, 126, 234, 0.3)',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 12px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}

        {/* Review Modal */}
        <Modal
          title={
            <Text strong style={{ fontSize: 20 }}>
              Viết đánh giá
            </Text>
          }
          open={reviewModalVisible}
          onCancel={() => setReviewModalVisible(false)}
          footer={null}
          width={600}
          style={{
            borderRadius: 20,
          }}
        >
          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleReviewSubmit}
          >
            <Form.Item
              name="rating"
              label={<Text strong>Đánh giá</Text>}
              rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
            >
              <Rate style={{ fontSize: 32 }} />
            </Form.Item>

            <Form.Item
              name="title"
              label={<Text strong>Tiêu đề đánh giá</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề!' },
                { max: 200, message: 'Tiêu đề không quá 200 ký tự!' }
              ]}
            >
              <Input 
                placeholder="Tóm tắt trải nghiệm của bạn"
                size="large"
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="comment"
              label={<Text strong>Đánh giá chi tiết</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá!' }]}
            >
              <TextArea
                rows={6}
                placeholder="Hãy chia sẻ trải nghiệm của bạn với sản phẩm này"
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space size="middle">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submittingReview}
                  size="large"
                  style={{
                    borderRadius: 24,
                    height: 44,
                    fontWeight: 600,
                    padding: '0 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  Gửi đánh giá
                </Button>
                <Button 
                  onClick={() => setReviewModalVisible(false)}
                  size="large"
                  style={{
                    borderRadius: 24,
                    height: 44,
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ProductDetailPage;
