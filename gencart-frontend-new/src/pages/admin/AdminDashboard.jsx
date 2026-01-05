import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Space,
  Typography,
  Flex,
  Tag,
  Table,
  Button,
  Row,
  Col,
  Tooltip,
  List,
  Avatar,
  Progress,
  Spin,
  Segmented,
  Select,
  Divider,
} from "antd";
import {
  LineChartOutlined,
  DollarOutlined,
  UserAddOutlined,
  ArrowUpOutlined,
  FireOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  CrownOutlined,
  UserOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useResponsive } from "../../hooks/useResponsive";

// Lazy load heavy chart component
const SentimentChart = lazy(() => import("../../components/admin/SentimentChart"));

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

const { Title: AntTitle, Text } = Typography;

const sentimentPalette = {
  positive: {
    gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    text: "#166534",
  },
  neutral: {
    gradient: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
    text: "#92400e",
  },
  negative: {
    gradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    text: "#991b1b",
  },
};

// --- Helper Functions ---

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatCurrencyDisplay = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatSpending = (amount) => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + ' Tỷ VNĐ';
  if (amount >= 1000000) return (amount / 1000000).toFixed(2) + ' Tr VNĐ';
  return amount.toLocaleString('vi-VN') + ' VNĐ';
};

// Compute a delta percentage comparing last 7 days vs previous 7 days for a sentiment key
const computeDeltaPercent = (trends, key) => {
  try {
    if (!Array.isArray(trends) || trends.length < 2) return 0;
    // assume trends is ordered chronologically
    const len = trends.length;
    const getRangeAvg = (start, end) => {
      const slice = trends.slice(start, end + 1);
      const sum = slice.reduce((acc, d) => (acc + (d[key] || 0)), 0);
      return sum / slice.length;
    };
    const lastRangeStart = Math.max(0, len - 7);
    const prevRangeStart = Math.max(0, len - 14);
    const lastAvg = getRangeAvg(lastRangeStart, len - 1);
    const prevAvg = getRangeAvg(prevRangeStart, lastRangeStart - 1);
    if (prevAvg === 0) return lastAvg === 0 ? 0 : 100;
    return Math.round(((lastAvg - prevAvg) / prevAvg) * 100);
  } catch { return 0; }
};

