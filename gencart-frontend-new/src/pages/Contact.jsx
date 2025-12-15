import React, { useState } from "react";
import "../user-css/Contact.css"; // Đảm bảo đã import file CSS
import {
  Typography,
  Row,
  Col,
  Form,
  Input,
  Button,
  message,
  Alert,
} from "antd";

import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  MessageOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
  FacebookOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

const Contact = () => {
  // Using plain Vietnamese strings (i18n removed)

  const [form] = Form.useForm();
  const [sent, setSent] = useState(false);
  const [lastTicketId, setLastTicketId] = useState(null);

  // Extracted submit handler to preserve original functionality
  const handleSubmit = async (values) => {
    try {
      // Build ticket payload
      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const newTicket = {
        key: Date.now().toString(),
        id: `#${1000 + existingTickets.length + 1}`,
        title: values.subject || values.message.split('\n')[0] || `Liên hệ từ ${values.name}`,
        status: 'Mới',
        priority: 'TRUNG BÌNH',
        customer: values.name,
        assigned: 'Chưa gán',
        updated: Date.now(),
        source: 'Contact Form',
        SLA_due: Date.now() + 24 * 60 * 60 * 1000, // 1 day
        email: values.email,
        phone: values.phone,
        message: values.message
      };
      existingTickets.push(newTicket);
      localStorage.setItem('tickets', JSON.stringify(existingTickets));
      message.success('Gửi thông điệp thành công. Cảm ơn bạn!');
      form.resetFields();
      setLastTicketId(newTicket.id);
      setSent(true);
    } catch (e) {
      console.error('Contact form submit failed', e);
      message.error('Đã có lỗi xảy ra khi gửi. Vui lòng thử lại sau.');
    }
  };

  // Contact info and social links for the redesigned UI
  const contactInfo = [
    { 
      icon: MailOutlined, 
      label: 'Email hỗ trợ', 
      value: 'hello@company.com', 
      href: 'mailto:hello@company.com',
      description: 'Gửi email cho chúng tôi để được hỗ trợ nhanh chóng.',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    { 
      icon: PhoneOutlined, 
      label: 'Hotline', 
      value: '+1 (555) 123-4567', 
      href: 'tel:+15551234567',
      description: 'Gọi vào hotline để được hỗ trợ trực tiếp.',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    { 
      icon: EnvironmentOutlined, 
      label: 'Văn phòng chính', 
      value: '279 Mai Dang Chon, Hoa Quy, Da Nang City', 
      href: null,
      description: 'Địa chỉ văn phòng chính của chúng tôi.',
      color: '#f43f5e',
      bgColor: '#fff1f2'
    }
  ];

  const socialLinks = [
    { icon: FacebookOutlined, href: '#', label: 'Facebook', color: '#1877F2', shadow: 'rgba(24, 119, 242, 0.5)' },
    { icon: TwitterOutlined, href: '#', label: 'Twitter', color: '#1DA1F2', shadow: 'rgba(29, 161, 242, 0.5)' },
    { icon: LinkedinOutlined, href: '#', label: 'LinkedIn', color: '#0A66C2', shadow: 'rgba(10, 102, 194, 0.5)' },
    { icon: GithubOutlined, href: '#', label: 'Github', color: '#333333', shadow: 'rgba(51, 51, 51, 0.5)' },
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        <div className="contact-header">
          <Title level={1}>Liên hệ</Title>
          <Text className="contact-subtitle">Chúng tôi rất vui được hỗ trợ bạn. Vui lòng gửi câu hỏi hoặc góp ý.</Text>
        </div>

        <div className="contact-main-grid">
          <div className="contact-left-column">
            <div className="contact-card contact-form-card">
            <div className="form-header">
              <Title level={3}>Gửi tin nhắn</Title>
              <Text type="secondary">Gửi thắc mắc hoặc góp ý cho chúng tôi — chúng tôi sẽ phản hồi sớm nhất có thể.</Text>
            </div>
            {sent && (
              <Alert
                type="success"
                showIcon
                message="Đã gửi thành công"
                description={`Ticket ID: ${lastTicketId}. Cảm ơn bạn!`}
                closable
                onClose={() => setSent(false)}
                style={{ marginBottom: 16 }}
              />
            )}
            <Form form={form} layout="vertical" className="contact-form" onFinish={handleSubmit} requiredMark={false}>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item name="name" label={`Họ và tên`} rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                    <Input placeholder={`Nhập họ và tên`} prefix={<UserOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label={`Email`} rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input placeholder={`Nhập email`} prefix={<MailOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label={`Số điện thoại`} rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input placeholder={`Nhập số điện thoại`} prefix={<PhoneOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="subject" label={`Tiêu đề`} rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input placeholder={`Nhập tiêu đề`} prefix={<MessageOutlined className="input-icon" />} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="message" label={`Nội dung`} rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                <Input.TextArea autoSize={{ minRows: 6, maxRows: 15 }} placeholder={`Nhập nội dung của bạn...`} showCount maxLength={500} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" className="contact-submit-btn" icon={<SendOutlined />}>
                  Gửi
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="contact-card contact-social-card">
            <div className="social-header">
              <Title level={4}>Kết nối với chúng tôi</Title>
              <Text>Theo dõi các kênh mạng xã hội của chúng tôi để cập nhật tin tức và khuyến mãi.</Text>
            </div>
            <div className="contact-social-grid">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={index} 
                    href={social.href} 
                    className="social-link-item"
                    style={{ 
                      '--social-color': social.color,
                      '--social-shadow': social.shadow
                    }}
                  >
                    <div className="social-icon-wrapper">
                      <Icon />
                    </div>
                    <span className="social-name">{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

          <div className="contact-info-column">
            <div className="contact-card contact-info-card">
              <Title level={4}>Thông tin liên hệ</Title>
              <div className="space-y-6">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="contact-info-item">
                      <div 
                        className="contact-info-item-icon-wrapper"
                        style={{ color: item.color, backgroundColor: item.bgColor }}
                      >
                        <Icon className="anticon" />
                      </div>
                      <div className="contact-info-item-content">
                        <Text className="contact-label" style={{ color: item.color }}>{item.label}</Text>
                        {item.href ? (
                          <a href={item.href} className="contact-value">{item.value}</a>
                        ) : (
                          <p className="contact-value">{item.value}</p>
                        )}
                        <p className="contact-desc">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>



            <div className="contact-card contact-hours-card">
              <div className="hours-header">
                <div className="hours-icon-wrapper">
                  <ClockCircleOutlined />
                </div>
                <Title level={4}>Giờ làm việc</Title>
              </div>
              
              <div className="hours-list">
                <div className="hours-item">
                  <span className="day-label">Thứ Hai - Thứ Sáu</span>
                  <span className="time-badge open">09:00 - 18:00</span>
                </div>
                <div className="hours-item">
                  <span className="day-label">Thứ Bảy</span>
                  <span className="time-badge partial">10:00 - 16:00</span>
                </div>
                <div className="hours-item">
                  <span className="day-label">Chủ Nhật</span>
                  <span className="time-badge closed">Đóng cửa</span>
                </div>
              </div>

              <div className="hours-note">
                <CheckCircleOutlined />
                <span>Hỗ trợ trực tuyến 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-map-section">
          <div className="contact-map-wrapper">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9315079324944!2d105.81296347596015!3d21.036952280613947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab1dbf34b2bb%3A0x4c3d2c6b5d6a10c3!2zMjY2IMSQ4buZaSBD4bqlbiwgTGl4YSBHaWFpLCBCw6AgxJDhuqFpLCBIw6AgTuG7mWkgMTAwMDA!5e0!3m2!1svi!2s!4v1695200100123!5m2!1svi!2s"
              loading="lazy"
              className="contact-map-iframe"
              allowFullScreen
            />
            <div className="contact-map-overlay">
              <EnvironmentOutlined className="map-icon" />
              <div className="map-text">
                <h3>Trụ sở chính</h3>
                <p>279 Mai Dang Chon, Hoa Quy, Da Nang City</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
