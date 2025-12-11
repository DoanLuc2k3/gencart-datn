import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  InputNumber,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Image,
  Popconfirm,
  message,
  Steps,
  Tooltip
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined,
  CarOutlined,
  GiftOutlined,
  MinusOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { getValidImageUrl, handleImageError } from "../utils/imageUtils";
import { useCart } from "../context/CartContext";
import useScrollToTop from "../hooks/useScrollToTop";

const { Title, Text, Paragraph } = Typography;

const CartPage = () => {
  // Scroll to top when page loads
  useScrollToTop();

  const navigate = useNavigate();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    message.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
    message.success("Giỏ hàng đã được làm sạch");
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "60px"
      }}
    >
      {/* Modern Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "60px 24px 60px",
          position: "relative",
          overflow: "hidden",
          marginBottom: "0"
        }}
      >
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Row justify="space-between" align="middle" gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Title
                level={1}
                style={{
                  color: "white",
                  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2
                }}
              >
                Giỏ hàng của bạn <span style={{ color: "#818cf8" }}>GenCart</span>
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: "18px", marginTop: "12px", display: "block" }}>
                {cartItems.length > 0
                  ? `Bạn có ${cartItems.length} sản phẩm sẵn sàng thanh toán`
                  : "Hãy thêm sản phẩm vào giỏ để bắt đầu mua sắm!"}
              </Text>
            </Col>
            <Col xs={24} md={10}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "16px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Steps
                  current={0}
                  items={[
                    { title: 'Giỏ hàng', icon: <ShoppingOutlined /> },
                    { title: 'Thanh toán', icon: <CreditCardOutlined /> },
                    { title: 'Hoàn tất', icon: <SafetyCertificateOutlined /> },
                  ]}
                  className="custom-steps"
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "24px auto 0", padding: "0 24px" }}>
        {cartItems.length > 0 ? (
          <Row gutter={[32, 32]}>
            {/* Cart Items List */}
            <Col xs={24} lg={16}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <Title level={4} style={{ margin: 0, color: "#334155" }}>Sản phẩm trong giỏ</Title>
                  <Popconfirm
                    title="Xóa tất cả sản phẩm?"
                    description="Hành động này không thể hoàn tác."
                    onConfirm={handleClearCart}
                    okText="Xóa hết"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Xóa giỏ hàng
                    </Button>
                  </Popconfirm>
                </div>

                {/* Desktop Header */}
                <div className="cart-header-desktop" style={{ padding: "0 24px 12px", borderBottom: "2px solid #f1f5f9" }}>
                   <Row gutter={[24, 0]} align="middle">
                      <Col md={10}><Text strong style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px" }}>SẢN PHẨM</Text></Col>
                      <Col md={4} style={{ textAlign: "center" }}><Text strong style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px" }}>GIÁ</Text></Col>
                      <Col md={5} style={{ textAlign: "center" }}><Text strong style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px" }}>SỐ LƯỢNG</Text></Col>
                      <Col md={4} style={{ textAlign: "right" }}><Text strong style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px" }}>TỔNG</Text></Col>
                      <Col md={1}></Col>
                   </Row>
                </div>

                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      background: "white",
                      borderRadius: "20px",
                      padding: "20px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
                      border: "1px solid #f1f5f9",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    className="cart-item-card"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.02)";
                      e.currentTarget.style.borderColor = "#f1f5f9";
                    }}
                  >
                    <Row gutter={[24, 24]} align="middle">
                      {/* Product Info */}
                      <Col xs={24} md={10}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ 
                              width: '80px', 
                              height: '80px', 
                              flexShrink: 0, 
                              borderRadius: '12px', 
                              overflow: 'hidden', 
                              border: '1px solid #f1f5f9',
                              position: 'relative'
                            }}>
                                <Image
                                  src={getValidImageUrl(item.image_url || item.image || item.primary_image, item.name, 100, 100)}
                                  alt={item.name}
                                  width="100%"
                                  height="100%"
                                  style={{ objectFit: "cover" }}
                                  preview={{ mask: <div style={{ fontSize: "12px" }}>Xem</div> }}
                                  onError={(e) => handleImageError(e, item.name, 100, 100)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text type="secondary" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", display: 'block', marginBottom: '4px' }}>
                                  {item.category_name || "Sản phẩm"}
                                </Text>
                                <Link to={`/products/${item.id}`}>
                                  <Title level={5} style={{ margin: 0, fontSize: "16px", color: "#1e293b", lineHeight: 1.4 }} className="hover-text-primary">
                                    {item.name}
                                  </Title>
                                </Link>
                                {item.inventory && item.inventory <= 5 && (
                                  <Text type="warning" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", marginTop: '4px' }}>
                                    <SafetyCertificateOutlined /> Chỉ còn {item.inventory} sản phẩm
                                  </Text>
                                )}
                            </div>
                        </div>
                      </Col>

                      {/* Price */}
                      <Col xs={12} md={4} style={{ textAlign: 'center' }}>
                         <div className="mobile-label" style={{ display: 'none', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Giá</div>
                         {item.discount_price ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Text delete style={{ color: "#94a3b8", fontSize: "13px" }}>
                                ₫{parseFloat(item.price).toLocaleString()}
                              </Text>
                              <Text strong style={{ color: "#ef4444", fontSize: "16px" }}>
                                ₫{parseFloat(item.discount_price).toLocaleString()}
                              </Text>
                            </div>
                          ) : (
                            <Text strong style={{ color: "#334155", fontSize: "16px" }}>
                              ₫{parseFloat(item.price).toLocaleString()}
                            </Text>
                          )}
                      </Col>

                      {/* Quantity */}
                      <Col xs={12} md={5} style={{ textAlign: 'center' }}>
                         <div className="mobile-label" style={{ display: 'none', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Số lượng</div>
                         <div style={{ display: "inline-flex", alignItems: "center", background: "#f8fafc", borderRadius: "10px", padding: "2px", border: "1px solid #e2e8f0" }}>
                              <Button 
                                type="text" 
                                icon={<MinusOutlined style={{ fontSize: "10px" }} />} 
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                style={{ borderRadius: "8px", width: "28px", height: "28px" }}
                              />
                              <InputNumber
                                min={1}
                                max={item.inventory || 10}
                                value={item.quantity}
                                onChange={(value) => handleQuantityChange(item.id, value)}
                                bordered={false}
                                controls={false}
                                style={{ width: "36px", textAlign: "center", fontWeight: "600", fontSize: "14px" }}
                              />
                              <Button 
                                type="text" 
                                icon={<PlusOutlined style={{ fontSize: "10px" }} />} 
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.inventory || 10)}
                                style={{ borderRadius: "8px", width: "28px", height: "28px" }}
                              />
                            </div>
                      </Col>

                      {/* Total */}
                      <Col xs={12} md={4} style={{ textAlign: 'right' }}>
                         <div className="mobile-label" style={{ display: 'none', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Tổng</div>
                         <Text strong style={{ color: "#4f46e5", fontSize: "16px" }}>
                            ₫{(parseFloat(item.discount_price || item.price) * item.quantity).toLocaleString()}
                         </Text>
                      </Col>

                      {/* Actions */}
                      <Col xs={12} md={1} style={{ textAlign: 'right' }}>
                         <Tooltip title="Xóa sản phẩm">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveItem(item.id)}
                                className="delete-btn"
                                style={{ borderRadius: "50%", width: "32px", height: "32px", display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}
                              />
                         </Tooltip>
                      </Col>
                    </Row>
                  </div>
                ))}

                <Button
                  size="large"
                  icon={<ArrowRightOutlined rotate={180} />}
                  style={{ alignSelf: "flex-start", marginTop: "16px", height: "48px", borderRadius: "12px" }}
                >
                  <Link to="/products">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <div style={{ position: "sticky", top: "24px" }}>
                <div style={{
                  background: "white",
                  borderRadius: "24px",
                  padding: "32px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #f1f5f9"
                }}>
                  <Title level={3} style={{ margin: "0 0 24px 0", fontSize: "24px" }}>Tóm tắt đơn hàng</Title>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <Text>Tạm tính ({cartItems.length} sản phẩm)</Text>
                      <Text strong style={{ color: "#334155" }}>₫{cartTotal.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                      <Text>Phí vận chuyển</Text>
                      <Text strong style={{ color: cartTotal >= 999 ? "#10b981" : "#334155" }}>
                        {cartTotal >= 999 ? "MIỄN PHÍ" : "₫50.00"}
                      </Text>
                    </div>
                    
                    {cartTotal < 999 && (
                      <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "12px", border: "1px dashed #86efac", display: "flex", gap: "8px", alignItems: "center" }}>
                        <GiftOutlined style={{ color: "#16a34a" }} />
                        <Text style={{ fontSize: "13px", color: "#166534" }}>
                          Thêm <strong>₫{(999 - cartTotal).toLocaleString()}</strong> để được <span style={{ color: "#16a34a", fontWeight: "700" }}>MIỄN PHÍ vận chuyển</span>
                        </Text>
                      </div>
                    )}
                  </div>

                  <Divider style={{ margin: "24px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                    <Text style={{ fontSize: "16px", color: "#334155", fontWeight: "600" }}>Tổng cộng</Text>
                    <div style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "32px", fontWeight: "800", color: "#4f46e5", lineHeight: 1 }}>
                        ₫{(cartTotal + (cartTotal >= 999 ? 0 : 50)).toLocaleString()}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
                        Đã bao gồm VAT
                      </Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleCheckout}
                    style={{
                      height: "60px",
                      fontSize: "18px",
                      fontWeight: "700",
                      background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
                      marginBottom: "24px"
                    }}
                    className="checkout-btn"
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(79, 70, 229, 0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(79, 70, 229, 0.3)"; }}
                  >
                    Thanh toán <ArrowRightOutlined />
                  </Button>

                  <div style={{ display: "flex", justifyContent: "center", gap: "16px", color: "#94a3b8" }}>
                    <Tooltip title="Thanh toán an toàn"><SafetyCertificateOutlined style={{ fontSize: "24px" }} /></Tooltip>
                    <Tooltip title="Giao hàng nhanh"><CarOutlined style={{ fontSize: "24px" }} /></Tooltip>
                    <Tooltip title="Đổi trả dễ dàng"><InboxOutlined style={{ fontSize: "24px" }} /></Tooltip>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "100px 20px",
              background: "white",
              borderRadius: "32px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
              margin: "40px auto",
              maxWidth: "800px",
              border: "1px solid #f1f5f9"
            }}
          >
            <div style={{ 
              width: "120px", 
              height: "120px", 
              background: "#f1f5f9", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 32px" 
            }}>
              <ShoppingOutlined style={{ fontSize: "48px", color: "#94a3b8" }} />
            </div>
            <Title level={2} style={{ color: "#1e293b", marginBottom: "16px" }}>
              Giỏ hàng của bạn đang trống
            </Title>
            <Paragraph style={{ fontSize: "18px", color: "#64748b", maxWidth: "500px", margin: "0 auto 40px" }}>
              Có vẻ như bạn chưa chọn sản phẩm nào. Khám phá các bộ sưu tập mới nhất của chúng tôi và tìm món đồ bạn yêu thích.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              style={{
                height: "56px",
                padding: "0 48px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)"
              }}
            >
              <Link to="/products">Mua sắm ngay</Link>
            </Button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .custom-steps .ant-steps-item-process .ant-steps-item-icon {
          background: #4f46e5;
          border-color: #4f46e5;
        }
        .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
          border-color: #4f46e5;
        }
        .custom-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
          color: #4f46e5;
        }
        .custom-steps .ant-steps-item-title {
          color: rgba(255,255,255,0.8) !important;
        }
        .custom-steps .ant-steps-item-process .ant-steps-item-title {
          color: white !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CartPage;
