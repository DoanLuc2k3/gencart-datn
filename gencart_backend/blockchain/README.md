# Blockchain Wallet Integration Guide

This document provides comprehensive instructions for integrating and using the blockchain wallet feature in GenCart.

## Overview

The blockchain wallet module enables users to:
- Connect and manage cryptocurrency wallets
- Verify wallet ownership using cryptographic signatures
- Make payments using cryptocurrencies
- Track blockchain transactions
- View wallet balances and transaction history

## Features

### 1. **Multi-Network Support**
- Ethereum Mainnet & Testnet (Sepolia)
- Polygon (Matic) Mainnet & Testnet (Mumbai)
- Binance Smart Chain (BSC) & Testnet

### 2. **Supported Cryptocurrencies**
- ETH (Ethereum)
- MATIC (Polygon)
- BNB (Binance Coin)
- USDC (USD Coin)
- USDT (Tether)

### 3. **Wallet Management**
- Create wallet connections
- Verify wallet ownership
- Track wallet balance
- View transaction history

## Installation

### 1. Update Requirements
The blockchain dependencies have been added to `requirements.txt`:
- `web3>=6.0.0` - Web3.py library for blockchain interactions
- `eth-keys>=0.4.0` - Ethereum key handling
- `eth-typing>=3.0.0` - Ethereum type definitions
- `python-dotenv>=1.0.0` - Environment variable management

Install the dependencies:
```bash
pip install -r requirements.txt
```

### 2. Apply Migrations
Create the blockchain database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Initialize Blockchain Networks and Cryptocurrencies
```bash
python manage.py setup_blockchain
```

This command will:
- Create all supported blockchain networks
- Add all supported cryptocurrencies to the database
- Set up initial configuration

## Configuration

### Environment Variables
Add the following to your `.env` file:

```env
# Blockchain RPC Endpoints
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ETHEREUM_TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_TESTNET_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-b.binance.org
```

### Obtain RPC Endpoints
1. **Alchemy** (Ethereum & Polygon): https://www.alchemy.com/
2. **Infura** (Ethereum): https://infura.io/
3. **Binance**: https://bscscan.com/

## API Endpoints

### Base URL
```
/api/blockchain/
```

### Wallet Management

#### 1. List Wallets
```http
GET /api/blockchain/wallets/
```
**Authorization**: Required (Bearer Token)

**Response**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
    "wallet_type": "metamask",
    "network": 1,
    "network_name": "Ethereum",
    "is_verified": true,
    "verified_at": "2024-01-15T10:30:00Z",
    "balance": "2.5",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### 2. Create Wallet Connection
```http
POST /api/blockchain/wallets/
```
**Authorization**: Required

**Request Body**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
  "wallet_type": "metamask",
  "network": 1
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
  "wallet_type": "metamask",
  "network": 1,
  "is_verified": false,
  "balance": "0.0",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### 3. Verify Wallet Ownership
```http
POST /api/blockchain/wallets/{wallet_id}/verify/
```
**Authorization**: Required

**Request Body**:
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
  "signature": "0x...",
  "message": "I own this wallet"
}
```

**Frontend Implementation (JavaScript/React)**:
```javascript
import { useAccount, useSignMessage } from 'wagmi';

