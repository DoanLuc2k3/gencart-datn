import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import { Link } from "react-router-dom";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import "./Footer.css";

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter className="custom-footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="footer-brand">
              <Title level={3} className="brand-title">
                <ShoppingOutlined style={{ marginRight: "8px" }} />
                GenCart
              </Title>
              <Text className="brand-description">
                Điểm đến hàng đầu cho những sản phẩm chất lượng. Chúng tôi
                mang đến lựa chọn tinh tuyển, dịch vụ tận tâm và giá cả cạnh
                tranh.
              </Text>
              <div className="social-links">
                <Text
                  strong
                  style={{
                    display: "block",
                    marginBottom: "12px",
                    color: "#64748b",
                  }}
                >
                  Theo dõi chúng tôi
                </Text>
                <Space size="middle">
                  <Button
                    type="text"
                    icon={<FacebookOutlined />}
                    className="social-button facebook"
                    href="https://facebook.com"
                    target="_blank"
                  />
                  <Button
                    type="text"
                    icon={<TwitterOutlined />}
                    className="social-button twitter"
                    href="https://twitter.com"
                    target="_blank"
                  />
                  <Button
                    type="text"
                    icon={<InstagramOutlined />}
                    className="social-button instagram"
                    href="https://instagram.com"
                    target="_blank"
                  />
                  <Button
                    type="text"
                    icon={<LinkedinOutlined />}
                    className="social-button linkedin"
                    href="https://linkedin.com"
                    target="_blank"
                  />
                  <Button
                    type="text"
                    icon={<GithubOutlined />}
                    className="social-button github"
                    href="https://github.com"
                    target="_blank"
                  />
                </Space>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <div className="footer-section">
              <Title level={4} className="section-title">
                Liên kết nhanh
              </Title>
              <ul className="footer-links">
                <li>
                    <Link to="/" className="footer-link">
                    🏠 Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="footer-link">
                    🛍️ Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="footer-link">
                    🛒 Giỏ hàng
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="footer-link">
                    📦 Đơn hàng của tôi
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="footer-link">
                    👤 Tài khoản của tôi
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    ℹ️ Về chúng tôi
                  </Link>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8}>
            <div className="footer-section">
              <Title level={4} className="section-title">
                Thông tin liên hệ
              </Title>
              <div className="contact-info">
                <div className="contact-item">
                  <HomeOutlined className="contact-icon" />
                  <div>
                    <Text strong>Địa chỉ</Text>
                    <Text className="contact-text">
                      Ngũ Hành Sơn,
                    </Text>
                    <Text className="contact-text">Đà Nẵng, Việt Nam</Text>
                  </div>
                </div>
                <div className="contact-item">
                  <PhoneOutlined className="contact-icon" />
                  <div>
                    <Text strong>Điện thoại</Text>
                    <Text className="contact-text">+84 012387499201</Text>
                  </div>
                </div>
                <div className="contact-item">
                  <MailOutlined className="contact-icon" />
                  <div>
                    <Text strong>Email</Text>
                    <Text className="contact-text">lucdb.21it@vku.udn.vn</Text>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider className="footer-divider" />

        <Row className="footer-bottom">
          <Col xs={24} md={12}>
            <Text className="copyright">
              &copy; {new Date().getFullYear()} GenCart. Bảo lưu mọi quyền.
            </Text>
          </Col>
          <Col xs={24} md={12} className="footer-bottom-right">
            <Space split={<span style={{ color: "#64748b" }}>•</span>}>
              <Link to="/privacy" className="footer-bottom-link">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="footer-bottom-link">
                Điều khoản dịch vụ
              </Link>
              <Link to="/support" className="footer-bottom-link">
                Hỗ trợ
              </Link>
            </Space>
          </Col>
        </Row>

        <div className="footer-heart">
          <Text style={{ color: "#64748b", fontSize: "14px" }}>
            Được tạo bởi
            <HeartOutlined style={{ color: "#ff6b6b", margin: "0 6px" }} />
            Đội ngũ GenCart
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
