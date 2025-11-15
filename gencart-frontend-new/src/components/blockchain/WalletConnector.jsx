/**
 * Wallet Connection Component
 * components/blockchain/WalletConnector.jsx
 * 
 * Handles initial wallet connection and verification
 */

import React, { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import useBlockchainWallet from '../../hooks/useBlockchainWallet';
import './WalletConnector.css';

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { wallet, loading, error, connectWallet, verifyWallet, networks } = useBlockchainWallet();
  const [selectedNetwork, setSelectedNetwork] = useState(1);
  const [showVerification, setShowVerification] = useState(false);

  const handleMetaMaskConnect = () => {
    connect({ connector: new MetaMaskConnector() });
  };

  const handleConnectBlockchain = async () => {
    const result = await connectWallet(selectedNetwork);
    if (result) {
      setShowVerification(true);
    }
  };

  const handleVerifyWallet = async () => {
    if (wallet?.id) {
      await verifyWallet(wallet.id);
      setShowVerification(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="wallet-connector-card">
        <div className="wallet-connector-content">
          <h2>🦊 Connect Your Wallet</h2>
          <p>Connect MetaMask to start shopping with cryptocurrency</p>
          
          <button 
            className="btn-primary"
            onClick={handleMetaMaskConnect}
          >
            Connect MetaMask
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="wallet-connector-card">
        <div className="wallet-connector-content">
          <h2>🔗 Link Blockchain Wallet</h2>
          <p>Address: <code>{address?.slice(0, 6)}...{address?.slice(-4)}</code></p>

          <div className="form-group">
            <label>Select Network:</label>
            <select 
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(parseInt(e.target.value))}
              className="form-control"
            >
              {networks.map(net => (
                <option key={net.id} value={net.id}>
                  {net.name} (Chain ID: {net.chain_id})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn-primary"
            onClick={handleConnectBlockchain}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Link Wallet'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connector-card">
      <div className="wallet-connector-content">
        <h2>✨ Wallet Connected</h2>
        
        <div className="wallet-info">
          <div className="info-row">
            <span className="label">Address:</span>
            <code className="value">{wallet.wallet_address}</code>
          </div>
          <div className="info-row">
            <span className="label">Network:</span>
            <span className="value">{wallet.network_name}</span>
          </div>
          <div className="info-row">
            <span className="label">Balance:</span>
            <span className="value">{wallet.balance} ETH</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className={`badge ${wallet.is_verified ? 'verified' : 'unverified'}`}>
              {wallet.is_verified ? '✓ Verified' : '⚠ Not Verified'}
            </span>
          </div>
        </div>

        {!wallet.is_verified && (
          <div className="verification-section">
            <h3>🔐 Verify Wallet</h3>
            <p>Sign a message to verify you own this wallet</p>
            {!showVerification ? (
              <button 
                className="btn-secondary"
                onClick={() => setShowVerification(true)}
              >
                Start Verification
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleVerifyWallet}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Wallet'}
              </button>
            )}
          </div>
        )}

        {wallet.is_verified && (
          <div className="success-message">
            ✅ Your wallet is verified and ready for payments!
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default WalletConnector;
