import React, { useState } from 'react';
import { Button, Popover, Spin, Tag, Space, Divider, Empty, message } from 'antd';
import { WalletOutlined, CopyOutlined, LogoutOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import './WalletButton.css';

const WalletButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending } = useConnect();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      const injectedConnector = connectors.find(c => c.id === 'injected');
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      } else {
        console.error('Injected connector not found');
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        type="primary"
        icon={isPending ? <LoadingOutlined /> : <WalletOutlined />}
        onClick={handleConnect}
        loading={isPending}
        disabled={isPending}
        style={{
          background: isPending ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontWeight: '500',
          fontSize: 'clamp(12px, 2vw, 14px)',
          padding: 'clamp(4px 8px, 1vw 2vw, 8px 16px)',
          height: 'auto',
          minHeight: '32px',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!isPending) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isPending) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  const walletContent = (
    <div style={{ minWidth: '220px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Wallet Address */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
            Wallet Address
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f0f0f0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e6e6e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f0f0f0';
            }}
            onClick={handleCopyAddress}
          >
            <code style={{ fontSize: '12px', flex: 1, fontWeight: '500' }}>
              {formatAddress(address)}
            </code>
            <CopyOutlined style={{ color: copied ? '#52c41a' : '#999' }} />
          </div>
          {copied && (
            <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '4px' }}>
              <CheckCircleOutlined /> Copied!
            </div>
          )}
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Status */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
            Status
          </div>
          <Tag color="green" style={{ width: '100%', textAlign: 'center' }}>
            Connected
          </Tag>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Actions */}
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={handleDisconnect}
        >
          Disconnect Wallet
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover
      content={walletContent}
      title="Wallet"
      trigger="click"
      placement="bottomRight"
      overlayStyle={{ borderRadius: '8px' }}
    >
      <Button
        type="primary"
        icon={<WalletOutlined />}
        style={{
          background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
          border: 'none',
          color: 'white',
          fontWeight: '600',
          fontSize: 'clamp(12px, 2vw, 14px)',
          padding: 'clamp(4px 8px, 1vw 2vw, 8px 16px)',
          height: 'auto',
          minHeight: '32px',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(82, 196, 26, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {formatAddress(address)}
      </Button>
    </Popover>
  );
};

export default WalletButton;