async function verifyWallet() {
  const { address } = useAccount();
  const { signMessage } = useSignMessage();

  const message = `Verify wallet ownership: ${address}`;
  
  const signature = await signMessage({ message });
  
  const response = await fetch('/api/blockchain/wallets/{wallet_id}/verify/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      wallet_address: address,
      signature: signature,
      message: message
    })
  });
  
  const data = await response.json();
  console.log('Wallet verified:', data);
}
```

#### 4. Get Wallet Details
```http
GET /api/blockchain/wallets/{wallet_id}/
```
**Authorization**: Required

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
  "wallet_type": "metamask",
  "network": {
    "id": 1,
    "name": "ethereum",
    "chain_id": 1,
    "rpc_url": "https://eth-mainnet.g.alchemy.com/v2/...",
    "explorer_url": "https://etherscan.io",
    "is_active": true
  },
  "is_verified": true,
  "verified_at": "2024-01-15T10:30:00Z",
  "balance": "2.5",
  "recent_transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "transaction_type": "payment",
      "cryptocurrency_symbol": "ETH",
      "amount": "0.5",
      "status": "confirmed",
      "transaction_hash": "0x123...",
      "created_at": "2024-01-15T09:00:00Z"
    }
  ],
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### 5. Update Wallet Balance
```http
POST /api/blockchain/wallets/{wallet_id}/update-balance/
```
**Authorization**: Required (Admin/Staff only)

**Request Body**:
```json
{
  "balance": "2.5",
  "block_number": 18234567
}
```

#### 6. Initiate Cryptocurrency Payment
```http
POST /api/blockchain/wallets/{wallet_id}/initiate-payment/
```
**Authorization**: Required

**Request Body**:
```json
{
  "order_id": "12345",
  "cryptocurrency": 1,
  "amount": "0.05",
  "usd_amount": "150.00"
}
```

**Response** (201 Created):
```json
{
  "detail": "Payment initiated successfully",
  "payment": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "order_id": "12345",
    "cryptocurrency": 1,
    "cryptocurrency_symbol": "ETH",
    "amount": "0.05",
    "usd_amount": "150.00",
    "status": "pending",
    "transaction_hash": null,
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

#### 7. Get Wallet Transactions
```http
GET /api/blockchain/wallets/{wallet_id}/transactions/?status=confirmed&type=payment
```
**Authorization**: Required

**Query Parameters**:
- `status`: pending | confirmed | failed | cancelled
- `type`: deposit | withdrawal | payment | reward

#### 8. Get Wallet Payments
```http
GET /api/blockchain/wallets/{wallet_id}/payments/?status=confirmed
```
**Authorization**: Required

#### 9. Get Wallet Summary
```http
GET /api/blockchain/wallets/summary/
```
**Authorization**: Required

**Response**:
```json
{
  "wallet": { /* wallet details */ },
  "total_transactions": 15,
  "total_payments": 3,
  "pending_payments": 1
}
```

### Blockchain Networks

#### List Available Networks
```http
GET /api/blockchain/networks/
```
**Authorization**: Not required

**Response**:
```json
[
  {
    "id": 1,
    "name": "ethereum",
    "chain_id": 1,
    "rpc_url": "https://eth-mainnet.g.alchemy.com/v2/...",
    "explorer_url": "https://etherscan.io",
    "is_active": true
  }
]
```

### Cryptocurrencies

#### List Supported Cryptocurrencies
```http
GET /api/blockchain/cryptocurrencies/
```
**Authorization**: Not required

**Response**:
```json
[
  {
    "id": 1,
    "symbol": "ETH",
    "name": "Ethereum",
    "contract_address": null,
    "decimals": 18,
    "is_active": true,
    "logo_url": "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  }
]
```

## Frontend Implementation

### React Integration Example

```javascript
// src/hooks/useBlockchainWallet.js
import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export function useBlockchainWallet() {
  const { address } = useAccount();
  const { signMessage } = useSignMessage();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Connect wallet
  const connectWallet = async (network) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blockchain/wallets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          wallet_address: address,
          wallet_type: 'metamask',
          network: network
        })
      });
      
      if (!response.ok) throw new Error('Failed to connect wallet');
      const data = await response.json();
      setWallet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify wallet
  const verifyWallet = async (walletId) => {
    setLoading(true);
    setError(null);
    try {
      const message = `Verify wallet ownership: ${address}`;
      const signature = await signMessage({ message });
      
      const response = await fetch(
        `/api/blockchain/wallets/${walletId}/verify/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            wallet_address: address,
            signature,
            message
          })
        }
      );
      
      if (!response.ok) throw new Error('Verification failed');
      const data = await response.json();
      setWallet(data.wallet);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Make payment
  const makePayment = async (walletId, orderId, cryptoId, amount, usdAmount) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/blockchain/wallets/${walletId}/initiate-payment/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            order_id: orderId,
            cryptocurrency: cryptoId,
            amount,
            usd_amount: usdAmount
          })
        }
      );
      
      if (!response.ok) throw new Error('Payment initiation failed');
      return await response.json();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    wallet,
    loading,
    error,
    connectWallet,
    verifyWallet,
    makePayment
  };
}
```

### React Component Example

```javascript
// src/components/WalletConnector.jsx
import { useAccount } from 'wagmi';
import { useBlockchainWallet } from '../hooks/useBlockchainWallet';

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { wallet, loading, error, connectWallet, verifyWallet } = useBlockchainWallet();

  const handleConnect = async () => {
    // Get Ethereum network ID
    const networkId = 1; // Ethereum mainnet
    await connectWallet(networkId);
  };

  const handleVerify = async () => {
    if (wallet?.id) {
      await verifyWallet(wallet.id);
    }
  };

  return (
    <div className="wallet-connector">
      <h2>Blockchain Wallet</h2>
      
      {!isConnected ? (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          
          {wallet ? (
            <div>
              <p>Wallet ID: {wallet.id}</p>
              <p>Balance: {wallet.balance} ETH</p>
              <p>Verified: {wallet.is_verified ? 'Yes' : 'No'}</p>
              
              {!wallet.is_verified && (
                <button onClick={handleVerify} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Wallet'}
                </button>
              )}
            </div>
          ) : (
            <p>No wallet connected</p>
          )}
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Integration with Payments Module

The blockchain wallet can be integrated with the existing payments module:

```python
# blockchain/payment_handler.py
from payments.models import Payment
from blockchain.models import WalletPayment, Wallet

def process_blockchain_payment(order, wallet_payment):
    """
    Process a blockchain wallet payment for an order
    """
    # Create a Payment record linked to blockchain
    payment = Payment.objects.create(
        user=order.user,
        order=order,
        payment_method='blockchain_wallet',
        amount=wallet_payment.usd_amount,
        status='pending',
        transaction_id=wallet_payment.id
    )
    
    # Link to blockchain payment
    wallet_payment.transaction_hash = payment.transaction_id
    wallet_payment.save()
    
    return payment
```

## Security Considerations

1. **Signature Verification**: Always verify signatures using cryptographic libraries
2. **Rate Limiting**: Implement rate limiting on payment endpoints
3. **Wallet Verification**: Require users to verify wallet ownership before payments
4. **Balance Checks**: Validate sufficient balance before processing payments
5. **Transaction Confirmation**: Confirm transactions on-chain before marking as complete
6. **HTTPS Only**: Always use HTTPS in production
7. **Environment Variables**: Never hardcode API keys; use environment variables

## Testing

### Unit Tests
```bash
python manage.py test blockchain
```

### Manual Testing with cURL

```bash
# Get networks
curl -X GET http://localhost:8000/api/blockchain/networks/

# Create wallet
curl -X POST http://localhost:8000/api/blockchain/wallets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f",
    "wallet_type": "metamask",
    "network": 1
  }'

# Get wallet details
curl -X GET http://localhost:8000/api/blockchain/wallets/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Common Issues

1. **"Web3 Connection Error"**
   - Check RPC URL configuration
   - Verify internet connectivity
   - Ensure RPC endpoint is accessible

2. **"Invalid Signature"**
   - Verify message format matches expectations
   - Ensure wallet used for signing matches connected wallet
   - Check signature format (should be hex string)

3. **"Insufficient Balance"**
   - Update wallet balance from blockchain
   - Verify actual balance in wallet
   - Check if balance update is recent

4. **"Wallet Already Exists"**
   - Each user can only have one wallet
   - Update existing wallet instead of creating new one
   - Use PATCH method to update

## Next Steps

1. Deploy to production with proper environment variables
2. Implement background task for transaction confirmation
3. Add real-time balance updates using WebSocket
4. Implement multi-signature wallets for enhanced security
5. Add NFT support for loyalty rewards
6. Integrate with payment processor for instant conversion

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Contact development team
4. Create GitHub issue with details
