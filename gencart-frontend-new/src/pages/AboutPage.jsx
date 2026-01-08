import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Button } from 'antd';
import { 
  ShopOutlined, 
  SafetyOutlined, 
  CustomerServiceOutlined, 
  GlobalOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  RocketOutlined,
  TeamOutlined,
  TrophyOutlined,
  SmileOutlined,
  SyncOutlined
} from '@ant-design/icons';
import useScrollToTop from '../hooks/useScrollToTop';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
  useScrollToTop();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: 'Người dùng hoạt động', value: '50K+', icon: <TeamOutlined /> },
    { label: 'Sản phẩm', value: '10K+', icon: <ShopOutlined /> },
    { label: 'Quốc gia', value: '25+', icon: <GlobalOutlined /> },
    { label: 'Hài lòng', value: '99%', icon: <SmileOutlined /> },
  ];

  return (
    <div className="about-page" style={{ overflowX: 'hidden' }}>
      {/* CSS Styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glass-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #fff;
        }
        .feature-icon-wrapper {
          transition: all 0.5s ease;
        }
        .glass-card:hover .feature-icon-wrapper {
          transform: scale(1.1) rotate(10deg);
        }
        .hero-text-enter {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
        }
        .floating-badge {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: default;
        }
        .floating-badge:hover {
          transform: scale(1.1) translateY(-5px) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          z-index: 20;
        }
      `}</style>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        overflow: 'hidden',
        padding: '60px 24px'
      }}>
        {/* Animated Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'linear-gradient(to right, #4f46e5, #818cf8)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4,
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(to right, #ec4899, #f472b6)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.3,
          animation: 'float-reverse 10s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', width: '100%' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className={`hero-text-enter ${mounted ? '' : ''}`}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '8px 16px', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '30px', 
                  marginBottom: '24px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Text style={{ color: '#818cf8', fontWeight: 600, letterSpacing: '1px' }}>🚀 XU HƯỚNG MUA SẮM THỜI TRANG MỚI</Text>
                </div>
                <Title style={{ 
                  color: 'white', 
                  fontSize: 'clamp(3rem, 6vw, 4.5rem)', 
                  fontWeight: 800, 
                  lineHeight: 1.1,
                  marginBottom: '24px',
                  background: 'linear-gradient(to right, #fff, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Dẫn đầu phong cách <br/>
                  <span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>Nền tảng thương mại điện tử hiện đại</span>
                </Title>
                <Paragraph style={{ 
                  color: '#94a3b8', 
                  fontSize: '1.25rem', 
                  marginBottom: '40px', 
                  maxWidth: '500px',
                  lineHeight: 1.8 
                }}>
                  Trải nghiệm sự kết hợp hoàn hảo giữa công nghệ và mua sắm trực tuyến. GenCart cung cấp đa dạng các mặt hàng chất lượng, mang đến trải nghiệm mua sắm nhanh chóng, tiện lợi và an toàn.
                </Paragraph>
                <Button type="primary" size="large" shape="round" icon={<RocketOutlined />} style={{ 
                  height: '56px', 
                  padding: '0 40px', 
                  fontSize: '18px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)'
                }}>
                  Khám phá ngay
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                padding: '40px',
                alignContent: 'center',
                justifyItems: 'center'
              }}>
                  {[
                    { icon: <GlobalOutlined />, title: 'Giao hàng toàn quốc', sub: 'Nhanh chóng', color: '#3b82f6' },
                    { icon: <SafetyOutlined />, title: 'An toàn tuyệt đối', sub: 'Đã kiểm chứng', color: '#10b981' },
                    { icon: <RocketOutlined />, title: 'Giao siêu tốc', sub: 'Đúng hẹn', color: '#6366f1' },
                    { icon: <CustomerServiceOutlined />, title: 'Hỗ trợ 24/7', sub: 'Tận tâm', color: '#f59e0b' },
                    { icon: <TrophyOutlined />, title: 'Lựa chọn số 1', sub: 'Chất lượng đảm bảo', color: '#ec4899' },
                    { icon: <SyncOutlined />, title: 'Đổi trả dễ dàng', sub: 'Linh hoạt', color: '#8b5cf6' },
                  ].map((badge, idx) => (
                    <div 
                      key={idx}
                      className="floating-badge"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        width: '100%',
                        maxWidth: '200px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ 
                        padding: '12px', 
                        background: badge.color, 
                        borderRadius: '12px', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {React.cloneElement(badge.icon, { style: { fontSize: '20px' } })}
                      </div>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '15px', lineHeight: 1.2, color: '#fff' }}>{badge.title}</Text>
                        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{badge.sub}</Text>
                      </div>
                    </div>
                  ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ background: '#fff', padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={12} md={6} key={index}>
                <div 
                  className="stat-card"
                  style={{ 
                    textAlign: 'center', 
                    height: '100%',
                    background: '#fff',
                    padding: '40px 20px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(79, 70, 229, 0.15)';
                    e.currentTarget.style.borderColor = '#818cf8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #4f46e5, #ec4899)'
                  }} />
                  
                  <div style={{ 
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 24px',
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    color: '#4f46e5'
                  }}>
                    {stat.icon}
                  </div>
                  
                  <Title level={2} style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '3rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {stat.value}
                  </Title>
                  <Text style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Mission Section */}
      <div style={{ padding: '100px 24px', background: '#fff', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[64, 48]} align="middle">
            <Col xs={24} md={12} order={1}>
               <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: -40,
                    left: -40,
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                    opacity: 0.2,
                    filter: 'blur(40px)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: -40,
                    right: -40,
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
                    opacity: 0.2,
                    filter: 'blur(40px)'
                  }} />
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Our Mission" 
                    style={{ 
                      width: '100%', 
                      borderRadius: '30px', 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                      transform: 'rotate(-2deg)',
                      border: '4px solid #fff'
                    }} 
                  />
               </div>
            </Col>
            <Col xs={24} md={12} order={2}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 20px', 
                background: 'linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%)', 
                borderRadius: '30px', 
                color: '#4338ca', 
                fontWeight: '700', 
                fontSize: '14px',
                letterSpacing: '1px',
                marginBottom: '24px',
                border: '1px solid #c7d2fe'
              }}>
                 SỨ MỆNH CỦA CHÚNG TÔI
              </div>
              <Title level={2} style={{ 
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', 
                marginBottom: '24px',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#1e293b'
              }}>
                Bứt phá mua sắm <br/>
                <span style={{ 
                  background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative'
                }}>
                 Xu hướng tiêu dùng mới
                  <svg style={{ position: 'absolute', bottom: -5, left: 0, width: '100%', height: '10px', zIndex: -1 }} viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.5" />
                  </svg>
                </span>
              </Title>
              <Paragraph style={{ fontSize: '1.2rem', color: '#64748b', lineHeight: 1.8, marginBottom: '40px' }}>
                Tại GenCart, chúng tôi tin rằng mua sắm không chỉ là giao dịch. Đó là hành trình khám phá những sản phẩm nâng tầm cuộc sống, được phục vụ tận tâm và tôn trọng thời gian của bạn.
              </Paragraph>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {[
                  { title: 'Chất lượng hàng đầu', desc: 'Chúng tôi luôn đặt chất lượng sản phẩm lên hàng đầu.' },
                  { title: 'Khách hàng là trung tâm', desc: 'Sự hài lòng của bạn là ưu tiên số một của chúng tôi.' },
                  { title: 'Đổi mới liên tục', desc: 'Không ngừng cải tiến để phục vụ bạn tốt hơn.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '16px', 
                      background: '#fff', 
                      color: '#4f46e5',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '800',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f5f9',
                      flexShrink: 0
                    }}>
                      0{idx + 1}
                    </div>
                    <div>
                      <Title level={4} style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b' }}>{item.title}</Title>
                      <Text style={{ color: '#64748b', fontSize: '15px' }}>{item.desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '100px 24px', background: '#f8fafc', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '8px 20px', 
              background: '#e0e7ff', 
              borderRadius: '30px', 
              color: '#4338ca', 
              fontWeight: '700', 
              fontSize: '14px',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
               TẠI SAO CHỌN CHÚNG TÔI
            </div>
            <Title level={2} style={{ fontSize: '3rem', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>
              Luôn nỗ lực vượt trội vì bạn
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Khám phá sự khác biệt khi mua sắm tại GenCart. Chúng tôi cam kết mang đến trải nghiệm xuất sắc từ đầu đến cuối.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {[
              { icon: <ShopOutlined />, title: 'Đa dạng sản phẩm', desc: 'Hàng nghìn sản phẩm thuộc nhiều danh mục.', color: '#4f46e5' },
              { icon: <SafetyOutlined />, title: 'Mua sắm an toàn', desc: 'Dữ liệu của bạn được bảo mật theo chuẩn doanh nghiệp.', color: '#10b981' },
              { icon: <CustomerServiceOutlined />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.', color: '#f59e0b' },
              { icon: <RocketOutlined />, title: 'Giao hàng nhanh', desc: 'Giao hàng nhanh chóng, đúng hẹn.', color: '#ec4899' },
            ].map((item, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <div 
                  className="feature-card"
                  style={{ 
                    height: '100%', 
                    background: '#fff',
                    padding: '40px 32px',
                    borderRadius: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'default',
                    border: '1px solid #f1f5f9',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = item.color;
                    // Find the background circle and expand it
                    const bgCircle = e.currentTarget.querySelector('.bg-circle');
                    if(bgCircle) {
                      bgCircle.style.transform = 'scale(20)';
                      bgCircle.style.opacity = '0.1';
                    }
                    // Change text color
                    const title = e.currentTarget.querySelector('.feature-title');
                    if(title) title.style.color = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    const bgCircle = e.currentTarget.querySelector('.bg-circle');
                    if(bgCircle) {
                      bgCircle.style.transform = 'scale(1)';
                      bgCircle.style.opacity = '1';
                    }
                    const title = e.currentTarget.querySelector('.feature-title');
                    if(title) title.style.color = '#1e293b';
                  }}
                >
                  {/* Animated Background Circle */}
                  <div className="bg-circle" style={{
                    position: 'absolute',
                    top: '40px',
                    left: '32px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: item.color,
                    opacity: '0.1',
                    zIndex: -1,
                    transition: 'all 0.6s ease'
                  }} />

                  <div className="feature-icon-wrapper" style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '20px',
                    background: item.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '32px',
                    boxShadow: `0 10px 20px ${item.color}66`
                  }}>
                    {item.icon}
                  </div>
                  <Title level={4} className="feature-title" style={{ marginBottom: '16px', fontSize: '1.5rem', transition: 'color 0.3s ease', color: '#1e293b' }}>{item.title}</Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{item.desc}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Contact Section */}
      <div style={{ padding: '100px 24px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 0% 0%, #f1f5f9 0%, transparent 50%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 100% 100%, #f1f5f9 0%, transparent 50%)', zIndex: 0 }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
             <div style={{ 
               display: 'inline-block', 
               padding: '8px 20px', 
               background: '#f0fdf4', 
               borderRadius: '30px', 
               color: '#16a34a', 
               fontWeight: '700', 
               fontSize: '14px',
               letterSpacing: '1px',
               marginBottom: '24px',
               border: '1px solid #bbf7d0'
             }}>
               LIÊN HỆ
             </div>
             <Title level={2} style={{ 
               fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', 
               margin: '0 0 24px 0', 
               color: '#1e293b',
               fontWeight: 800,
               lineHeight: 1.1
             }}>
               Bắt đầu cuộc <span style={{ color: '#4f46e5', position: 'relative', display: 'inline-block' }}>
                trò chuyện
                <svg style={{ position: 'absolute', bottom: '5px', left: 0, width: '100%', height: '12px', zIndex: -1 }} viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 50 12 100 6" stroke="#818cf8" strokeWidth="4" fill="none" opacity="0.3" />
                </svg>
               </span>
             </Title>
             <Paragraph style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
               Bạn có thắc mắc về sản phẩm hoặc dịch vụ của chúng tôi? Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 — hãy liên hệ bất cứ lúc nào.
             </Paragraph>
          </div>

          <Row gutter={[48, 48]}>
            {/* Contact Info Cards */}
            <Col xs={24} lg={10}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[
                    { icon: <MailOutlined />, title: 'Gửi Email', value: 'lucdb.21it@vku.udn.vn', sub: 'Chúng tôi trả lời trong vòng 2 giờ', color: '#ec4899' },
                    { icon: <PhoneOutlined />, title: 'Gọi điện', value: '+84 012387499201', sub: 'Thứ 2–Thứ 6, 9:00–18:00', color: '#8b5cf6' },
                    { icon: <EnvironmentOutlined />, title: 'Địa chỉ', value: 'Ngũ Hành Sơn, Đà Nẵng', sub: 'Xem trên Google Maps', color: '#10b981' }
                  ].map((item, idx) => (
                    <div key={idx} className="contact-card" style={{
                       background: '#fff',
                       padding: '32px',
                       borderRadius: '24px',
                       boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '24px',
                       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                       cursor: 'pointer',
                       border: '1px solid #f1f5f9',
                       position: 'relative',
                       overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = item.color;
                      const bg = e.currentTarget.querySelector('.card-bg');
                      if(bg) {
                        bg.style.opacity = '0.1';
                        bg.style.transform = 'scale(1.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      const bg = e.currentTarget.querySelector('.card-bg');
                      if(bg) {
                        bg.style.opacity = '0';
                        bg.style.transform = 'scale(1)';
                      }
                    }}
                    >
                       <div className="card-bg" style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(135deg, transparent 50%, ${item.color} 100%)`,
                          opacity: 0,
                          transition: 'all 0.5s ease',
                          zIndex: 0
                       }} />

                       <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '20px',
                          background: `${item.color}15`,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          flexShrink: 0,
                          zIndex: 1
                       }}>
                          {item.icon}
                       </div>
                       <div style={{ zIndex: 1 }}>
                          <Title level={5} style={{ margin: 0, marginBottom: '4px', color: '#1e293b', fontSize: '18px' }}>{item.title}</Title>
                          <Text strong style={{ display: 'block', fontSize: '16px', color: '#334155', marginBottom: '4px' }}>{item.value}</Text>
                          <Text type="secondary" style={{ fontSize: '14px' }}>{item.sub}</Text>
                       </div>
                    </div>
                  ))}
               </div>
            </Col>

            {/* Contact Form */}
            <Col xs={24} lg={14}>
               <div style={{
                  background: '#fff',
                  padding: '48px',
                  borderRadius: '32px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                  overflow: 'hidden'
               }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'linear-gradient(135deg, #4f46e5 0%, transparent 100%)', opacity: 0.03, borderRadius: '0 0 0 100%' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '150px', height: '150px', background: 'linear-gradient(45deg, #ec4899 0%, transparent 100%)', opacity: 0.03, borderRadius: '0 100% 0 0' }} />
                  
                  <Title level={3} style={{ marginBottom: '32px', color: '#1e293b', fontSize: '24px', fontWeight: 700 }}>Gửi tin nhắn cho chúng tôi</Title>
                  
                  <form onSubmit={(e) => e.preventDefault()}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '8px' }}><Text strong style={{ color: '#475569' }}>Tên của bạn</Text></div>
                          <input type="text" placeholder="Nguyễn Văn A" style={{
                             width: '100%',
                             padding: '16px 20px',
                             borderRadius: '16px',
                             border: '2px solid #f1f5f9',
                             background: '#f8fafc',
                             outline: 'none',
                             fontSize: '15px',
                             color: '#1e293b',
                             transition: 'all 0.3s ease'
                          }} 
                          onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#fff'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                          />
                       </Col>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: '8px' }}><Text strong style={{ color: '#475569' }}>Địa chỉ Email</Text></div>
                          <input type="email" placeholder="john@example.com" style={{
                             width: '100%',
                             padding: '16px 20px',
                             borderRadius: '16px',
                             border: '2px solid #f1f5f9',
                             background: '#f8fafc',
                             outline: 'none',
                             fontSize: '15px',
                             color: '#1e293b',
                             transition: 'all 0.3s ease'
                          }} 
                          onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#fff'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                          />
                       </Col>
                        <Col xs={24}>
                          <div style={{ marginBottom: '8px' }}><Text strong style={{ color: '#475569' }}>Chủ đề</Text></div>
                          <input type="text" placeholder="Bạn cần hỗ trợ gì?" style={{
                             width: '100%',
                             padding: '16px 20px',
                             borderRadius: '16px',
                             border: '2px solid #f1f5f9',
                             background: '#f8fafc',
                             outline: 'none',
                             fontSize: '15px',
                             color: '#1e293b',
                             transition: 'all 0.3s ease'
                          }} 
                          onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#fff'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                          />
                       </Col>
                        <Col xs={24}>
                          <div style={{ marginBottom: '8px' }}><Text strong style={{ color: '#475569' }}>Tin nhắn</Text></div>
                          <textarea rows={4} placeholder="Mô tả chi tiết yêu cầu của bạn..." style={{
                             width: '100%',
                             padding: '16px 20px',
                             borderRadius: '16px',
                             border: '2px solid #f1f5f9',
                             background: '#f8fafc',
                             outline: 'none',
                             resize: 'none',
                             fontSize: '15px',
                             color: '#1e293b',
                             fontFamily: 'inherit',
                             transition: 'all 0.3s ease'
                          }} 
                          onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.background = '#fff'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                          />
                       </Col>
                       <Col xs={24}>
                            <Button type="primary" size="large" block style={{
                             height: '56px',
                             background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                             border: 'none',
                             fontSize: '16px',
                             fontWeight: 700,
                             marginTop: '16px',
                             borderRadius: '16px',
                             boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                             transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(79, 70, 229, 0.5)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.4)'; }}
                            >
                              Gửi tin nhắn
                            </Button>
                       </Col>
                    </Row>
                  </form>
               </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
