import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Radio,
  Divider,
  Row,
  Col,
  Card,
  Steps,
  message,
  Space,
  Table,
  InputNumber,
  Checkbox
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { triggerInventoryRefresh } from '../utils/inventoryEvents';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const CheckoutPage = () => {
  useScrollToTop();

  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const sectionCardStyle = {
    borderRadius: 20,
    border: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 28px 60px -32px rgba(15, 23, 42, 0.4)',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(8px)'
  };

  const innerCardStyle = {
    borderRadius: 16,
    border: '1px solid rgba(148, 163, 184, 0.16)',
    background: 'rgba(248, 250, 252, 0.8)'
  };
  
  const mainCardStyle = {
    borderRadius: 24,
    background: 'rgba(255,255,255,0.98)',
    boxShadow: '0 32px 70px -36px rgba(15, 23, 42, 0.35)',
    border: '1px solid rgba(148, 163, 184, 0.16)'
  };

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      message.info('Your cart is empty. Please add items before checkout.');
      navigate('/cart');
    }
  }, [cartItems, navigate, orderComplete]);

  // Handle shipping form submission
  const handleShippingSubmit = (values) => {
    setShippingData(values);
    setCurrentStep(1);
  };

  // Handle payment form submission
  const handlePaymentSubmit = (values) => {
    setPaymentData(values);
    setCurrentStep(2);
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Please login to place an order');
        navigate('/login');
        return;
      }

      // Check if cart is empty
      if (cartItems.length === 0) {
        message.error('Your cart is empty. Please add items to your cart before placing an order.');
        setLoading(false);
        return;
      }

      // Sync local cart with backend cart
      // This ensures that the backend cart has the same items as the frontend cart
      for (const item of cartItems) {
        try {
          const response = await fetch('http://localhost:8000/api/cart/add_item/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: item.id,
              quantity: item.quantity
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync cart item:', item);
          }
        } catch (error) {
          console.error('Error syncing cart item:', error);
        }
      }

      // Get default addresses or create new ones
      let shippingAddressId, billingAddressId;

      // First, try to get the user's addresses
      const addressResponse = await fetch('http://localhost:8000/api/addresses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (addressResponse.ok) {
        const addresses = await addressResponse.json();

        // Check if user has addresses
        if (addresses.results && addresses.results.length > 0) {
          // Try to find default shipping and billing addresses
          const defaultShipping = addresses.results.find(addr => addr.address_type === 'shipping' && addr.default);
          const defaultBilling = addresses.results.find(addr => addr.address_type === 'billing' && addr.default);

          shippingAddressId = defaultShipping ? defaultShipping.id : null;
          billingAddressId = defaultBilling ? defaultBilling.id : null;
        }
      }

      // If no addresses found, create new ones
      if (!shippingAddressId) {
        // Create shipping address
        const shippingAddressData = {
          address_type: 'shipping',
          street_address: shippingData.addressLine1,
          apartment_address: shippingData.addressLine2 || '',
          city: shippingData.city,
          state: shippingData.state,
          country: shippingData.country,
          zip_code: shippingData.pincode,
          default: true
        };

        const createShippingResponse = await fetch('http://localhost:8000/api/addresses/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(shippingAddressData),
        });

        if (createShippingResponse.ok) {
          const newShippingAddress = await createShippingResponse.json();
          shippingAddressId = newShippingAddress.id;
        } else {
          throw new Error('Failed to create shipping address');
        }
      }

      // Use the same address for billing if not specified
      if (!billingAddressId) {
        billingAddressId = shippingAddressId;
      }

      // Use the create_from_cart endpoint with the correct URL
      const createOrderResponse = await fetch('http://localhost:8000/api/orders/create_from_cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      const orderData = await createOrderResponse.json();
      setOrderId(orderData.id);

      // Clear the cart
      await fetch('http://localhost:8000/api/cart/clear/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Clear the cart in the frontend
      clearCart();

      // Set order as complete
      setOrderComplete(true);
      setCurrentStep(3);

      message.success('Order placed successfully!');
      console.log('CheckoutPage: Triggering inventory refresh after successful order');
      triggerInventoryRefresh(); // Trigger inventory refresh after successful order
    } catch (error) {
      message.error(error.message || 'Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation between steps
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Order summary columns for the table
  const orderSummaryColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => {
        const price = record.discount_price || record.price;
        return <Text>₫{parseFloat(price).toFixed(2)}</Text>;
      },
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const price = record.discount_price || record.price;
        return <Text strong>₫{(parseFloat(price) * record.quantity).toFixed(2)}</Text>;
      },
    },
  ];

  // Render shipping form
  const renderShippingForm = () => (
    <Card
      title="Shipping Information"
      bordered={false}
  style={sectionCardStyle}
      bodyStyle={{ padding: '32px' }}
      headStyle={{ fontSize: '20px', fontWeight: 600 }}
    >
      <Form
        form={shippingForm}
        layout="vertical"
        initialValues={shippingData || {}}
        onFinish={handleShippingSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input prefix={<UserOutlined />} style={{ padding: '0 11px' }} placeholder="John Doe" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="example@email.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input placeholder="+91 9876543210" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine1"
              label="Address Line 1"
              rules={[{ required: true, message: 'Please enter your address' }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="123 Main St" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine2"
              label="Address Line 2"
            >
              <Input placeholder="Apartment, suite, etc. (optional)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please enter your city' }]}
            >
              <Input placeholder="Ho Chi Minh City" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'Please select your state' }]}
            >
              <Select
                placeholder="Select state"
                className="checkout-select"
              >
                <Option value="hochiminh">Ho Chi Minh</Option>
                <Option value="hanoi">Ha Noi</Option>
                <Option value="danang">Da Nang</Option>
                <Option value="hue">Hue</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="pincode"
              label="PIN Code"
              rules={[{ required: true, message: 'Please enter your PIN code' }]}
            >
              <Input placeholder="700000" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="country"
              label="Country"
              initialValue="vietnam"
              rules={[{ required: true, message: 'Please select your country' }]}
            >
              <Select
                placeholder="Select country"
                className="checkout-select"
              >
                <Option value="vietnam">Viet Nam</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Continue to Payment
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <Card
      title="Payment Information"
      bordered={false}
  style={sectionCardStyle}
      bodyStyle={{ padding: '32px' }}
      headStyle={{ fontSize: '20px', fontWeight: 600 }}
    >
      <Form
        form={paymentForm}
        layout="vertical"
        initialValues={paymentData || {}}
        onFinish={handlePaymentSubmit}
      >
        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[{ required: true, message: 'Please select a payment method' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="creditCard">
                <Space>
                  <CreditCardOutlined /> Credit/Debit Card
                </Space>
              </Radio>
              <Radio value="upi">UPI</Radio>
              <Radio value="netBanking">Net Banking</Radio>
              <Radio value="cod">Cash on Delivery</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.paymentMethod !== currentValues.paymentMethod}
        >
          {({ getFieldValue }) => {
            const paymentMethod = getFieldValue('paymentMethod');

            if (paymentMethod === 'creditCard') {
              return (
                <>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardNumber"
                        label="Card Number"
                        rules={[{ required: true, message: 'Please enter your card number' }]}
                      >
                        <Input
                          prefix={<CreditCardOutlined />}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="expiryDate"
                        label="Expiry Date (MM/YY)"
                        rules={[{ required: true, message: 'Please enter expiry date' }]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="cvv"
                        label="CVV"
                        rules={[{ required: true, message: 'Please enter CVV' }]}
                      >
                        <Input
                          prefix={<LockOutlined />}
                          placeholder="123"
                          maxLength={3}
                          type="password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        name="nameOnCard"
                        label="Name on Card"
                        rules={[{ required: true, message: 'Please enter name on card' }]}
                      >
                        <Input placeholder="John Doe" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              );
            }

            if (paymentMethod === 'upi') {
              return (
                <Form.Item
                  name="upiId"
                  label="UPI ID"
                  rules={[{ required: true, message: 'Please enter your UPI ID' }]}
                >
                  <Input placeholder="name@upi" />
                </Form.Item>
              );
            }

            if (paymentMethod === 'netBanking') {
              return (
                <Form.Item
                  name="bank"
                  label="Select Bank"
                  rules={[{ required: true, message: 'Please select your bank' }]}
                >
                  <Select placeholder="Select bank">
                    <Option value="sbi">State Bank of India</Option>
                    <Option value="hdfc">HDFC Bank</Option>
                    <Option value="icici">ICICI Bank</Option>
                    <Option value="axis">Axis Bank</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>

        <Form.Item name="savePaymentInfo" valuePropName="checked">
          <Checkbox>Save payment information for future purchases</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={handlePrevStep}>
              Back to Shipping
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              Review Order
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Render order review
  const renderOrderReview = () => (
    <Card
      title="Order Review"
      bordered={false}
  style={sectionCardStyle}
      bodyStyle={{ padding: '32px' }}
      headStyle={{ fontSize: '20px', fontWeight: 600 }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card type="inner" title="Shipping Information" style={innerCardStyle} bodyStyle={{ padding: '24px' }}>
            <p><strong>Name:</strong> {shippingData.fullName}</p>
            <p><strong>Email:</strong> {shippingData.email}</p>
            <p><strong>Phone:</strong> {shippingData.phone}</p>
            <p>
              <strong>Address:</strong> {shippingData.addressLine1}
              {shippingData.addressLine2 && `, ${shippingData.addressLine2}`},
              {shippingData.city}, {shippingData.state}, {shippingData.pincode}, {shippingData.country}
            </p>
          </Card>

          <Divider />

          <Card type="inner" title="Payment Method" style={innerCardStyle} bodyStyle={{ padding: '24px' }}>
            <p>
              <strong>Payment Method:</strong> {
                paymentData.paymentMethod === 'creditCard' ? 'Credit/Debit Card' :
                paymentData.paymentMethod === 'upi' ? 'UPI' :
                paymentData.paymentMethod === 'netBanking' ? 'Net Banking' : 'Cash on Delivery'
              }
            </p>
            {paymentData.paymentMethod === 'creditCard' && (
              <p><strong>Card Number:</strong> **** **** **** {paymentData.cardNumber.slice(-4)}</p>
            )}
            {paymentData.paymentMethod === 'upi' && (
              <p><strong>UPI ID:</strong> {paymentData.upiId}</p>
            )}
            {paymentData.paymentMethod === 'netBanking' && (
              <p><strong>Bank:</strong> {
                paymentData.bank === 'sbi' ? 'State Bank of India' :
                paymentData.bank === 'hdfc' ? 'HDFC Bank' :
                paymentData.bank === 'icici' ? 'ICICI Bank' :
                paymentData.bank === 'axis' ? 'Axis Bank' : 'Other'
              }</p>
            )}
          </Card>

          <Divider />

          <Card type="inner" title="Order Items" style={innerCardStyle} bodyStyle={{ padding: '24px' }}>
            <Table
              dataSource={cartItems}
              columns={orderSummaryColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Order Summary" style={innerCardStyle} bodyStyle={{ padding: '24px' }}>
            <p><strong>Subtotal:</strong> ₫{cartTotal.toFixed(2)}</p>
            <p><strong>Shipping:</strong> Free</p>
            <p><strong>Tax:</strong> ₫{(cartTotal * 0.18).toFixed(2)}</p>
            <Divider />
            <p><strong>Total:</strong> ₫{(cartTotal + cartTotal * 0.18).toFixed(2)}</p>

            <Button
              type="primary"
              size="large"
              block
              onClick={handlePlaceOrder}
              loading={loading}
            >
              Place Order
            </Button>
            <Button
              onClick={handlePrevStep}
              style={{ marginTop: '10px' }}
              block
            >
              Back to Payment
            </Button>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // Render order confirmation
  const renderOrderConfirmation = () => (
    <Card
      bordered={false}
  style={sectionCardStyle}
      bodyStyle={{ padding: '48px 32px' }}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a' }} />
        <Title level={2}>Order Placed Successfully!</Title>
        <Paragraph>
          Thank you for your order. Your order has been placed successfully.
        </Paragraph>
        <Paragraph>
          <strong>Order ID:</strong> {orderId}
        </Paragraph>
        <Paragraph>
          An email confirmation has been sent to {shippingData.email}.
        </Paragraph>
        <Divider />
        <Space size="large">
          <Button type="primary" size="large" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
          <Button size="large" onClick={() => navigate('/orders')}>
            View My Orders
          </Button>
        </Space>
      </div>
    </Card>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentForm();
      case 2:
        return renderOrderReview();
      case 3:
        return renderOrderConfirmation();
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '48px 24px 96px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
          }}
        />
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Title
              level={2}
              style={{
                marginBottom: 12,
                color: '#fff',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                textShadow: '0 18px 45px rgba(15, 23, 42, 0.4)'
              }}
            >
              Checkout
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                marginBottom: 0
              }}
            >
              Review your shipping details, choose a payment method, and place your order securely.
            </Paragraph>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '-72px auto 0',
          padding: '0 20px 56px'
        }}
      >
        <Card
          bordered={false}
          style={mainCardStyle}
          bodyStyle={{ padding: '32px 24px' }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Steps
              current={currentStep}
              responsive
              style={{
                marginBottom: '24px',
                padding: '0 12px'
              }}
            >
              <Step title="Shipping" icon={<HomeOutlined />} />
              <Step title="Payment" icon={<CreditCardOutlined />} />
              <Step title="Review" icon={<ShoppingOutlined />} />
              <Step title="Confirmation" icon={<CheckCircleOutlined />} />
            </Steps>

            <Divider style={{ margin: '0 0 24px' }} />

            <div>
              {renderStepContent()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
