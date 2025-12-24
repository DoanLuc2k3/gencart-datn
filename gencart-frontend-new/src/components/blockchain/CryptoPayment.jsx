/**
 * Cryptocurrency Payment Component
 * components/blockchain/CryptoPayment.jsx
 *
 * Handles cryptocurrency payment for orders using new blockchain-payments API
 */

import React, { useState, useEffect } from 'react';
import useBlockchainWallet from '../../hooks/useBlockchainWallet';
import './CryptoPayment.css';

export function CryptoPayment({ orderId, orderAmount, onPaymentSuccess, onPaymentError }) {
  const {
    wallet,
    loading,
    error,
    cryptocurrencies
  } = useBlockchainWallet();

  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, initiated, waiting_tx, confirming, completed
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  // Initialize with first cryptocurrency
  useEffect(() => {
    if (cryptocurrencies.length > 0 && !selectedCrypto) {
      setSelectedCrypto(cryptocurrencies[0]);
    }
  }, [cryptocurrencies, selectedCrypto]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const initiatePayment = async () => {
    if (!wallet) {
      onPaymentError?.('Please connect your wallet first');
      return;
    }
    if (!wallet.is_verified) {
      onPaymentError?.('Please verify your wallet before making payments');
      return;
    }
    if (!selectedCrypto) {
      onPaymentError?.('Please select a cryptocurrency');
      return;
    }

    try {
      setPaymentStatus('initiated');

      const response = await fetch('/api/blockchain/blockchain-payments/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          order_id: orderId,
          wallet_id: wallet.id,
          cryptocurrency_id: selectedCrypto.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initiate payment');
      }

      const data = await response.json();
      setPaymentData(data);
      setPaymentStatus('waiting_tx');

    } catch (err) {
      setPaymentStatus('idle');
      onPaymentError?.(err.message);
    }
  };

  const sendTransaction = async () => {
    if (!window.ethereum) {
      onPaymentError?.('MetaMask not found');
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Send transaction
      const transactionParameters = {
        to: paymentData.to_address,
        from: window.ethereum.selectedAddress,
        value: '0x' + (parseFloat(paymentData.amount) * 10**18).toString(16), // Convert to wei
        gas: '0x5208', // 21000 gas
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setTransactionHash(txHash);
      setPaymentStatus('confirming');

      // Confirm with backend
      await confirmPayment(txHash);

    } catch (err) {
      onPaymentError?.(err.message);
      setPaymentStatus('waiting_tx');
    }
  };

  const confirmPayment = async (txHash) => {
    try {
      const response = await fetch(`/api/blockchain/blockchain-payments/${paymentData.payment_id}/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          transaction_hash: txHash
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to confirm payment');
      }

      // Start polling for status
      startStatusPolling();

    } catch (err) {
      onPaymentError?.(err.message);
      setPaymentStatus('waiting_tx');
    }
  };

  const startStatusPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/blockchain/blockchain-payments/${paymentData.payment_id}/status/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.ok) {
          const statusData = await response.json();

          if (statusData.status === 'confirmed') {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus('completed');
            onPaymentSuccess?.({
              transaction_hash: transactionHash,
              payment_id: paymentData.payment_id
            });
          } else if (statusData.status === 'failed' || statusData.is_expired) {
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentStatus('failed');
            onPaymentError?.('Payment failed or expired');
          }
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const resetPayment = () => {
    setPaymentData(null);
    setTransactionHash('');
    setPaymentStatus('idle');
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  if (!wallet) {
    return (
      <div className="crypto-payment-card">
        <div className="payment-placeholder">
          <p>🔗 Please connect your wallet first</p>
        </div>
      </div>
    );
  }

  if (!wallet.is_verified) {
    return (
      <div className="crypto-payment-card">
        <div className="payment-placeholder warning">
          <p>🔐 Please verify your wallet before making payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-payment-card">
      <div className="payment-header">
        <h3>💰 Pay with Cryptocurrency</h3>
        <p className="balance-info">
          Wallet: <strong>{wallet.wallet_address?.slice(0, 6)}...{wallet.wallet_address?.slice(-4)}</strong>
        </p>
      </div>

      <div className="payment-body">
        {/* Order Amount */}
        <div className="form-group">
          <label>Order Amount (USD)</label>
          <div className="usd-amount">
            <span className="currency">$</span>
            <input
              type="number"
              value={orderAmount}
              disabled
              className="form-control"
            />
          </div>
        </div>

        {/* Cryptocurrency Selection */}
        <div className="form-group">
          <label>Pay With:</label>
          <div className="crypto-selector">
            {cryptocurrencies.map(crypto => (
              <div
                key={crypto.id}
                className={`crypto-option ${selectedCrypto?.id === crypto.id ? 'active' : ''}`}
                onClick={() => setSelectedCrypto(crypto)}
              >
                {crypto.logo_url && (
                  <img src={crypto.logo_url} alt={crypto.symbol} className="crypto-icon" />
                )}
                <div className="crypto-info">
                  <strong>{crypto.symbol}</strong>
                  <small>{crypto.name}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'waiting_tx' && paymentData && (
          <div className="payment-instructions">
            <h4>📤 Send Transaction</h4>
            <div className="tx-details">
              <p><strong>Send:</strong> {paymentData.amount} {paymentData.cryptocurrency}</p>
              <p><strong>To:</strong> {paymentData.to_address}</p>
              <p><strong>Expires:</strong> {new Date(paymentData.expires_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {paymentStatus === 'confirming' && (
          <div className="payment-status">
            <h4>⏳ Confirming Payment</h4>
            <p>Transaction Hash: {transactionHash}</p>
            <div className="loading-spinner"></div>
            <small>Waiting for blockchain confirmation...</small>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="payment-success">
            <h4>✅ Payment Completed!</h4>
            <p>Transaction: {transactionHash}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="payment-footer">
        {paymentStatus === 'idle' && (
          <button
            className="btn-primary btn-large"
            onClick={initiatePayment}
            disabled={loading}
          >
            {loading ? 'Initiating...' : 'Start Crypto Payment'}
          </button>
        )}

        {paymentStatus === 'waiting_tx' && (
          <div className="confirmation-actions">
            <button
              className="btn-secondary"
              onClick={resetPayment}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={sendTransaction}
            >
              Send Transaction
            </button>
          </div>
        )}

        {paymentStatus === 'confirming' && (
          <button
            className="btn-secondary"
            onClick={resetPayment}
          >
            Cancel
          </button>
        )}

        {paymentStatus === 'completed' && (
          <button
            className="btn-success"
            onClick={resetPayment}
          >
            Make Another Payment
          </button>
        )}
      </div>
    </div>
  );
}

export default CryptoPayment;
