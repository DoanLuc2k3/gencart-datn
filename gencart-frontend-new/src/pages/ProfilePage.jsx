import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Avatar,
  Form,
  Input,
  Button,
  Row,
  Col,
  Tabs,
  Upload,
  message,
  Spin,
  Space,
  Badge,
  Progress,
  Tooltip,
  Divider
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  LockOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  // Scroll to top when page loads
  useScrollToTop();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    avatar: null,
    addresses: [],
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch real user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          // Redirect to login if not authenticated
          message.error('Vui lòng đăng nhập để xem hồ sơ của bạn');
          navigate('/login');
          return;
        }

        // Fetch user data from API
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu hồ sơ');
        }

        const userData = await response.json();

        // Get default address if available
        let defaultAddress = null;
        if (userData.addresses && userData.addresses.length > 0) {
          defaultAddress = userData.addresses.find(addr => addr.default) || userData.addresses[0];
        }

        // Format user data for our component
        const formattedUserData = {
          id: userData.id,
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
          email: userData.email,
          phone: userData.phone_number || '',
          avatar_url: userData.avatar_url, // Use the avatar_url from the API
          addresses: userData.addresses || [],
          address: defaultAddress ? {
            line1: defaultAddress.street_address || '',
            line2: defaultAddress.apartment_address || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.zip_code || '',
            country: defaultAddress.country || ''
          } : {
            line1: '',
            line2: '',
            city: '',
            state: '',
            pincode: '',
            country: ''
          }
        };

        setUserData(formattedUserData);
        form.setFieldsValue({
          name: formattedUserData.name,
          email: formattedUserData.email,
          phone: formattedUserData.phone,
          addressLine1: formattedUserData.address.line1,
          addressLine2: formattedUserData.address.line2,
          city: formattedUserData.address.city,
          state: formattedUserData.address.state,
          pincode: formattedUserData.address.pincode,
          country: formattedUserData.address.country
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error('Không thể tải dữ liệu hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form, navigate]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Split name into first_name and last_name
      let firstName = '';
      let lastName = '';

      if (values.name) {
        const nameParts = values.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Update user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/${userData.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: values.email,
          phone_number: values.phone
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Không thể cập nhật hồ sơ');
      }

      // Check if user has an address
      let addressId = null;
      let addressMethod = 'POST';
      let addressUrl = `${API_BASE_URL}/addresses/`;

      // Get updated user data to check for addresses
      const userDataResponse = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userDataResponse.ok) {
        throw new Error('Không thể tải dữ liệu người dùng');
      }

      const currentUserData = await userDataResponse.json();

      if (currentUserData.addresses && currentUserData.addresses.length > 0) {
        // Update existing address
        addressId = currentUserData.addresses[0].id;
        addressMethod = 'PUT';
        addressUrl = `${API_BASE_URL}/addresses/${addressId}/`;
      }

      // Update or create address
      const addressResponse = await fetch(addressUrl, {
        method: addressMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_type: 'shipping',
          street_address: values.addressLine1,
          apartment_address: values.addressLine2,
          city: values.city,
          state: values.state,
          country: values.country,
          zip_code: values.pincode,
          default: true
        }),
      });

      if (!addressResponse.ok) {
        throw new Error('Không thể cập nhật địa chỉ');
      }

      // Refresh user data
      const updatedUserResponse = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!updatedUserResponse.ok) {
        throw new Error('Không thể tải dữ liệu người dùng');
      }

      const updatedUserData = await updatedUserResponse.json();

      // Get default address if available
      let defaultAddress = null;
      if (updatedUserData.addresses && updatedUserData.addresses.length > 0) {
        defaultAddress = updatedUserData.addresses.find(addr => addr.default) || updatedUserData.addresses[0];
      }

      // Format user data for our component
      const formattedUserData = {
        id: updatedUserData.id,
        name: `${updatedUserData.first_name} ${updatedUserData.last_name}`.trim() || updatedUserData.username,
        email: updatedUserData.email,
        phone: updatedUserData.phone_number || '',
        avatar: null,
        addresses: updatedUserData.addresses || [],
        address: defaultAddress ? {
          line1: defaultAddress.street_address || '',
          line2: defaultAddress.apartment_address || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.zip_code || '',
          country: defaultAddress.country || ''
        } : {
          line1: '',
          line2: '',
          city: '',
          state: '',
          pincode: '',
          country: ''
        }
      };

      setUserData(formattedUserData);
      setEditMode(false);
      message.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Change password
      const response = await fetch(`${API_BASE_URL}/users/${userData.id}/change_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: values.currentPassword,
          new_password: values.newPassword,
          confirm_password: values.confirmPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể đổi mật khẩu');
      }

      passwordForm.resetFields();
      message.success('Đổi mật khẩu thành công!');

      // Optionally, you can log the user out and redirect to login page
      // This is a good practice after password change
      const logoutAfterPasswordChange = window.confirm(
        'Mật khẩu của bạn đã được đổi thành công. Để đảm bảo an toàn, bạn có muốn đăng xuất và đăng nhập lại bằng mật khẩu mới không?'
      );

      if (logoutAfterPasswordChange) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        message.info('Vui lòng đăng nhập bằng mật khẩu mới của bạn');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    setUploadLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        message.error('Lỗi xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
        onError(new Error('Authentication error'));
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload avatar
      const response = await fetch(`${API_BASE_URL}/users/${userData.id}/upload_avatar/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Không thể tải ảnh đại diện lên');
      }

      const data = await response.json();

      // Update user data with new avatar URL
      setUserData({
        ...userData,
        avatar_url: data.avatar_url
      });

      message.success('Tải ảnh đại diện lên thành công!');
      onSuccess(data);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Không thể tải ảnh đại diện lên. Vui lòng thử lại.');
      onError(error);
    } finally {
      setUploadLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      userData.name,
      userData.email,
      userData.phone,
      userData.address.line1,
      userData.address.city,
      userData.address.state,
      userData.address.pincode,
      userData.avatar_url
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Render profile information in view mode
  const renderProfileInfo = () => (
    <div style={{ padding: '0' }}>
      {/* Profile Header */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Row gutter={[32, 32]} align="middle">
          {/* Avatar Section */}
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={handleAvatarUpload}
                beforeUpload={(file) => {
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng) {
                    message.error('Chỉ chấp nhận file JPG/PNG!');
                    return false;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error('Ảnh phải nhỏ hơn 2MB!');
                    return false;
                  }
                  return true;
                }}
              >
                {userData.avatar_url ? (
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      src={userData.avatar_url}
                      size={120}
                      style={{
                        border: '4px solid #f0f0f0',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        background: '#1677ff',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                      }}
                    >
                      <CameraOutlined style={{ color: 'white', fontSize: '12px' }} />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      border: '2px dashed #d9d9d9',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {uploadLoading ? (
                      <Spin />
                    ) : (
                      <>
                        <CameraOutlined style={{ fontSize: '24px', color: '#1677ff', marginBottom: '8px' }} />
                        <Text style={{ color: '#1677ff', fontSize: '12px' }}>
                          Tải ảnh lên
                        </Text>
                      </>
                    )}
                  </div>
                )}
              </Upload>
              
              {/* Profile Completion */}
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
                  Hoàn thiện hồ sơ
                </Text>
                <Progress
                  percent={calculateProfileCompletion()}
                  size="small"
                  strokeColor={{
                    '0%': '#1677ff',
                    '100%': '#52c41a',
                  }}
                />
              </div>
            </div>
          </Col>

          {/* User Info Section */}
          <Col xs={24} md={16}>
            <div>
              <Title level={2} style={{ marginBottom: '8px', color: '#262626' }}>
                {userData.name || 'Chào mừng!'}
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: '16px', display: 'block', marginBottom: '24px' }}>
                Quản lý thông tin cá nhân của bạn
              </Text>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ 
                    padding: '16px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e8e9ea'
                  }}>
                    <Space>
                      <MailOutlined style={{ color: '#1677ff' }} />
                      <div>
                        <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block' }}>Email</Text>
                        <Text style={{ fontSize: '14px', fontWeight: '500' }}>{userData.email}</Text>
                      </div>
                    </Space>
                  </div>
                </Col>
                
                <Col xs={24} sm={12}>
                  <div style={{ 
                    padding: '16px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e8e9ea'
                  }}>
                    <Space>
                      <PhoneOutlined style={{ color: '#1677ff' }} />
                      <div>
                        <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block' }}>Số điện thoại</Text>
                        <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                          {userData.phone || 'Chưa cập nhật số điện thoại'}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </Col>
              </Row>

              <div style={{ marginTop: '24px' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                  style={{
                    borderRadius: '8px',
                    height: '44px',
                    fontWeight: '600'
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Address Information */}
      <Card
        title={
          <Space>
            <HomeOutlined style={{ color: '#1677ff' }} />
            <span>Địa chỉ</span>
          </Space>
        }
        style={{
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
        headStyle={{
          borderBottom: '1px solid #f0f0f0',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        {userData.address.line1 ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong style={{ fontSize: '16px', display: 'block' }}>
                {userData.address.line1}
              </Text>
              {userData.address.line2 && (
                <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                  {userData.address.line2}
                </Text>
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text style={{ fontSize: '14px' }}>
                {userData.address.city}, {userData.address.state} {userData.address.pincode}
              </Text>
            </div>
            <div>
              <Space>
                <GlobalOutlined style={{ color: '#1677ff' }} />
                <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                  {userData.address.country}
                </Text>
              </Space>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Paragraph style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Chưa có thông tin địa chỉ. Nhấn "Chỉnh sửa hồ sơ" để thêm địa chỉ.
            </Paragraph>
          </div>
        )}
      </Card>
    </div>
  );

  // Render edit form
  const renderEditForm = () => (
    <div style={{ padding: '0' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          addressLine1: userData.address.line1,
          addressLine2: userData.address.line2,
          city: userData.address.city,
          state: userData.address.state,
          pincode: userData.address.pincode,
          country: userData.address.country
        }}
      >
        {/* Personal Information */}
        <Card 
          title="Thông tin cá nhân"
          style={{ 
            marginBottom: '24px', 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
          headStyle={{
            borderBottom: '1px solid #f0f0f0',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: '#1677ff' }} />} 
                  placeholder="Nguyễn Văn A"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#1677ff' }} />} 
                  placeholder="nguyenvana@example.com"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input 
                  prefix={<PhoneOutlined style={{ color: '#1677ff' }} />} 
                  placeholder="+84 123 456 789"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Address Information */}
        <Card 
          title="Địa chỉ"
          style={{ 
            marginBottom: '24px', 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
          headStyle={{
            borderBottom: '1px solid #f0f0f0',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="addressLine1"
                label="Địa chỉ 1"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input 
                  prefix={<HomeOutlined style={{ color: '#1677ff' }} />} 
                  placeholder="123 Đường Chính"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="addressLine2"
                label="Địa chỉ 2 (không bắt buộc)"
              >
                <Input 
                  placeholder="Tầng, căn hộ, v.v."
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="Thành phố"
                rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
              >
                <Input 
                  placeholder="Thành phố Hồ Chí Minh"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="Tỉnh/Bang"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/bang' }]}
              >
                <Input 
                  placeholder="Hà Nội"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="pincode"
                label="Mã bưu chính"
                rules={[{ required: true, message: 'Vui lòng nhập mã bưu chính' }]}
              >
                <Input 
                  placeholder="700000"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="country"
                label="Quốc gia"
                rules={[{ required: true, message: 'Vui lòng nhập quốc gia' }]}
              >
                <Input 
                  prefix={<GlobalOutlined style={{ color: '#1677ff' }} />}
                  placeholder="Việt Nam"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Space size="middle">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              style={{
                borderRadius: '8px',
                height: '44px',
                padding: '0 32px',
                fontWeight: '600'
              }}
            >
              Lưu thay đổi
            </Button>
            <Button
              onClick={() => setEditMode(false)}
              size="large"
              style={{
                borderRadius: '8px',
                height: '44px',
                padding: '0 32px'
              }}
            >
              Hủy
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );

  // Render password change form
  const renderPasswordForm = () => (
    <div style={{ padding: '0' }}>
      <Card
        title={
          <Space>
            <SafetyOutlined style={{ color: '#1677ff' }} />
            <span>Đổi mật khẩu</span>
          </Space>
        }
        style={{
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
        headStyle={{
          borderBottom: '1px solid #f0f0f0',
          fontSize: '16px',
          fontWeight: '600'
        }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          {/* Security Notice */}
          <div style={{ 
            background: '#fff7e6',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #ffe58f'
          }}>
            <Space>
              <LockOutlined style={{ color: '#d48806' }} />
              <div>
                <Text strong style={{ color: '#d48806', fontSize: '14px' }}>Thông báo bảo mật</Text>
                <Text style={{ display: 'block', color: '#d48806', fontSize: '12px' }}>
                  Để đảm bảo an toàn, vui lòng nhập mật khẩu hiện tại và chọn mật khẩu mới mạnh.
                </Text>
              </div>
            </Space>
          </div>

          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#1677ff' }} />}
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#1677ff' }} />}
                  placeholder="Nhập mật khẩu mới"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hai mật khẩu không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#1677ff' }} />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Password Requirements */}
          <div style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <Text strong style={{ color: '#52c41a', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Yêu cầu mật khẩu:
            </Text>
            <ul style={{ color: '#52c41a', margin: '0', paddingLeft: '20px' }}>
              <li style={{ fontSize: '12px', marginBottom: '4px' }}>Ít nhất 8 ký tự</li>
              <li style={{ fontSize: '12px', marginBottom: '4px' }}>Kết hợp chữ hoa và chữ thường</li>
              <li style={{ fontSize: '12px', marginBottom: '4px' }}>Ít nhất một số</li>
              <li style={{ fontSize: '12px' }}>Ít nhất một ký tự đặc biệt</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ textAlign: 'center' }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={loading}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  padding: '0 32px',
                  fontWeight: '600'
                }}
              >
                Cập nhật mật khẩu
              </Button>
              <Button
                onClick={() => passwordForm.resetFields()}
                size="large"
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  padding: '0 32px'
                }}
              >
                Đặt lại
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Gradient Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 24px 48px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '0',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            padding: '40px 20px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            maxWidth: '700px',
            margin: '0 auto',
            transform: 'translateY(10px)'
          }}>
            <Avatar 
              size={80} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: 'white', 
                color: '#667eea',
                marginBottom: '16px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }} 
            />
            <Title
              level={1}
              style={{
                color: 'white',
                marginBottom: 8,
                fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                textShadow: '0 4px 15px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px',
              }}
            >
              Hồ sơ cá nhân
            </Title>
            <Text style={{ 
              color: 'rgba(255,255,255,0.95)', 
              fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
              fontWeight: 500,
              display: 'block',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
            </Text>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Spin size="large" />
            <Title level={3} style={{ marginTop: '24px', color: '#8c8c8c' }}>
              Đang tải hồ sơ...
            </Title>
          </div>
        ) : (
          <Card
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              defaultActiveKey="profile"
              size="large"
              tabBarStyle={{
                marginBottom: '32px',
                borderBottom: '2px solid #f0f0f0'
              }}
            >
              <TabPane 
                tab={
                  <Space>
                    <UserOutlined />
                    Thông tin cá nhân
                  </Space>
                } 
                key="profile"
              >
                {editMode ? renderEditForm() : renderProfileInfo()}
              </TabPane>
              <TabPane 
                tab={
                  <Space>
                    <SafetyOutlined />
                    Bảo mật
                  </Space>
                } 
                key="security"
              >
                {renderPasswordForm()}
              </TabPane>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
