/**
 * Cryptocurrency Payment Component
 * components/blockchain/CryptoPayment.jsx
 * 
 * Handles cryptocurrency payment for orders
 */

import React, { useState, useEffect } from 'react';
import useBlockchainWallet from '../../hooks/useBlockchainWallet';
import './CryptoPayment.css';

export function CryptoPayment({ orderId, orderAmount, onPaymentSuccess, onPaymentError }) {
  const { 
    wallet, 
    loading, 
    error, 
    cryptocurrencies, 
    makePayment 
  } = useBlockchainWallet();
  
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize with first cryptocurrency
  useEffect(() => {
    if (cryptocurrencies.length > 0 && !selectedCrypto) {
      setSelectedCrypto(cryptocurrencies[0]);
    }
  }, [cryptocurrencies, selectedCrypto]);

  // Calculate crypto amount based on USD amount
  const handleCryptoChange = (e) => {
    const crypto = cryptocurrencies.find(c => c.id === parseInt(e.target.value));
    setSelectedCrypto(crypto);
    // Reset amount when changing crypto
    setCryptoAmount('');
  };

  const handleUSDAmountChange = (usdAmount) => {
    if (exchangeRate && usdAmount) {
      const amount = (parseFloat(usdAmount) / exchangeRate).toFixed(8);
      setCryptoAmount(amount);
    }
  };

  const handlePaymentClick = () => {
    if (!wallet) {
      onPaymentError?.('Please connect and verify your wallet first');
      return;
    }
    if (!wallet.is_verified) {
      onPaymentError?.('Please verify your wallet before making payments');
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmPayment = async () => {
    try {
      if (!selectedCrypto || !cryptoAmount) {
        throw new Error('Please select cryptocurrency and amount');
      }

      const result = await makePayment(
        wallet.id,
        orderId,
        selectedCrypto.id,
        cryptoAmount,
        orderAmount
      );

      setIsConfirming(false);
      setCryptoAmount('');
      onPaymentSuccess?.(result);
    } catch (err) {
      onPaymentError?.(err.message);
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

  if (parseFloat(wallet.balance) < parseFloat(cryptoAmount || 0)) {
    return (
      <div className="crypto-payment-card">
        <div className="payment-placeholder error">
          <p>❌ Insufficient balance</p>
          <small>Balance: {wallet.balance} {selectedCrypto?.symbol}</small>
          <small>Required: {cryptoAmount} {selectedCrypto?.symbol}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-payment-card">
      <div className="payment-header">
        <h3>💰 Pay with Cryptocurrency</h3>
        <p className="balance-info">
          Balance: <strong>{wallet.balance}</strong> {selectedCrypto?.symbol}
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
                onClick={() => {
                  setSelectedCrypto(crypto);
                  setCryptoAmount('');
                }}
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

        {/* Exchange Rate */}
        <div className="form-group">
          <label>Exchange Rate</label>
          <div className="exchange-rate">
            <input 
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
              placeholder="Enter rate"
              className="form-control"
            />
            <span className="rate-unit">USD per {selectedCrypto?.symbol}</span>
          </div>
        </div>

        {/* Crypto Amount */}
        <div className="form-group">
          <label>Amount to Send ({selectedCrypto?.symbol})</label>
          <div className="crypto-amount">
            <input 
              type="number"
              value={cryptoAmount}
              onChange={(e) => {
                setCryptoAmount(e.target.value);
              }}
              placeholder="0.00000000"
              className="form-control"
              step="0.00000001"
            />
            {orderAmount && exchangeRate && (
              <button 
                className="btn-small"
                onClick={() => handleUSDAmountChange(orderAmount)}
              >
                Calculate
              </button>
            )}
          </div>
          {cryptoAmount && (
            <small className="calc-info">
              ≈ ${(parseFloat(cryptoAmount) * exchangeRate).toFixed(2)} USD
            </small>
          )}
        </div>

        {/* Payment Summary */}
        {isConfirming && (
          <div className="payment-summary">
            <div className="summary-row">
              <span>Amount:</span>
              <strong>{cryptoAmount} {selectedCrypto?.symbol}</strong>
            </div>
            <div className="summary-row">
              <span>USD Equivalent:</span>
              <strong>${(parseFloat(cryptoAmount) * exchangeRate).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Your Balance:</span>
              <strong>{wallet.balance} {selectedCrypto?.symbol}</strong>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="payment-footer">
        {!isConfirming ? (
          <button 
            className="btn-primary btn-large"
            onClick={handlePaymentClick}
            disabled={loading || !cryptoAmount}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        ) : (
          <div className="confirmation-actions">
            <button 
              className="btn-secondary"
              onClick={() => setIsConfirming(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CryptoPayment;
