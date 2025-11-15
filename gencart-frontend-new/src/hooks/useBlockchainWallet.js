/**
 * Blockchain Wallet Hook
 * useBlockchainWallet.js
 * 
 * This hook provides all functionality to interact with the blockchain wallet API
 * Usage: const { wallet, connectWallet, verifyWallet, makePayment } = useBlockchainWallet();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api from '../utils/api';

export function useBlockchainWallet() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [cryptocurrencies, setCryptocurrencies] = useState([]);

  // Fetch available networks and cryptocurrencies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [networksRes, cryptosRes] = await Promise.all([
          api.get('/blockchain/networks/'),
          api.get('/blockchain/cryptocurrencies/')
        ]);
        setNetworks(networksRes.data);
        setCryptocurrencies(cryptosRes.data);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch user's wallet if it exists
  const fetchWallet = useCallback(async () => {
    try {
      const response = await api.get('/blockchain/wallets/');
      if (response.data && response.data.length > 0) {
        setWallet(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchWallet();
    }
  }, [isConnected, fetchWallet]);

  // Connect wallet to blockchain
  const connectWallet = useCallback(async (networkId) => {
    if (!address) {
      setError('Please connect MetaMask first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/blockchain/wallets/', {
        wallet_address: address,
        wallet_type: 'metamask',
        network: networkId || 1 // Default to Ethereum
      });

      setWallet(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Verify wallet ownership using signature
  const verifyWallet = useCallback(async (walletId) => {
    if (!address || !signMessage) {
      setError('Wallet or signature functionality not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const message = `I own this wallet: ${address}\nTimestamp: ${Date.now()}`;
      
      const signature = await signMessage({ message });
      
      const response = await api.post(`/blockchain/wallets/${walletId}/verify/`, {
        wallet_address: address,
        signature,
        message
      });

      setWallet(response.data.wallet);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Wallet verification failed';
      setError(errorMsg);
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  }, [address, signMessage]);

  // Make a cryptocurrency payment
  const makePayment = useCallback(async (walletId, orderId, cryptocurrencyId, amount, usdAmount) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/blockchain/wallets/${walletId}/initiate-payment/`, {
        order_id: orderId,
        cryptocurrency: cryptocurrencyId,
        amount: parseFloat(amount),
        usd_amount: parseFloat(usdAmount)
      });

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Payment initiation failed';
      setError(errorMsg);
      console.error('Payment error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wallet transactions
  const getTransactions = useCallback(async (walletId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(
        `/blockchain/wallets/${walletId}/transactions/?${params}`
      );
      return response.data;
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  }, []);

  // Get wallet payments
  const getPayments = useCallback(async (walletId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(
        `/blockchain/wallets/${walletId}/payments/?${params}`
      );
      return response.data;
    } catch (err) {
      console.error('Error fetching payments:', err);
      return [];
    }
  }, []);

  // Get wallet summary
  const getWalletSummary = useCallback(async () => {
    try {
      const response = await api.get('/blockchain/wallets/summary/');
      return response.data;
    } catch (err) {
      console.error('Error fetching wallet summary:', err);
      return null;
    }
  }, []);

  // Refresh wallet data
  const refreshWallet = useCallback(async () => {
    if (wallet?.id) {
      try {
        const response = await api.get(`/blockchain/wallets/${wallet.id}/`);
        setWallet(response.data);
        return response.data;
      } catch (err) {
        console.error('Error refreshing wallet:', err);
      }
    }
  }, [wallet?.id]);

  return {
    // State
    wallet,
    loading,
    error,
    networks,
    cryptocurrencies,
    isConnected,
    address,

    // Actions
    connectWallet,
    verifyWallet,
    makePayment,
    getTransactions,
    getPayments,
    getWalletSummary,
    refreshWallet,
    setError
  };
}

export default useBlockchainWallet;
