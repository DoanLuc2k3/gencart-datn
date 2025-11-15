import React from 'react';
import { Typography, Row, Col, Card, Space } from 'antd';
import { ShopOutlined, SafetyOutlined, CustomerServiceOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  // Scroll to top when page loads
  useScrollToTop();

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      paddingBottom: '60px'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center'
        }}>
          <Title level={1} style={{
            color: 'white',
            marginBottom: '16px',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '800',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
          }}>
            About GenCart
          </Title>
          
          <Paragraph style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.8',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            Welcome to GenCart, your premier destination for online shopping. We are dedicated to providing 
            a seamless shopping experience with a wide range of high-quality products at competitive prices.
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '-40px auto 0',
        padding: '0 24px',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Mission Section */}
        <Card style={{
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}>
          <div style={{ padding: '20px' }}>
            <Title level={2} style={{
              color: '#1e293b',
              marginBottom: '20px',
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Our Mission
            </Title>
            <Paragraph style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#475569',
            }}>
              At GenCart, our mission is to revolutionize the online shopping experience by offering a 
              user-friendly platform, exceptional customer service, and a diverse selection of products 
              that cater to all your needs.
            </Paragraph>
          </div>
        </Card>

        {/* Why Choose Us Section */}
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight: '700',
            color: '#1e293b',
          }}>
            Why Choose Us?
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '32px 24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                }}>
                  <ShopOutlined style={{ fontSize: '36px', color: 'white' }} />
                </div>
                <Title level={4} style={{ marginBottom: '12px', color: '#1e293b', fontWeight: '600' }}>
                  Wide Selection
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                  Browse through thousands of products across multiple categories to find exactly what you need.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '32px 24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}>
                  <SafetyOutlined style={{ fontSize: '36px', color: 'white' }} />
                </div>
                <Title level={4} style={{ marginBottom: '12px', color: '#1e293b', fontWeight: '600' }}>
                  Secure Shopping
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                  Shop with confidence knowing that your personal information and transactions are protected.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '32px 24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(249, 115, 22, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                }}>
                  <CustomerServiceOutlined style={{ fontSize: '36px', color: 'white' }} />
                </div>
                <Title level={4} style={{ marginBottom: '12px', color: '#1e293b', fontWeight: '600' }}>
                  Customer Support
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                  Our dedicated support team is always ready to assist you with any questions or concerns.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: '32px 24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}>
                  <GlobalOutlined style={{ fontSize: '36px', color: 'white' }} />
                </div>
                <Title level={4} style={{ marginBottom: '12px', color: '#1e293b', fontWeight: '600' }}>
                  Fast Delivery
                </Title>
                <Paragraph style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                  Enjoy quick and reliable delivery services to get your products right to your doorstep.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Contact Section */}
        <Card style={{
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}>
          <div style={{ padding: '20px' }}>
            <Title level={2} style={{
              marginBottom: '20px',
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Contact Us
            </Title>
            
            <Paragraph style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#475569',
              marginBottom: '32px',
            }}>
              We value your feedback and are always here to help. Feel free to reach out to us:
            </Paragraph>

            <Row gutter={[32, 24]}>
              <Col xs={24} md={8}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  }}>
                    <MailOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '16px', 
                      color: '#1e293b',
                      marginBottom: '4px',
                    }}>
                      Email
                    </Text>
                    <Text style={{ fontSize: '15px', color: '#64748b' }}>
                    lucdb.21it@vku.udn.vn
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  }}>
                    <PhoneOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '16px', 
                      color: '#1e293b',
                      marginBottom: '4px',
                    }}>
                      Phone
                    </Text>
                    <Text style={{ fontSize: '15px', color: '#64748b' }}>
                    +84 012387499201
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)',
                  }}>
                    <EnvironmentOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '16px', 
                      color: '#1e293b',
                      marginBottom: '4px',
                    }}>
                      Address
                    </Text>
                    <Text style={{ fontSize: '15px', color: '#64748b' }}>
                    Ngũ Hành Sơn, Đà Nẵng, Việt Nam
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