// Generate a tiny sparkline `path` string from trends data for a given sentiment key
const getSparklinePath = (trends, key, w = 100, h = 28) => {
  if (!Array.isArray(trends) || trends.length === 0) return "";
  const values = trends.map((d) => d[key] || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const dx = w / (values.length - 1 || 1);
  const scaleY = (v) => h - ((v - min) / (max - min || 1)) * h;
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i*dx} ${scaleY(v)}`).join(' ');
}

// --- Components ---
function StatCard({ title, value, bg, subtitle = "Tháng Trước", animationDelay = '0s' }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardStyle = {
    borderRadius: 24,
    background: bg,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: isHovered 
      ? "0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset" 
      : "0 10px 30px rgba(0,0,0,0.15)",
    height: '100%',
    minHeight: '180px',
    width: '100%',
    padding: '24px',
    opacity: 0,
    willChange: 'transform, opacity',
    animation: `revealAnimation 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${animationDelay} forwards`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    border: '1px solid rgba(255,255,255,0.15)',
  };

  return (
    <Card
      bordered={false}
      style={cardStyle}
      bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: isHovered ? 'scale(1.5)' : 'scale(1)',
        transition: 'transform 0.6s ease',
        pointerEvents: 'none',
      }} />
      
      {/* Animated corner accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
        borderRadius: '0 0 24px 0',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Header: Icon in floating badge */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Flex justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: isHovered 
              ? '0 12px 48px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.5) inset'
              : '0 8px 32px rgba(0,0,0,0.15), 0 0 0 2px rgba(255,255,255,0.4) inset',
            border: '3px solid rgba(255,255,255,0.4)',
            transform: isHovered ? 'rotate(8deg) scale(1.15)' : 'rotate(0deg) scale(1)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <div style={{ 
              fontSize: 32, 
              display: 'flex', 
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
              transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}>
              {title === 'Total Revenue' || title === 'Tổng Doanh Thu' ? '💰' 
                : title === 'Total Orders' || title === 'Tổng Đơn Hàng' ? '🛒'
                : title === 'New Customers' || title === 'Khách Hàng Mới' ? '👥'
                : title === 'Total Reviews' || title === 'TỔNG ĐÁNH GIÁ' || title === 'Tổng đánh giá' ? '⭐'
                : '🔥'}
            </div>
          </div>
          
          {/* Growth Badge */}
          <div style={{
            padding: '6px 12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.3s ease',
          }}>
            <ArrowUpOutlined style={{ 
              color: 'white', 
              fontSize: 10,
              fontWeight: 'bold',
            }} />
            <Text style={{ 
              color: 'white', 
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.3px',
            }}>
              {title === 'Total Revenue' || title === 'Tổng Doanh Thu' ? '12.5%'
                : title === 'Total Orders' || title === 'Tổng Đơn Hàng' ? '8.3%'
                : title === 'New Customers' || title === 'Khách Hàng Mới' ? '15.7%'
                : title === 'Total Reviews' || title === 'TỔNG ĐÁNH GIÁ' || title === 'Tổng đánh giá' ? '23.4%'
                : '18.9%'}
            </Text>
          </div>
        </Flex>
        
        <Text style={{ 
          color: 'rgba(255,255,255,0.95)', 
          fontWeight: 700, 
          fontSize: 12,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 12,
          textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          opacity: 0.9,
        }}>
          {title}
        </Text>
      </div>

      {/* Value with animation */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        position: 'relative',
        zIndex: 2,
        marginTop: 2,
        marginBottom: 2,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <AntTitle 
            level={1} 
            style={{ 
              margin: 0, 
              color: 'white', 
              fontWeight: 800, 
              fontSize: isHovered ? 44 : 40,
              lineHeight: 1,
              letterSpacing: '-1.2px',
              textShadow: '0 6px 24px rgba(0,0,0,0.3), 0 3px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {value}
          </AntTitle>
          <div style={{
            width: isHovered ? '50px' : '35px',
            height: '2.5px',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '2px',
            transition: 'all 0.4s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      {/* Footer with trend indicator */}
      <Flex justify="space-between" align="center" style={{ position: 'relative', zIndex: 2, marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '5px 12px',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '18px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 11, 
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              {subtitle}
            </Text>
          </div>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <ArrowUpOutlined style={{ 
              color: 'white', 
              fontSize: 11,
              animation: 'bounce 2s infinite',
              fontWeight: 'bold',
            }} />
          </div>
        </div>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
        }}>
          <MoreOutlined style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }} />
        </div>
      </Flex>
    </Card>
  );
}

function StatCardsWrapper({ children }) {
  return (
    <div style={{ position: 'relative', marginTop: '5px', marginBottom: '32px' }}>
      <div style={{
        border: '5px solid #ffffff', // Bold white border
        borderRadius: '24px',
        padding: '40px 24px 24px 24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)', // Shadow to make the white pop
      }}>
        {children}
      </div>
    </div>
  );
}

function MonthlyRevenueChart({ data }) {
  const labels = [
    "Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"
  ];

  const unit = '(K VNĐ)';

  const chartData = {
    labels,
    datasets: [
      {
        label: `Revenue ${unit}`,
        data: data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Card
      title ="Phân tích doanh thu"
      bordered={false}
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div style={{ height: '280px' }}>
        <Line options={options} data={chartData} />
      </div>
    </Card>
  );
}

function BestSellingProductsChart({ data, style, bodyStyle }) {
  const topProducts = data.slice(0, 5);
  const labels = topProducts.map(p => (p.title || 'Unknown').substring(0, 20));
  const salesData = topProducts.map(p => {
    if (p.totalRevenue !== undefined) {
      return Math.round(p.totalRevenue / 1000); // Convert to K VNĐ
    }
    return 0;
  });

  const backgroundColors = [
    'rgba(102, 126, 234, 0.85)',
    'rgba(118, 75, 162, 0.85)',
    'rgba(240, 101, 149, 0.85)',
    'rgba(255, 159, 64, 0.85)',
    'rgba(75, 192, 192, 0.85)',
  ];

  const borderColors = [
    'rgb(102, 126, 234)',
    'rgb(118, 75, 162)',
    'rgb(240, 101, 149)',
    'rgb(255, 159, 64)',
    'rgb(75, 192, 192)',
  ];

  const chartData = {
    labels: labels.length > 0 ? labels : ['No data'],
    datasets: [
      {
        label: 'Doanh thu (K VNĐ)',
        data: salesData.length > 0 ? salesData : [0],
        backgroundColor: backgroundColors.slice(0, salesData.length || 1),
        borderColor: borderColors.slice(0, salesData.length || 1),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: salesData.length === 1 ? 40 : undefined,
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            return ` ${value.toLocaleString('vi-VN')}K VNĐ`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString('vi-VN') + 'K';
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#333',
        }
      }
    },
  };

  return (
    <Card
      title={
        <Space style={{ whiteSpace: 'nowrap' }}>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          Hiệu suất sản phẩm
        </Space>
      }
      bordered={false}
      style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", ...style }}
      bodyStyle={bodyStyle}
    >
      <div style={{ height: '100%', minHeight: salesData.length <= 2 ? '150px' : '220px' }}>
        <Bar options={options} data={chartData} />
      </div>
      {salesData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          Không có đơn hàng gần đây
        </div>
      )}
    </Card>
  );
}

function TopCustomersRanking({ customers }) {
  const top3 = customers ? customers.slice(0, 3) : [];
  const rest = customers ? customers.slice(3) : [];

  const renderPodiumItem = (customer, rank) => {
    // If no customer for this rank, render a placeholder or nothing depending on context
    // But for the podium structure to hold, we usually need placeholders.
    // However, if we only have 1 customer, we might want to center them.
    if (!customer) return <div style={{ width: 80 }} key={rank} />;

    let color = '#d9d9d9'; // Silver
    let size = 54;
    let crownColor = '#d9d9d9';
    let zIndex = 1;
    let translateY = 0;
    let crownSize = 20;

    if (rank === 1) {
      color = '#ffc53d'; // Gold
      size = 74;
      crownColor = '#ffc53d';
      zIndex = 2;
      translateY = -15;
      crownSize = 28;
    } else if (rank === 3) {
      color = '#d48806'; // Bronze
      crownColor = '#d48806';
    }

    return (
      <div key={customer.id || rank} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        zIndex,
        transform: `translateY(${translateY}px)`,
        width: 100,
      }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
            <CrownOutlined style={{ 
                position: 'absolute', 
                top: -crownSize - 6, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                color: crownColor, 
                fontSize: crownSize,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} />
            <div style={{
                padding: 3,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
                <Avatar 
                    size={size} 
                    src={customer.image} 
                    icon={<UserOutlined />}
                    style={{ 
                        border: `3px solid ${color}`,
                    }} 
                />
            </div>
            <div style={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                background: color,
                color: '#fff',
                borderRadius: '12px',
                padding: '1px 10px',
                fontSize: 11,
                fontWeight: '800',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                border: '2px solid #fff'
            }}>
                #{rank}
            </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, width: '100%' }}>
            <Tooltip title={`${customer.firstName} ${customer.lastName}`}>
                <Typography.Text strong style={{ 
                    display: 'block', 
                    fontSize: rank === 1 ? 15 : 13, 
                    width: '100%', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    marginBottom: 2
                }}>
                    {customer.firstName} {customer.lastName}
                </Typography.Text>
            </Tooltip>
            <Typography.Text style={{ 
                fontSize: 12, 
                color: rank === 1 ? '#d48806' : '#8c8c8c',
                fontWeight: rank === 1 ? 700 : 500
            }}>
                {formatSpending(customer.totalSpending)}
            </Typography.Text>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            background: '#fff7e6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <TrophyOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Top Spending Customers</span>
        </Space>
      }
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        height: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{ 
        padding: '20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: rest.length === 0 ? 'center' : 'flex-start'
      }}
    >
      {/* Podium */}
      {top3.length > 0 ? (
        <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center', 
            marginTop: 30,
            marginBottom: rest.length > 0 ? 24 : 0, 
            gap: 8,
            paddingBottom: 10,
            borderBottom: rest.length > 0 ? '1px dashed #f0f0f0' : 'none',
            minHeight: rest.length === 0 ? 180 : 'auto'
        }}>
            {/* Rank 2 */}
            {top3.length >= 2 ? renderPodiumItem(top3[1], 2) : <div style={{ width: 80 }} />}
            {/* Rank 1 */}
            {renderPodiumItem(top3[0], 1)}
            {/* Rank 3 */}
            {top3.length >= 3 ? renderPodiumItem(top3[2], 3) : <div style={{ width: 80 }} />}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf' }}>
            <UserOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
            <div>Không có dữ liệu khách hàng</div>
        </div>
      )}

      {/* List for the rest */}
        {rest.length > 0 && (
        <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4, marginTop: 'auto' }}>
          {
            // Group the first two rest items into a framed box and render the remaining as a list
          }
          {rest.length > 0 && (
            <div className="top-spending-rest-group" style={{ marginBottom: 12 }}>
              {rest.slice(0, 2).map((item, idx) => (
                <div key={`rest-top-${idx}`} className="top-spending-rest-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  gap: 12,
                  borderRadius: 12,
                  background: 'transparent'
                }}>
                  <div className="rank-badge" style={{ marginRight: 4 }}>{idx + 4}</div>
                  <Avatar src={item.image} icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong ellipsis style={{ fontSize: 14, color: '#374151' }}>
                      {item.firstName} {item.lastName}
                    </Typography.Text>
                  </div>
                  <Typography.Text strong style={{ color: '#f59e0b', fontSize: 13 }}>
                    {formatSpending(item.totalSpending)}
                  </Typography.Text>
                </div>
              ))}
            </div>
          )}

          {rest.length > 2 && (
            <List
              itemLayout="horizontal"
              dataSource={rest.slice(2)}
              split={false}
              renderItem={(item, index) => (
                <List.Item style={{ 
                  padding: '12px', 
                  borderRadius: 12, 
                  marginBottom: 8, 
                  background: '#f9fafb',
                  transition: 'all 0.3s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: '#fff', 
                      border: '1px solid #e5e7eb',
                      color: '#6b7280', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      marginRight: 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {index + 6}
                    </div>
                    <Avatar src={item.image} icon={<UserOutlined />} size="small" style={{ marginRight: 12 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography.Text strong ellipsis style={{ fontSize: 14, color: '#374151' }}>
                        {item.firstName} {item.lastName}
                      </Typography.Text>
                    </div>
                    <Typography.Text strong style={{ color: '#f59e0b', fontSize: 13 }}>
                      {formatSpending(item.totalSpending)}
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
        )}
    </Card>
  );
}

function RecentOrdersTable({ orders }) {
  const navigate = useNavigate();
  const headerColumns = [
    "Sản phẩm",
    "Số lượng",
    "Giá",
    "Hành động",
  ];

  return (
    <Card
      title={
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <Space>
                <div style={{ 
                    width: 38, 
                    height: 38, 
                    borderRadius: 12, 
                    background: '#eff6ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #dbeafe'
                }}>
                    <ShoppingCartOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                </div>
                <span className="recent-orders-title" style={{ fontWeight: 700, fontSize: 16 }}>Đơn hàng gần đây</span>
            </Space>
            <Button type="link" size="small" style={{ fontWeight: 600 }} onClick={() => navigate('/admin/orders')}>Xem tất cả</Button>
        </Flex>
      }
      bordered={false}
      style={{
        borderRadius: 24,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
        height: '100%',
        overflow: 'hidden',
        border: '1px solid #f1f5f9'
      }}
      bodyStyle={{ padding: '0 24px 24px' }}
    >
      <div className="recent-orders-grid" style={{ marginTop: 8 }}>
        <div className="recent-orders-grid-head">
          {headerColumns.map((col, index) => (
            <span key={col} style={{ 
                textAlign: index === 0 ? 'left' : 'center'
            }}>{col}</span>
          ))}
        </div>
        <div className="recent-orders-grid-body">
          {orders.map((order, index) => (
            <div key={`${order.key || order.title}-${index}`} className="recent-orders-grid-row">
              <div className="col col-product">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: 16,
                        flexShrink: 0
                    }}>
                        {order.image ? <img src={order.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <AppstoreOutlined />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <Typography.Text strong style={{ display: 'block', fontSize: 13, color: '#334155', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.title || 'Không rõ'}
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            #{order.orderId ? order.orderId.toString().slice(-6) : '---'}
                        </Typography.Text>
                    </div>
                </div>
              </div>
              <div className="col col-quantity" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="qty-badge">{order.quantity}</div>
              </div>
              <div className="col col-price" style={{ textAlign: 'center' }}>
                <Typography.Text strong style={{ fontSize: 13, color: '#059669', whiteSpace: 'nowrap' }}>
                  {formatCurrencyDisplay(order.price)}
                </Typography.Text>
              </div>
              <div className="col col-action" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                    size="small"
                    type="text"
                    icon={<EyeOutlined />} 
                    style={{ 
                        color: '#64748b', 
                        fontSize: 12,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        height: 28,
                        padding: '0 8px'
                    }}
                  onClick={() => navigate(`/admin/orders?openId=${order.orderId || order.id}`)}
                >
                  Chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
        .recent-orders-grid {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        /* Use CSS variables so elements adapt to light/dark themes cleanly */
        :root {
          --recent-orders-title-color: #1e293b;
          --alerts-product-name-color: #1f2937;
          --product-performance-title-color: #111827;
        }
        .recent-orders-title {
          color: var(--recent-orders-title-color) !important;
          transition: color 180ms ease;
        }
        .alerts-product-name {
          color: var(--alerts-product-name-color) !important;
          font-weight: 600;
          font-size: 14px;
          display: inline-block;
        }
        .product-performance-title {
          color: var(--product-performance-title-color) !important;
          font-weight: 700;
          font-size: 16px;
          display: inline-block;
        }

        /* Dark-mode: set the variables to white for many common theme selectors */
        html[data-theme="dark"],
        body[data-theme="dark"],
        body.dark,
        .dark,
        .dark-mode,
        .theme-dark,
        .ant-theme-dark,
        .ant-layout.ant-layout-dark,
        .ant-card-dark {
          --recent-orders-title-color: #ffffff;
          --alerts-product-name-color: #ffffff;
          --product-performance-title-color: #ffffff;
        }
        .recent-orders-grid-head {
          display: grid;
          grid-template-columns: 30% 20% 25% 25%;
          gap: 8px;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 8px;
        }
        .recent-orders-grid-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .recent-orders-grid-row {
          display: grid;
          grid-template-columns: 30% 20% 25% 25%;
          gap: 8px;
          align-items: center;
          padding: 8px 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .recent-orders-grid-row:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .qty-badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #475569;
          font-weight: 600;
          font-size: 12px;
          border: 1px solid #e2e8f0;
        }
        `}
      </style>
    </Card>
  );
}

