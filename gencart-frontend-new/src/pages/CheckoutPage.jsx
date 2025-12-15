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
  Checkbox,
  Modal,
  Spin,
  Tag,
  Alert
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  LockOutlined,
  ArrowRightOutlined,
  BankOutlined,
  MobileOutlined,
  WalletOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  GatewayOutlined,
  DisconnectOutlined
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
  
  // Blockchain states
  const [web3Connected, setWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [transactionHash, setTransactionHash] = useState('');
  const [blockchainPaymentModalVisible, setBlockchainPaymentModalVisible] = useState(false);
  const [txStatus, setTxStatus] = useState('pending'); // pending, success, error

  const sectionCardStyle = {
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    background: 'white',
    overflow: 'hidden'
  };

  // Get blockchain explorer URL based on network
  const getBlockchainExplorerUrl = (network, txHash) => {
    const explorers = {
      ethereum: `https://sepolia.etherscan.io/tx/${txHash}`,
      bsc: `https://bscscan.com/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`
    };
    return explorers[network] || explorers.ethereum;
  };

  // Get explorer name
  const getExplorerName = (network) => {

    const names = {
      ethereum: 'Sepolia Etherscan',
      bsc: 'BscScan',
      polygon: 'PolygonScan'
    };
    return names[network] || 'Blockchain Explorer';
  };

  // Blockchain utility functions
  const connectWallet = async () => {
    try {
      setBlockchainLoading(true);
      
      if (typeof window.ethereum === 'undefined') {
        message.error('Vui lòng cài đặt MetaMask hoặc ví Web3 khác');
        window.open('https://metamask.io/', '_blank');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWeb3Connected(true);
        message.success(`Kết nối ví thành công: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      if (error.code === 4001) {
        message.error('Bạn đã từ chối kết nối ví');
      } else {
        message.error('Không thể kết nối ví. Vui lòng thử lại.');
      }
    } finally {
      setBlockchainLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setWeb3Connected(false);
    message.info('Đã ngắt kết nối ví');
  };

  const switchNetwork = async (networkName) => {
    try {
      setBlockchainLoading(true);
      
      const networkConfigs = {
        ethereum: {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://eth-mainnet.alchemyapi.io/v2/demo'],
          blockExplorerUrls: ['https://etherscan.io'],
        },
        bsc: {
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed1.binance.org:8545'],
          blockExplorerUrls: ['https://bscscan.com'],
        },
        polygon: {
          chainId: '0x89',
          chainName: 'Polygon (Matic)',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com'],
        },
      };

      const config = networkConfigs[networkName];

      if (!config) {
        message.error('Network không được hỗ trợ');
        return;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });

      setSelectedNetwork(networkName);
      message.success(`Đã chuyển sang mạng ${config.chainName}`);
    } catch (error) {
      if (error.code === 4902) {
        try {
          const networkConfigs = {
            ethereum: {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
           
            bsc: {
              chainId: '0x38',
              chainName: 'Binance Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed1.binance.org:8545'],
              blockExplorerUrls: ['https://bscscan.com'],
            },
            polygon: {
              chainId: '0x89',
              chainName: 'Polygon (Matic)',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://polygon-rpc.com'],
              blockExplorerUrls: ['https://polygonscan.com'],
            },
          };

          const config = networkConfigs[networkName];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [config],
          });
          setSelectedNetwork(networkName);
          message.success(`Đã thêm và chuyển sang mạng ${config.chainName}`);
        } catch (addError) {
          message.error('Không thể thêm mạng. Vui lòng thử lại.');
        }
      } else {
        message.error('Không thể chuyển mạng. Vui lòng thử lại.');
      }
    } finally {
      setBlockchainLoading(false);
    }
  };

   const handleBlockchainPayment = async () => {
    try {
      if (!web3Connected) {
        message.error('Vui lòng kết nối ví trước');
        return;
      }

      setBlockchainLoading(true);
      setBlockchainPaymentModalVisible(true);
      setTxStatus('pending');

      // Tính toán số tiền (giả định: 1 ETH = 2000 USD)
      const amountInCrypto = (cartTotal / 2000).toFixed(6);
      const amountInWei = BigInt(Math.floor(parseFloat(amountInCrypto) * 1e18)).toString(16);

      // Địa chỉ nhận hàng (thay bằng địa chỉ thực tế của bạn)
      const receiverAddress = '0x742d35Cc6634C0532925a3b844Bc6e7595f26f46';

      const transactionData = {
        to: receiverAddress,
        from: walletAddress,
        value: '0x' + amountInWei,
        gas: '0x5208', // 21000 in hex
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionData],
      });

      setTransactionHash(txHash);
      setTxStatus('success');
      message.success('Giao dịch đã được gửi');

      // Chờ 3 giây trước khi tạo đơn hàng
      setTimeout(() => {
        setBlockchainPaymentModalVisible(false);
        handlePlaceOrder(txHash);
      }, 3000);
    } catch (error) {
      console.error('Blockchain payment error:', error);
      setTxStatus('error');
      
      if (error.code === 4001) {
        message.error('Bạn đã từ chối giao dịch');
      } else {
        message.error('Lỗi khi thực hiện thanh toán blockchain');
      }
      
      setTimeout(() => {
        setBlockchainPaymentModalVisible(false);
      }, 2000);
    } finally {
      setBlockchainLoading(false);
    }
  };
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      message.info('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
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
    if (values.paymentMethod === 'blockchain' && !web3Connected) {
      message.error('Vui lòng kết nối ví blockchain trước');
      return;
    }
    
    if (values.paymentMethod === 'blockchain') {
      handleBlockchainPayment();
      return;
    }

    setPaymentData(values);
    setCurrentStep(2);
  };

  // Handle order placement
  const handlePlaceOrder = async (blockchainTxHash = null) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Vui lòng đăng nhập để đặt hàng');
        navigate('/login');
        return;
      }

      if (cartItems.length === 0) {
        message.error('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ trước khi đặt hàng.');
        setLoading(false);
        return;
      }

      // Sync cart items
      for (const item of cartItems) {
        try {
          await fetch('http://localhost:8000/api/cart/add_item/', {
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
        } catch (error) {
          console.error('Error syncing cart item:', error);
        }
      }

      // Get addresses
      let shippingAddressId, billingAddressId;
      const addressResponse = await fetch('http://localhost:8000/api/addresses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (addressResponse.ok) {
        const addresses = await addressResponse.json();
        if (addresses.results && addresses.results.length > 0) {
          const defaultShipping = addresses.results.find(addr => addr.address_type === 'shipping' && addr.default);
          const defaultBilling = addresses.results.find(addr => addr.address_type === 'billing' && addr.default);

          shippingAddressId = defaultShipping ? defaultShipping.id : null;
          billingAddressId = defaultBilling ? defaultBilling.id : null;
        }
      }

      // Create shipping address if needed
      if (!shippingAddressId) {
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

      if (!billingAddressId) {
        billingAddressId = shippingAddressId;
      }

      // Create order
      const orderPayload = {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
      };

      if (blockchainTxHash) {
        orderPayload.blockchain_transaction_hash = blockchainTxHash;
        orderPayload.payment_method = 'blockchain';
        orderPayload.blockchain_network = selectedNetwork;
        orderPayload.wallet_address = walletAddress;
      }

      const createOrderResponse = await fetch('http://localhost:8000/api/orders/create_from_cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }

      const orderData = await createOrderResponse.json();
      setOrderId(orderData.id);

      // Clear cart
      await fetch('http://localhost:8000/api/cart/clear/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      clearCart();
      setOrderComplete(true);
      setCurrentStep(3);

      message.success('Đặt hàng thành công!');
      triggerInventoryRefresh();
    } catch (error) {
      message.error(error.message || 'Đặt hàng không thành công. Vui lòng thử lại.');
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation between steps
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Order summary columns
  const orderSummaryColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => {
        const price = record.discount_price || record.price;
        return <Text>₫{parseFloat(price).toFixed(2)}</Text>;
      },
    },
    {
      title: 'Tổng',
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
      bordered={false}
      style={sectionCardStyle}
      bodyStyle={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.15)'
        }}>
          <HomeOutlined style={{ fontSize: '28px', color: '#4f46e5' }} />
        </div>
        <Title level={2} style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Thông tin giao hàng
        </Title>
        <Text style={{ fontSize: '18px', color: '#64748b', maxWidth: '400px', margin: '0 auto', display: 'block', lineHeight: 1.6 }}>
          Địa chỉ nhận hàng của bạn
        </Text>
      </div>

      <Form
        form={shippingForm}
        layout="vertical"
        initialValues={shippingData || {}}
        onFinish={handleShippingSubmit}
        size="large"
        requiredMark={false}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Họ và tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Nguyễn Văn A" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input 
                prefix={<span style={{ color: '#94a3b8' }}>@</span>} 
                placeholder="example@email.com" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Số điện thoại</span>}
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input 
                prefix={<span style={{ color: '#94a3b8' }}>#</span>} 
                placeholder="+84 987 654 321" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine1"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Địa chỉ 1</span>}
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input 
                prefix={<HomeOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="123 Đường Lê Lợi" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="addressLine2"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Địa chỉ 2 (không bắt buộc)</span>}
            >
              <Input 
                placeholder="Tầng 2, Chung cư ABC" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="city"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Thành phố</span>}
              rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
            >
              <Input 
                placeholder="Thành phố Hồ Chí Minh" 
                style={{ borderRadius: '12px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name="state"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Tỉnh/Thành phố</span>}
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
            >
              <Select placeholder="Chọn tỉnh/thành phố" style={{ borderRadius: '12px' }}>
                <Option value="hochiminh">Hồ Chí Minh</Option>
                <Option value="hanoi">Hà Nội</Option>
                <Option value="danang">Đà Nẵng</Option>
                <Option value="hue">Huế</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="pincode"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Mã bưu chính</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã bưu chính' }]}
            >
              <Input placeholder="700000" style={{ borderRadius: '12px' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="country"
              label={<span style={{ fontWeight: 600, color: '#475569' }}>Quốc gia</span>}
              initialValue="vietnam"
              rules={[{ required: true, message: 'Vui lòng chọn quốc gia' }]}
            >
              <Select placeholder="Chọn quốc gia" style={{ borderRadius: '12px' }}>
                <Option value="vietnam">Việt Nam</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: '16px', marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block
            style={{ 
              height: '56px', 
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
            }}
          >
            Tiếp tục thanh toán <ArrowRightOutlined />
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <Card
      bordered={false}
      style={sectionCardStyle}
      bodyStyle={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15)'
        }}>
          <CreditCardOutlined style={{ fontSize: '28px', color: '#10b981' }} />
        </div>
        <Title level={2} style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Phương thức thanh toán
        </Title>
        <Text style={{ fontSize: '18px', color: '#64748b', maxWidth: '400px', margin: '0 auto', display: 'block', lineHeight: 1.6 }}>
          Chọn phương thức thanh toán
        </Text>
      </div>

      <Form
        form={paymentForm}
        layout="vertical"
        initialValues={paymentData || {}}
        onFinish={handlePaymentSubmit}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="paymentMethod"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Radio.Button 
                  value="creditCard" 
                  style={{ 
                    height: 'auto', 
                    padding: '20px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="payment-radio"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CreditCardOutlined style={{ fontSize: '24px', color: '#64748b' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155' }}>Thẻ tín dụng/Ghi nợ</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Visa, Mastercard, JCB</Text>
                  </div>
                </Radio.Button>
              </Col>
              <Col xs={24} md={12}>
                <Radio.Button 
                  value="upi" 
                  style={{ 
                    height: 'auto', 
                    padding: '20px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="payment-radio"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MobileOutlined style={{ fontSize: '24px', color: '#64748b' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155' }}>Ví điện tử/QR Code</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Google Pay, Momo, ZaloPay</Text>
                  </div>
                </Radio.Button>
              </Col>
              <Col xs={24} md={12}>
                <Radio.Button 
                  value="netBanking" 
                  style={{ 
                    height: 'auto', 
                    padding: '20px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="payment-radio"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BankOutlined style={{ fontSize: '24px', color: '#64748b' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155' }}>Ngân hàng trực tuyến</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Hỗ trợ tất cả ngân hàng lớn</Text>
                  </div>
                </Radio.Button>
              </Col>
              <Col xs={24} md={12}>
                <Radio.Button 
                  value="cod" 
                  style={{ 
                    height: 'auto', 
                    padding: '20px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="payment-radio"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <WalletOutlined style={{ fontSize: '24px', color: '#64748b' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155' }}>Thanh toán khi nhận hàng</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Thanh toán khi nhận hàng</Text>
                  </div>
                </Radio.Button>
              </Col>
              <Col xs={24} md={12}>
                <Radio.Button 
                  value="blockchain" 
                  style={{ 
                    height: 'auto', 
                    padding: '20px', 
                    width: '100%', 
                    borderRadius: '16px', 
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  className="payment-radio"
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <GatewayOutlined style={{ fontSize: '24px', color: '#64748b' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155' }}>Blockchain</Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>ETH, BNB, MATIC</Text>
                  </div>
                </Radio.Button>
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>
        <style>{`
          .payment-radio.ant-radio-button-wrapper {
            border-inline-start-width: 2px !important;
          }
          .payment-radio.ant-radio-button-wrapper:not(:first-child)::before {
            display: none;
          }
          .payment-radio.ant-radio-button-wrapper-checked {
            border-color: #10b981 !important;
            background: #ecfdf5 !important;
          }
          .payment-radio.ant-radio-button-wrapper-checked .anticon {
            color: #10b981 !important;
          }
          .payment-radio.ant-radio-button-wrapper-checked div:first-child {
            background: #d1fae5 !important;
          }
        `}</style>

        <Divider style={{ margin: '32px 0' }} />

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.paymentMethod !== currentValues.paymentMethod}
        >
          {({ getFieldValue }) => {
            const paymentMethod = getFieldValue('paymentMethod');

            if (paymentMethod === 'blockchain') {
              return (
                <>
                  {web3Connected ? (
                    <Alert
                      message={`Ví đã kết nối: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                      type="success"
                      showIcon
                      style={{ marginBottom: '20px' }}
                      action={
                        <Button size="small" danger onClick={disconnectWallet}>
                          Ngắt kết nối
                        </Button>
                      }
                    />
                  ) : (
                    <Alert
                      message="Vui lòng kết nối ví Web3 để tiếp tục"
                      type="warning"
                      showIcon
                      style={{ marginBottom: '20px' }}
                    />
                  )}

                  {!web3Connected && (
                    <Form.Item style={{ marginBottom: '20px' }}>
                      <Button 
                        type="primary" 
                        size="large" 
                        block
                        loading={blockchainLoading}
                        onClick={connectWallet}
                        style={{
                          height: '50px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                        }}
                      >
                        <LinkOutlined /> Kết nối MetaMask
                      </Button>
                    </Form.Item>
                  )}

                  {web3Connected && (
                    <>
                      <Form.Item
                        label={<span style={{ fontWeight: 600, color: '#475569' }}>Chọn mạng blockchain</span>}
                        style={{ marginBottom: '20px' }}
                      >
                        <Select 
                          value={selectedNetwork}
                          onChange={switchNetwork}
                          style={{ borderRadius: '12px' }}
                        >
                          <Option value="ethereum">
                            <span>Ethereum Mainnet</span>
                          </Option>
                          <Option value="bsc">
                            <span>Binance Smart Chain (BNB)</span>
                          </Option>
                          <Option value="polygon">
                            <span>Polygon (MATIC)</span>
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ fontWeight: 600, color: '#475569' }}>Tổng tiền cần thanh toán</span>}
                        style={{ marginBottom: '20px' }}
                      >
                        <div style={{
                          padding: '16px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <Text strong style={{ fontSize: '18px', color: '#1e293b' }}>
                            ≈ {(cartTotal / 2000).toFixed(6)} {selectedNetwork === 'ethereum' ? 'ETH' : selectedNetwork === 'bsc' ? 'BNB' : 'MATIC'}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            (₫{cartTotal.toLocaleString()})
                          </Text>
                        </div>
                      </Form.Item>
                    </>
                  )}
                </>
              );
            }

            if (paymentMethod === 'creditCard') {
              return (
                <>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="cardNumber"
                        label="Số thẻ"
                        rules={[{ required: true, message: 'Vui lòng nhập số thẻ' }]}
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
                        label="Ngày hết hạn (MM/YY)"
                        rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn' }]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="cvv"
                        label="CVV"
                        rules={[{ required: true, message: 'Vui lòng nhập CVV' }]}
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
                        label="Tên chủ thẻ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ' }]}
                      >
                        <Input placeholder="Nguyễn Văn A" />
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
                  label="Ví điện tử/QR Code"
                  rules={[{ required: true, message: 'Vui lòng nhập thông tin ví điện tử' }]}
                >
                  <Input placeholder="name@upi" />
                </Form.Item>
              );
            }

            if (paymentMethod === 'netBanking') {
              return (
                <Form.Item
                  name="bank"
                  label="Chọn ngân hàng"
                  rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
                >
                  <Select placeholder="Chọn ngân hàng">
                    <Option value="sbi">Ngân hàng Nhà nước Ấn Độ</Option>
                    <Option value="hdfc">HDFC Bank</Option>
                    <Option value="icici">ICICI Bank</Option>
                    <Option value="axis">Axis Bank</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>

        <Form.Item name="savePaymentInfo" valuePropName="checked">
          <Checkbox>Lưu thông tin thanh toán cho lần mua sau</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={handlePrevStep}>
              Quay lại thông tin giao hàng
            </Button>
            <Button type="primary" htmlType="submit" size="large">
              Xem lại đơn hàng
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Blockchain Payment Modal */}
      <Modal
        title="Xác nhận giao dịch Blockchain"
        visible={blockchainPaymentModalVisible}
        footer={null}
        closable={false}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {txStatus === 'pending' && (
            <>
              <Spin size="large" style={{ marginBottom: '20px' }} />
              <Title level={4}>Đang xử lý giao dịch...</Title>
              <Text type="secondary">Vui lòng xác nhận trong ví của bạn</Text>
            </>
          )}
          
          {txStatus === 'success' && (
            <>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '20px' }} />
              <Title level={4}>Giao dịch thành công!</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '15px' }}>
                Hash: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </Text>
              <Text type="secondary">Đơn hàng của bạn đang được tạo...</Text>
            </>
          )}
          
          {txStatus === 'error' && (
            <>
              <div style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '20px' }}>❌</div>
              <Title level={4}>Giao dịch thất bại</Title>
              <Text type="secondary">Vui lòng thử lại</Text>
            </>
          )}
        </div>
      </Modal>
    </Card>
  );

  // Render order review
  const renderOrderReview = () => (
    <Card
      bordered={false}
      style={sectionCardStyle}
      bodyStyle={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.15)'
        }}>
          <FileTextOutlined style={{ fontSize: '28px', color: '#d97706' }} />
        </div>
        <Title level={2} style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Xem lại đơn hàng
        </Title>
        <Text style={{ fontSize: '18px', color: '#64748b', maxWidth: '400px', margin: '0 auto', display: 'block', lineHeight: 1.6 }}>
          Vui lòng kiểm tra lại thông tin trước khi đặt hàng
        </Text>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Shipping Info Card */}
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentOutlined style={{ color: '#4f46e5' }} /> Thông tin giao hàng
                </Title>
                <Button type="link" onClick={() => setCurrentStep(0)} style={{ color: '#4f46e5', fontWeight: 600 }}>Chỉnh sửa</Button>
              </div>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <UserOutlined style={{ color: '#94a3b8', marginTop: '4px' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Họ và tên</Text>
                        <Text strong style={{ color: '#1e293b' }}>{shippingData.fullName}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <MailOutlined style={{ color: '#94a3b8', marginTop: '4px' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Email</Text>
                        <Text strong style={{ color: '#1e293b' }}>{shippingData.email}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <PhoneOutlined style={{ color: '#94a3b8', marginTop: '4px' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Số điện thoại</Text>
                        <Text strong style={{ color: '#1e293b' }}>{shippingData.phone}</Text>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <HomeOutlined style={{ color: '#94a3b8', marginTop: '4px' }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Địa chỉ nhận hàng</Text>
                      <Text strong style={{ color: '#1e293b', lineHeight: 1.6, display: 'block' }}>
                        {shippingData.addressLine1}
                        {shippingData.addressLine2 && <><br />{shippingData.addressLine2}</>}
                        <br />
                        {shippingData.city}, {shippingData.state}
                        <br />
                        {shippingData.country} - {shippingData.pincode}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Payment Info Card */}
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCardOutlined style={{ color: '#10b981' }} /> Phương thức thanh toán
                </Title>
                <Button type="link" onClick={() => setCurrentStep(1)} style={{ color: '#4f46e5', fontWeight: 600 }}>Chỉnh sửa</Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'white', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                  color: '#10b981',
                  fontSize: '24px'
                }}>
                  {paymentData.paymentMethod === 'creditCard' && <CreditCardOutlined />}
                  {paymentData.paymentMethod === 'upi' && <MobileOutlined />}
                  {paymentData.paymentMethod === 'netBanking' && <BankOutlined />}
                  {paymentData.paymentMethod === 'cod' && <WalletOutlined />}
                  {paymentData.paymentMethod === 'blockchain' && <GatewayOutlined />}
                </div>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#1e293b', display: 'block' }}>
                    {paymentData.paymentMethod === 'creditCard' ? 'Thẻ tín dụng/Ghi nợ' :
                     paymentData.paymentMethod === 'upi' ? 'Ví điện tử/QR Code' :
                     paymentData.paymentMethod === 'netBanking' ? 'Ngân hàng trực tuyến' :
                     paymentData.paymentMethod === 'blockchain' ? 'Blockchain' : 'Thanh toán khi nhận hàng'}
                  </Text>
                  <Text type="secondary">
                    {paymentData.paymentMethod === 'creditCard' && `**** **** **** ${paymentData.cardNumber.slice(-4)}`}
                    {paymentData.paymentMethod === 'upi' && paymentData.upiId}
                    {paymentData.paymentMethod === 'netBanking' && (
                      paymentData.bank === 'sbi' ? 'Ngân hàng Nhà nước Ấn Độ' :
                      paymentData.bank === 'hdfc' ? 'HDFC Bank' :
                      paymentData.bank === 'icici' ? 'ICICI Bank' :
                      paymentData.bank === 'axis' ? 'Axis Bank' : 'Khác'
                    )}
                    {paymentData.paymentMethod === 'blockchain' && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (${selectedNetwork})`}
                    {paymentData.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
                  </Text>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ 
              background: 'white', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <Title level={4} style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingOutlined style={{ color: '#f59e0b' }} /> Sản phẩm ({cartItems.length})
                </Title>
              </div>
              <Table
                dataSource={cartItems}
                columns={orderSummaryColumns}
                pagination={false}
                rowKey="id"
                className="custom-table"
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '24px', 
              padding: '32px', 
              color: 'white',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)'
            }}>
              <Title level={3} style={{ color: 'white', margin: '0 0 24px' }}>Tóm tắt đơn hàng</Title>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <Text style={{ color: '#94a3b8' }}>Tạm tính</Text>
                  <Text style={{ color: 'white' }}>₫{cartTotal.toLocaleString()}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <Text style={{ color: '#94a3b8' }}>Phí vận chuyển</Text>
                  <Text style={{ color: '#4ade80' }}>Miễn phí</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <Text style={{ color: '#94a3b8' }}>Thuế (18%)</Text>
                  <Text style={{ color: 'white' }}>₫{(cartTotal * 0.18).toLocaleString()}</Text>
                </div>
              </div>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <Text style={{ fontSize: '16px', color: '#cbd5e1' }}>Tổng cộng</Text>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: '32px', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                    ₫{(cartTotal + cartTotal * 0.18).toLocaleString()}
                  </Text>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                style={{
                  height: '60px',
                  fontSize: '18px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  marginBottom: '16px'
                }}
                onClick={() => {
                  if (paymentData?.paymentMethod === 'blockchain') {
                    // Đã thanh toán blockchain, chỉ gọi khi có transactionHash
                    if (transactionHash) {
                      handlePlaceOrder(transactionHash);
                    } else {
                      message.warning('Vui lòng hoàn tất thanh toán blockchain trước khi đặt hàng.');
                    }
                  } else {
                    // Các phương thức khác
                    handlePlaceOrder();
                  }
                }}
              >
                Đặt hàng <ArrowRightOutlined />
              </Button>
              
              <Button
                type="text"
                block
                onClick={handlePrevStep}
                style={{ color: '#94a3b8' }}
              >
                Quay lại thanh toán
              </Button>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', color: '#64748b' }}>
              <SafetyCertificateOutlined style={{ fontSize: '20px' }} />
              <Text type="secondary">Bảo mật SSL an toàn</Text>
            </div>
          </div>
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
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a' }} />
        <Title level={2}>Đặt hàng thành công!</Title>
        <Paragraph>
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được đặt thành công.
        </Paragraph>
        <Paragraph>
          <strong>Mã đơn hàng:</strong> {orderId}
        </Paragraph>
        <Paragraph>
          Xác nhận đơn hàng đã được gửi tới {shippingData.email}.
        </Paragraph>
        {transactionHash && (
          <div style={{ 
            background: '#f0f9ff', 
            border: '2px solid #0ea5e9',
            borderRadius: '16px',
            padding: '24px',
            margin: '24px auto',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <GatewayOutlined style={{ fontSize: '24px', color: '#0ea5e9' }} />
              <Title level={4} style={{ margin: 0, color: '#0c4a6e' }}>
                Thông tin giao dịch Blockchain
              </Title>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <Text strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Mạng:
                </Text>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {selectedNetwork === 'ethereum' ? 'Ethereum Mainnet' :
                   selectedNetwork === 'bsc' ? 'Binance Smart Chain' :
                   selectedNetwork === 'polygon' ? 'Polygon (Matic)' : selectedNetwork}
                </Tag>
              </div>
              
              <div>
                <Text strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Transaction Hash:
                </Text>
                <Text 
                  copyable={{ text: transactionHash }}
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '13px',
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'inline-block',
                    wordBreak: 'break-all'
                  }}
                >
                  {transactionHash}
                </Text>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <Button 
                  type="primary"
                  icon={<LinkOutlined />}
                  href={getBlockchainExplorerUrl(selectedNetwork, transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                  }}
                >
                  Xem trên {getExplorerName(selectedNetwork)}
                </Button>
              </div>
            </div>
          </div>
        )}
        <Divider />
        <Space size="large">
          <Button type="primary" size="large" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </Button>
          <Button size="large" onClick={() => navigate('/orders')}>
            Xem đơn hàng của tôi
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
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "60px"
      }}
    >
      {/* Modern Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "60px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Row justify="space-between" align="middle" gutter={[24, 24]}>
            <Col xs={24} md={10}>
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
                Thanh toán <span style={{ color: "#818cf8" }}>an toàn</span>
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: "18px", marginTop: "12px", display: "block" }}>
                Hoàn tất đơn hàng của bạn chỉ với vài bước đơn giản. Hỗ trợ Blockchain.
              </Text>
            </Col>
            <Col xs={24} md={14}>
              <div style={{ 
                background: "rgba(255, 255, 255, 0.1)", 
                padding: "32px", 
                borderRadius: "24px", 
                backdropFilter: "blur(12px)", 
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              }}>
                <Steps
                  current={currentStep}
                  items={[
                    { title: <span style={{ color: 'white', fontWeight: 600 }}>Giao hàng</span>, icon: <HomeOutlined style={{ fontSize: '20px' }} /> },
                    { title: <span style={{ color: 'white', fontWeight: 600 }}>Thanh toán</span>, icon: <CreditCardOutlined style={{ fontSize: '20px' }} /> },
                    { title: <span style={{ color: 'white', fontWeight: 600 }}>Xem lại</span>, icon: <ShoppingOutlined style={{ fontSize: '20px' }} /> },
                    { title: <span style={{ color: 'white', fontWeight: 600 }}>Hoàn tất</span>, icon: <CheckCircleOutlined style={{ fontSize: '20px' }} /> },
                  ]}
                  className="checkout-steps"
                />
                <style>{`
                  .checkout-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: transparent !important;
                    border-color: #818cf8 !important;
                  }
                  .checkout-steps .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon {
                    color: #818cf8 !important;
                  }
                  .checkout-steps .ant-steps-item-finish .ant-steps-item-icon {
                    background: transparent !important;
                    border-color: #818cf8 !important;
                  }
                  .checkout-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
                    color: #818cf8 !important;
                  }
                  .checkout-steps .ant-steps-item-wait .ant-steps-item-icon {
                    background: transparent !important;
                    border-color: rgba(255,255,255,0.3) !important;
                  }
                  .checkout-steps .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
                    color: rgba(255,255,255,0.5) !important;
                  }
                  .checkout-steps .ant-steps-item-tail::after {
                    background-color: rgba(255,255,255,0.2) !important;
                  }
                  .checkout-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
                    background-color: #818cf8 !important;
                  }
                `}</style>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1000px',
          margin: '-40px auto 0',
          padding: '0 24px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {renderStepContent()}
      </div>
    </div>
  );
};

export default CheckoutPage;