function GreetingCard() {
  const [hovered, setHovered] = useState(false);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  
  let greeting = "Good Morning";
  let icon = "☀️";
  let gradient = "linear-gradient(135deg, #fff 0%, #fff7ed 100%)"; // Warm morning
  let iconBg = "linear-gradient(135deg, #ffedd5 0%, #fff 100%)";
  let iconColor = "#f59e0b";

  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    icon = "🌤️";
    gradient = "linear-gradient(135deg, #fff 0%, #f0f9ff 100%)"; // Blue afternoon
    iconBg = "linear-gradient(135deg, #e0f2fe 0%, #fff 100%)";
    iconColor = "#0ea5e9";
  } else if (hour >= 17) {
    greeting = "Good Evening";
    icon = "🌙";
    gradient = "linear-gradient(135deg, #fff 0%, #f5f3ff 100%)"; // Purple evening
    iconBg = "linear-gradient(135deg, #ede9fe 0%, #fff 100%)";
    iconColor = "#8b5cf6";
  }

  return (
    <div 
      style={{
        background: gradient,
        borderRadius: '24px',
        padding: '32px 40px',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #fff',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 0,
        minHeight: '140px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Content */}
      <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ 
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
          border: '2px solid #fff',
          color: iconColor
        }}>
          <span style={{ animation: 'float 3s ease-in-out infinite' }}>{icon}</span>
        </div>
        <div>
          <Typography.Title level={2} style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {greeting}, Admin! <span style={{ display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%' }}>👋</span>
          </Typography.Title>
          <Typography.Text style={{ fontSize: '15px', fontWeight: 500, color: '#6b7280', display: 'block', marginTop: 6 }}>
            Here's what's happening with your store today.
          </Typography.Text>
        </div>
      </div>
      
      {/* Date Badge */}
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
         <div style={{ 
           padding: '10px 24px', 
           background: 'rgba(255,255,255,0.8)', 
           borderRadius: '100px', 
           border: '1px solid rgba(255,255,255,1)',
           backdropFilter: 'blur(12px)',
           boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
           display: 'flex',
           alignItems: 'center',
           gap: '8px',
           transition: 'transform 0.3s ease',
           transform: hovered ? 'translateY(-2px)' : 'translateY(0)'
         }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></div>
            <Typography.Text strong style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>
              {date}
            </Typography.Text>
         </div>
      </div>

      {/* Decorative Background Blobs */}
      <div style={{
        position: 'absolute',
        right: -20,
        top: -60,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

// --- Main Component ---

const AdminDashboard = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalReviews: 0,
    productsWithReviews: 0,
    recentOrders: [],
    allOrders: [], // Store all orders for charts
  });

  // New state for sentiment analysis
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [sentimentAlerts, setSentimentAlerts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [mode, setMode] = useState("global"); // 'global' | 'product'
  const [sentimentStats, setSentimentStats] = useState(null);
  const [chartMode, setChartMode] = useState("percent"); // 'percent' | 'counts'
  const [minDailyTotal, setMinDailyTotal] = useState(0);

  // Fetch sentiment data
  const loadSentimentData = useCallback(
    async (productId, targetMode) => {
      setSentimentLoading(true);
      const actualProductId = productId !== undefined ? productId : selectedProductId;
      const actualMode = targetMode !== undefined ? targetMode : mode;
      
      // Use the simplified, unauthenticated endpoints. Try port 8001, then 8000.
      const buildUrl = (port, path) => `http://localhost:${port}${path}`;
      const ports = [8001, 8000];
      const productQuery =
        actualMode === "product" && actualProductId ? `?product_id=${actualProductId}` : "";
      
      const statsPaths = ports.map((p) =>
        buildUrl(p, `/api/sentiment/statistics/${productQuery}`)
      );
      const trendsPaths = ports.map((p) =>
        buildUrl(
          p,
          `/api/sentiment/trends/?days=30&mode=analyzed${
            productQuery ? `&product_id=${actualProductId}` : ""
          }`
        )
      );

      const tryFetchJson = async (urls) => {
        for (const u of urls) {
          try {
            const r = await fetch(u);
            if (r.ok) return await r.json();
          } catch {
            // try next
          }
        }
        throw new Error(`All endpoints failed: ${urls.join(", ")}`);
      };

      try {
        // 1) Fetch statistics for summary cards
        const statsJson = await tryFetchJson(statsPaths);
        if (statsJson && statsJson.success) {
          const counts = statsJson.sentiment_counts || {
            positive: 0,
            neutral: 0,
            negative: 0,
          };
          const analyzed = statsJson.analyzed_reviews || 0;
          const total = analyzed > 0 ? analyzed : statsJson.total_reviews || 0;
          const pct = (v) =>
            total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
          setSentimentStats({
            counts,
            percents: {
              positive: pct(counts.positive || 0),
              neutral: pct(counts.neutral || 0),
              negative: pct(counts.negative || 0),
            },
            analyzed,
            total_reviews: statsJson.total_reviews || 0,
            unanalyzed_reviews: statsJson.unanalyzed_reviews || 0,
          });
        }

        // 2) Fetch trends for the 30-day distribution chart
        const trendsJson = await tryFetchJson(trendsPaths);
        if (trendsJson && trendsJson.success) {
          setSentimentTrends(trendsJson.data || []);
        } else {
          setSentimentTrends([]);
        }

        // 3) Alerts (optional)
        try {
          const alertUrls = ports.map((p) =>
            buildUrl(p, "/api/products/sentiment_alerts/?negative_percent=40")
          );
          const a = await tryFetchJson(alertUrls);
          setSentimentAlerts(a.alerts || []);
        } catch {
          // best-effort only
        }
      } catch (err) {
        console.warn("Sentiment load failed", err);
        setSentimentTrends([]);
      } finally {
        setSentimentLoading(false);
      }
    },
    [selectedProductId, mode]
  );

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const prodRes = await fetch(
        "http://localhost:8000/api/products/?no_pagination=true",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      let products = [];
      let productsTotalCount = 0;
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        products = prodData.results || prodData || [];
        productsTotalCount =
          typeof prodData?.count === "number"
            ? prodData.count
            : Array.isArray(prodData)
            ? prodData.length
            : Array.isArray(prodData?.results)
            ? prodData.results.length
            : products.length;
        setProductsList(products);
      }
      let users = [];
      let orders = [];
      let usersTotalCount = 0;
      let ordersTotalCount = 0;
      if (token) {
        const [userRes, orderRes] = await Promise.all([
          fetch("http://localhost:8000/api/users/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/orders/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          users = userData.results || userData || [];
          usersTotalCount =
            typeof userData?.count === "number"
              ? userData.count
              : Array.isArray(userData)
              ? userData.length
              : Array.isArray(userData?.results)
              ? userData.results.length
              : users.length;
        }
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          orders = orderData.results || orderData || [];
          ordersTotalCount =
            typeof orderData?.count === "number"
              ? orderData.count
              : Array.isArray(orderData)
              ? orderData.length
              : Array.isArray(orderData?.results)
              ? orderData.results.length
              : orders.length;
        }
      }
      const totalRevenue = orders.reduce(
        (s, o) => s + parseFloat(o.total_amount || 0),
        0
      );

      const totalReviews = products.reduce(
        (sum, p) => sum + (Number(p.total_reviews) || 0),
        0
      );

      setStats((s) => ({
        ...s,
        totalOrders: ordersTotalCount,
        totalUsers: usersTotalCount,
        totalProducts: productsTotalCount,
        totalRevenue,
        totalReviews,
        recentOrders: orders.slice(0, 5),
        allOrders: orders,
      }));

      // Fetch sentiment overview
      try {
        const gRes = await fetch(
          "http://localhost:8000/api/products/sentiment_overview/"
        );
        if (gRes.ok) {
          const overviewData = await gRes.json();
          if (overviewData.products_with_reviews !== undefined) {
            setStats((s) => ({
              ...s,
              productsWithReviews: overviewData.products_with_reviews,
            }));
          }
        }
      } catch (err) {
        console.warn("Global sentiment fetch failed", err);
      }

      let withReviews = products.find((p) => (p.total_reviews || 0) > 0);
      if (withReviews && !selectedProductId) setSelectedProductId(withReviews.id);
      
      // Load sentiment data
      loadSentimentData(withReviews ? withReviews.id : null, "global");

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [loadSentimentData]);

  useEffect(() => {
    fetchDashboardStats();
    loadSentimentData();
  }, [fetchDashboardStats, loadSentimentData]);

  // --- Calculations for Charts ---

  const monthlyRevenue = useMemo(() => {
    const revenue = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    stats.allOrders.forEach(order => {
      const createdAt = order.created_at;
      if (createdAt) {
        const date = new Date(createdAt);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          const total = parseFloat(order.total_amount || 0);
          revenue[month] += total;
        }
      }
    });
    return revenue.map(v => Math.round(v / 1000));
  }, [stats.allOrders]);

  const productSales = useMemo(() => {
    const sales = new Map();
    stats.allOrders.forEach(order => {
      const items = order.items || [];
      items.forEach(item => {
        // item.product might be an object or ID depending on serializer
        const product = item.product || {};
        const productId = product.id || item.product_id || 'unknown';
        const title = product.name || item.title || 'Sản phẩm không rõ';
        
        if (!sales.has(productId)) {
          sales.set(productId, {
            id: productId,
            title: title,
            totalRevenue: 0,
          });
        }
        const p = sales.get(productId);
        const qty = item.quantity || 1;
        const price = parseFloat(item.price || 0);
        p.totalRevenue += qty * price;
      });
    });
    return Array.from(sales.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [stats.allOrders]);

  const topCustomers = useMemo(() => {
    const customerMap = new Map();
    stats.allOrders.forEach(order => {
      const user = order.user || {};
      const email = user.email || user.username || 'Guest';
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: user.id || email,
          firstName: user.first_name || user.username || 'Guest',
          lastName: user.last_name || '',
          email: email,
          image: null, // Add avatar if available
          totalSpending: 0,
        });
      }
      const c = customerMap.get(email);
      c.totalSpending += parseFloat(order.total_amount || 0);
    });
    
    let results = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpending - a.totalSpending);

    // --- MOCK DATA FOR DEMO (If less than 3 customers) ---
    // Tự động thêm dữ liệu giả để hiển thị đẹp mắt nếu chưa đủ khách hàng
    if (results.length < 3) {
      const baseSpending = results.length > 0 ? results[0].totalSpending : 15000000;
      
      const mockData = [
        {
          id: 'mock-2',
          firstName: 'Sarah',
          lastName: 'Nguyen',
          email: 'sarah.n@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          totalSpending: baseSpending * 0.85
        },
        {
          id: 'mock-3',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          totalSpending: baseSpending * 0.65
        },
        {
          id: 'mock-4',
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma.w@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          totalSpending: baseSpending * 0.45
        },
        {
          id: 'mock-5',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.b@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          totalSpending: baseSpending * 0.3
        }
      ];
      
      // Thêm mock data vào và sắp xếp lại
      results = [...results, ...mockData];
      results.sort((a, b) => b.totalSpending - a.totalSpending);
    }

    return results.slice(0, 5);
  }, [stats.allOrders]);

  const recentOrdersData = useMemo(() => {
    const items = [];
    stats.recentOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (items.length < 5) {
          items.push({
            key: `${order.id}-${item.id}`,
            title: item.product?.name || 'Không rõ',
            quantity: item.quantity,
            price: parseFloat(item.price || 0),
            image: item.product?.primary_image || item.product?.image_url || null,
            orderId: order.id,
          });
        }
      });
    });
    return items;
  }, [stats.recentOrders]);

  const topProductTitle = productSales.length > 0 ? productSales[0].title : "No data";

  const totalReviewsCount = sentimentStats
    ? sentimentStats.total_reviews || sentimentStats.analyzed || 0
    : 0;
  const analyzedPercentage = sentimentStats
    ? totalReviewsCount > 0
      ? Math.round((sentimentStats.analyzed / totalReviewsCount) * 100)
      : sentimentStats.analyzed > 0
      ? 100
      : 0
    : 0;
  const outstandingReviews =
    sentimentStats?.unanalyzed_reviews ??
    (sentimentStats
      ? Math.max(totalReviewsCount - sentimentStats.analyzed, 0)
      : 0);

  const handleModeChange = async (value) => {
    setMode(value);
    // reload sentiment data for new mode
    await loadSentimentData(undefined, value);
    // if switching to product and a product already selected, load product-specific data
    if (value === "product" && selectedProductId) {
      await loadSentimentData(selectedProductId, "product");
    }
  };

  const handleProductChange = async (value) => {
    setSelectedProductId(value);
    if (mode === "product") await loadSentimentData(value, "product");
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space
      direction="vertical"
      size={24}
      style={{
        width: "100%",
        padding: "0 24px 24px 24px",
        background: "#f5f7fa",
        borderRadius: "12px",
      }}
    >
      {/* --- STATISTIC CARDS --- */}
      <StatCardsWrapper>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'flex', width: '100%' }}>
            <StatCard
              title="Tổng Doanh Thu"
              value={formatCurrencyDisplay(stats.totalRevenue)}
              icon={<DollarOutlined />}
              bg="linear-gradient(135deg, #1e9d72, #b89229ff)"
              subtitle="Tháng Trước"
              animationDelay="0.1s"
            />
          </div>

          <div style={{ display: 'flex', width: '100%' }}>
            <StatCard
              title="Tổng Đơn Hàng"
              value="277"
              icon={<ShoppingCartOutlined />}
              bg="linear-gradient(135deg, #c01313ff, #231f1fff)"
              subtitle="Tháng Trước"
              animationDelay="0.2s"
            />
          </div>

          <div style={{ display: 'flex', width: '100%' }}>
            <StatCard
              title="Khách Hàng Mới"
              value={stats.totalUsers}
              icon={<UserAddOutlined />}
              bg="linear-gradient(135deg, #043746ff, #3b74e1)"
              subtitle="Tháng Trước"
              animationDelay="0.3s"
            />
          </div>

          <div style={{ display: 'flex', width: '100%' }}>
            <StatCard
              title="Bán Chạy Nhất"
              value={topProductTitle.substring(0, 15) + (topProductTitle.length > 15 ? '...' : '')}
              icon={<FireOutlined />}
              bg="linear-gradient(135deg, #e39d37, #cf0e92ff)"
              subtitle="Tháng Trước"
              animationDelay="0.4s"
            />
          </div>
        </div>
      </StatCardsWrapper>

      {/* --- CHARTS & RANKING LIST --- */}
      <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
        <Col xs={24} sm={24} md={14} lg={14} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            <GreetingCard />
            <MonthlyRevenueChart data={monthlyRevenue} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <BestSellingProductsChart 
                    data={productSales} 
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }} 
                    bodyStyle={{ flex: 1, position: 'relative' }} 
                />
            </div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={10} lg={10} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            <TopCustomersRanking customers={topCustomers} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <RecentOrdersTable orders={recentOrdersData} />
            </div>
          </div>
        </Col>
      </Row>

      {/* --- SENTIMENT ANALYSIS SECTION --- */}
      <Card
        title={
          <Space style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
            <span style={{ fontSize: 28 }}>📊</span>
            Phân tích cảm xúc
          </Space>
        }
        bordered={false}
        style={{
          borderRadius: isMobile ? 16 : 24,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          marginTop: 24,
          border: "2px solid rgba(99, 102, 241, 0.1)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: isMobile ? 16 : 32 }}
        extra={
          <Space wrap size={isMobile ? 10 : 14}>
            <Segmented
              size={isMobile ? "small" : "middle"}
              value={mode}
              onChange={handleModeChange}
              options={[
                { label: isMobile ? "All" : "Overview", value: "global" },
                { label: isMobile ? "Prod" : "By Product", value: "product" },
              ]}
              style={{ background: "#f0f2f5", padding: "2px" }}
            />
            {mode === "global" ? (
              <>
                <Segmented
                  size="middle"
                  value={chartMode}
                  onChange={(value) => setChartMode(value)}
                  options={[
                    { label: "% mỗi ngày", value: "percent" },
                    { label: "Số lượng", value: "counts" },
                  ]}
                  style={{ background: "#f0f2f5", padding: "2px" }}
                />
                <Segmented
                  size="middle"
                  value={String(minDailyTotal)}
                  onChange={(value) => setMinDailyTotal(Number(value))}
                  options={[
                    { label: "Tất cả", value: "0" },
                    { label: "≥1", value: "1" },
                    { label: "≥3", value: "3" },
                    { label: "≥5", value: "5" },
                  ]}
                  style={{ background: "#f0f2f5", padding: "2px" }}
                />
              </>
            ) : (
              <Select
                placeholder="Chọn sản phẩm"
                value={selectedProductId}
                onChange={handleProductChange}
                style={{ minWidth: 240 }}
                showSearch
                optionFilterProp="label"
                options={productsList.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.total_reviews || 0})`,
                }))}
              />
            )}
          </Space>
        }
      >
        {sentimentLoading ? (
           <div style={{ textAlign: 'center', padding: '40px' }}>
             <Spin tip="Đang tải dữ liệu phân tích..." />
           </div>
        ) : (
          <>
            {sentimentStats && (
              <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {["positive", "neutral", "negative"].map((key) => {
                  const icons = {
                    positive: "😊",
                    neutral: "😐",
                    negative: "😞"
                  };
                  const delta = computeDeltaPercent(sentimentTrends, key);
                  const sparkPath = getSparklinePath(sentimentTrends, key, 120, 28);
                  const up = delta > 0;
                  const deltaLabel = `${Math.abs(delta)}%`;
                  const percentValue = Number(sentimentStats.percents[key] || 0);
                  const markerLeft = `${Math.max(2, Math.min(98, percentValue))}%`;
                  const borderColors = {
                    positive: "rgba(34, 197, 94, 0.3)",
                    neutral: "rgba(217, 119, 6, 0.3)",
                    negative: "rgba(239, 68, 68, 0.3)"
                  };
                  return (
                    <Col xs={24} sm={8} key={key}>
                      <div
                        className={`sentiment-card sentiment-card--${key}`}
                        tabIndex={0}
                        role="region"
                        aria-label={`${key === 'positive' ? 'Tích cực' : key === 'neutral' ? 'Trung tính' : 'Tiêu cực'} - tóm tắt phản hồi`}
                        style={{
                          borderRadius: 20,
                          padding: 28,
                          background: sentimentPalette[key].gradient,
                          color: sentimentPalette[key].text,
                          boxShadow: `0 12px 32px ${key === "positive" ? "rgba(34, 197, 94, 0.15)" : key === "neutral" ? "rgba(217, 119, 6, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                          border: `2px solid ${borderColors[key]}`,
                          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                          e.currentTarget.style.boxShadow = `0 20px 40px ${key === "positive" ? "rgba(34, 197, 94, 0.25)" : key === "neutral" ? "rgba(217, 119, 6, 0.25)" : "rgba(239, 68, 68, 0.25)"}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow = `0 12px 32px ${key === "positive" ? "rgba(34, 197, 94, 0.15)" : key === "neutral" ? "rgba(217, 119, 6, 0.15)" : "rgba(239, 68, 68, 0.15)"}`;
                        }}
                      >
                        {key === 'positive' && <div className="sentiment-card__shimmer" />}
                                <div style={{ position: "relative", zIndex: 1 }}>
                                  {/* trend delta badge */}
                                  <div className={`sentiment-delta ${up ? 'up' : (delta < 0 ? 'down' : 'flat')}`} style={{ position: 'absolute', right: 14, top: 12, zIndex: 4 }}>
                                    {up ? (<ArrowUpOutlined style={{ fontSize: 12 }} />) : delta < 0 ? (<ArrowDownOutlined style={{ fontSize: 12 }} />) : (<span style={{ fontSize: 10, opacity: 0.9 }}>~</span>)}
                                    <span style={{ fontWeight: 700, marginLeft: 6, fontSize: 12 }}>{deltaLabel}</span>
                                  </div>
                                  <div
                                    className={`sentiment-emoji sentiment-emoji--${key} ${delta >= 15 ? 'pulse' : ''}`}
                                    style={{ marginBottom: 12 }}
                                    title={key === 'positive' ? 'Tích cực' : key === 'neutral' ? 'Trung tính' : 'Tiêu cực'}
                                    role="img"
                                    aria-label={`${key === 'positive' ? 'Tích cực' : key === 'neutral' ? 'Trung tính' : 'Tiêu cực'} emoji cảm xúc`}
                                  >
                                    <span style={{ fontSize: 36 }}>{icons[key]}</span>
                                  </div>
                          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, marginBottom: 12, letterSpacing: "0.5px" }}>
                            {key === "positive"
                              ? "PHẢN HỒI TÍCH CỰC"
                              : key === "neutral"
                              ? "PHẢN HỒI TRUNG TÍNH"
                              : "PHẢN HỒI TIÊU CỰC"}
                          </div>
                          <div className="sentiment-count" style={{ fontSize: 44, fontWeight: 800, marginBottom: 10, lineHeight: 1 }}>
                            {formatNumber(sentimentStats.counts[key] || 0)}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 12 }}>
                            {sentimentStats.percents[key]}% trong tổng đánh giá
                          </div>
                          <div style={{ marginTop: 6, position: 'relative' }}>
                            <Progress
                              percent={Number(sentimentStats.percents[key] || 0)}
                              strokeLinecap="round"
                              showInfo={false}
                              strokeWidth={8}
                              strokeColor={key === 'positive' ? '#10b981' : key === 'neutral' ? '#f59e0b' : '#ef4444'}
                              aria-valuenow={Number(sentimentStats.percents[key] || 0)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              role="progressbar"
                              aria-label={`${key} sentiment percent`}
                            />
                            <div
                              className="progress-marker"
                              style={{ left: markerLeft, position: 'absolute', bottom: 4, borderColor: key === 'positive' ? '#10b981' : key === 'neutral' ? '#f59e0b' : '#ef4444' }}
                              aria-hidden="true"
                            />
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                            Đã phân tích: {formatNumber(sentimentStats.analyzed || 0)} / {formatNumber(sentimentStats.total_reviews || 0)}
                          </div>
                          {/* sparkline */}
                          <div style={{ position: 'absolute', right: 20, bottom: 18, zIndex: 3 }}>
                            <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path className="sparkline-path" d={sparkPath} stroke={key==='positive' ? '#059669' : key==='neutral' ? '#d97706' : '#ef4444'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"></path>
                              <circle cx="108" cy="14" r="3.6" fill={key==='positive' ? '#059669' : key==='neutral' ? '#d97706' : '#ef4444'} opacity="0.9" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}

            {sentimentStats && (
              <div
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #f0f4ff 0%, #f9f5ff 100%)",
                  padding: 32,
                  marginBottom: 32,
                  border: "2px solid rgba(99, 102, 241, 0.15)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Row gutter={[28, 28]} align="middle">
                  <Col xs={24} md={16}>
                    <div style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 15, fontWeight: 700, color: "#4f46e5", letterSpacing: "0.5px" }}>
                        📈 TIẾN ĐỘ PHÂN TÍCH ĐÁNH GIÁ
                      </Text>
                    </div>
                    <Progress
                      percent={analyzedPercentage}
                      strokeColor={{ '0%': '#6366f1', '100%': '#8b5cf6' }}
                      strokeWidth={8}
                      style={{ marginBottom: 18 }}
                      format={(percent) => (
                        <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: 14 }}>
                          {percent}% Hoàn thành
                        </span>
                      )}
                    />
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      <span style={{ color: '#4f46e5', fontWeight: 700 }}>{formatNumber(sentimentStats.analyzed)}</span> trong tổng 
                      <span style={{ color: '#4f46e5', fontWeight: 700 }}>{formatNumber(stats.totalReviews || totalReviewsCount)}</span> đánh giá đã được xử lý
                    </Text>
                  </Col>
                  <Col xs={24} md={8}>
                    <div style={{
                      textAlign: 'center',
                      padding: '28px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                      borderRadius: '16px',
                      border: '2px solid rgba(99, 102, 241, 0.2)',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 12, letterSpacing: "0.5px" }}>
                        TỔNG ĐÁNH GIÁ
                      </Text>
                      <Text style={{ fontSize: 48, fontWeight: 800, color: '#4f46e5', display: 'block', lineHeight: 1, marginBottom: 12 }}>
                        {formatNumber(totalReviewsCount)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, display: 'block' }}>
                        {formatNumber(outstandingReviews)} chưa xử lý
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {sentimentTrends &&
              sentimentTrends.dates &&
              sentimentTrends.dates.length > 0 && (
                <div
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(99, 102, 241, 0.1)",
                    padding: 20,
                    background: "rgba(99, 102, 241, 0.02)",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.06)",
                  }}
                >
                  {(() => {
                    const dates = sentimentTrends.dates;
                    const data = dates.flatMap((date, idx) => {
                      const positive_count = Number(
                        sentimentTrends.positive?.[idx] || 0
                      );
                      const neutral_count = Number(
                        sentimentTrends.neutral?.[idx] || 0
                      );
                      const negative_count = Number(
                        sentimentTrends.negative?.[idx] || 0
                      );
                      const total =
                        positive_count + neutral_count + negative_count;
                      const displayMin = mode === "product" ? 0 : minDailyTotal;
                      if (total < displayMin) return [];
                      const displayMode =
                        mode === "product" ? "percent" : chartMode;

                      const mk = (sent, count) => {
                        const percent = total > 0 ? (count / total) * 100 : 0;
                        return {
                          date,
                          sentiment: sent,
                          value: displayMode === "percent" ? percent : count,
                          count,
                          total: total || 0,
                          percentage: percent.toFixed(1),
                        };
                      };
                      return [
                        mk("positive", positive_count),
                        mk("neutral", neutral_count),
                        mk("negative", negative_count),
                      ];
                    });

                    return (
                      <Suspense fallback={<Spin />}>
                        <SentimentChart
                          data={data}
                          mode={mode}
                          chartMode={chartMode}
                        />
                      </Suspense>
                    );
                  })()}
                </div>
              )}
          </>
        )}
      </Card>

      <Card
        title={
          <Space style={{ whiteSpace: 'nowrap', fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            Cảnh báo tiêu cực
          </Space>
        }
        bordered={false}
        style={{
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(239, 68, 68, 0.12)",
          marginTop: 24,
          border: "2px solid rgba(239, 68, 68, 0.1)",
          background: "linear-gradient(135deg, #fff5f5 0%, #fffbf0 100%)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 32 }}
      >
        {sentimentAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Text style={{ fontSize: 16, color: '#64748b' }}>✅ Không có cảnh báo tiêu cực</Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 14 }}>
              Tất cả sản phẩm có cảm xúc tích cực
            </Text>
          </div>
        ) : (
          <>
            <Table
              size="middle"
              pagination={false}
              dataSource={sentimentAlerts.map((a) => ({
                key: a.product_id,
                ...a,
              }))}
              columns={[
                { 
                  title: "Tên sản phẩm", 
                  dataIndex: "name",
                  render: (text) => <span className="alerts-product-name">{text}</span>,
                  width: "45%"
                },
                {
                  title: "% tiêu cực",
                  dataIndex: "negative_percent",
                  render: (v) => (
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: v > 50 ? 'rgba(220, 38, 38, 0.1)' : v > 30 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 88, 12, 0.1)',
                    }}>
                      <span style={{ 
                        color: v > 50 ? '#dc2626' : v > 30 ? '#f97316' : '#ea580c',
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {v.toFixed(1)}%
                      </span>
                      <span style={{ 
                        fontSize: '18px',
                        color: v > 50 ? '#dc2626' : v > 30 ? '#f97316' : '#ea580c',
                      }}>
                        {v > 50 ? '🔴' : v > 30 ? '🟠' : '🟡'}
                      </span>
                    </div>
                  ),
                  width: "30%"
                },
                {
                  title: "Tổng đánh giá",
                  dataIndex: "total_reviews",
                  render: (v) => <span style={{ fontWeight: 600, fontSize: 14, color: '#4f46e5' }}>{formatNumber(v)}</span>,
                  width: "25%"
                },
              ]}
              style={{ background: 'transparent' }}
              rowStyle={{
                background: '#fff',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            />
            <div style={{ marginTop: 20, padding: '16px 14px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Text style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
                📋 Các sản phẩm hiển thị vượt ngưỡng tiêu cực hoặc có tỷ lệ phản hồi tiêu cực cao gần đây.
              </Text>
            </div>
          </>
        )}
      </Card>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap');

        @keyframes revealAnimation {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        /* floatAnimation removed to keep stat cards static */
      `}</style>
    </Space>
  );
};

export default AdminDashboard;