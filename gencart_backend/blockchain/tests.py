from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal

from .models import (
    BlockchainNetwork, Cryptocurrency, Wallet,
    WalletTransaction, WalletPayment
)

User = get_user_model()


class BlockchainNetworkTest(TestCase):
    """Test BlockchainNetwork model"""

    def setUp(self):
        self.network = BlockchainNetwork.objects.create(
            name='ethereum',
            chain_id=1,
            rpc_url='https://eth-mainnet.g.alchemy.com/v2/demo',
            explorer_url='https://etherscan.io',
            is_active=True
        )

    def test_network_creation(self):
        """Test blockchain network creation"""
        self.assertEqual(self.network.name, 'ethereum')
        self.assertEqual(self.network.chain_id, 1)
        self.assertTrue(self.network.is_active)

    def test_network_string_representation(self):
        """Test network string representation"""
        expected = f"Ethereum (Chain ID: 1)"
        self.assertEqual(str(self.network), expected)


class CryptocurrencyTest(TestCase):
    """Test Cryptocurrency model"""

    def setUp(self):
        self.crypto = Cryptocurrency.objects.create(
            symbol='ETH',
            name='Ethereum',
            decimals=18,
            is_active=True
        )

    def test_cryptocurrency_creation(self):
        """Test cryptocurrency creation"""
        self.assertEqual(self.crypto.symbol, 'ETH')
        self.assertEqual(self.crypto.name, 'Ethereum')
        self.assertEqual(self.crypto.decimals, 18)


class WalletTest(TestCase):
    """Test Wallet model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.network = BlockchainNetwork.objects.create(
            name='ethereum',
            chain_id=1,
            rpc_url='https://eth-mainnet.g.alchemy.com/v2/demo',
            is_active=True
        )
        self.wallet = Wallet.objects.create(
            user=self.user,
            wallet_address='0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            wallet_type='metamask',
            network=self.network,
            balance=Decimal('2.5')
        )

    def test_wallet_creation(self):
        """Test wallet creation"""
        self.assertEqual(self.wallet.user, self.user)
        self.assertEqual(self.wallet.wallet_type, 'metamask')
        self.assertFalse(self.wallet.is_verified)

    def test_wallet_unique_per_user(self):
        """Test that each user can have only one wallet"""
        with self.assertRaises(Exception):
            Wallet.objects.create(
                user=self.user,
                wallet_address='0xanother123',
                wallet_type='metamask',
                network=self.network
            )


class WalletAPITest(APITestCase):
    """Test Wallet API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.network = BlockchainNetwork.objects.create(
            name='ethereum',
            chain_id=1,
            rpc_url='https://eth-mainnet.g.alchemy.com/v2/demo',
            is_active=True
        )
        self.client.force_authenticate(user=self.user)

    def test_create_wallet(self):
        """Test creating a wallet via API"""
        data = {
            'wallet_address': '0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            'wallet_type': 'metamask',
            'network': self.network.id
        }
        response = self.client.post('/api/blockchain/wallets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wallet.objects.count(), 1)

    def test_get_wallets(self):
        """Test retrieving wallets via API"""
        Wallet.objects.create(
            user=self.user,
            wallet_address='0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            wallet_type='metamask',
            network=self.network
        )
        response = self.client.get('/api/blockchain/wallets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_wallet_authentication_required(self):
        """Test that authentication is required"""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/blockchain/wallets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WalletTransactionTest(TestCase):
    """Test WalletTransaction model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.network = BlockchainNetwork.objects.create(
            name='ethereum',
            chain_id=1,
            rpc_url='https://eth-mainnet.g.alchemy.com/v2/demo',
            is_active=True
        )
        self.wallet = Wallet.objects.create(
            user=self.user,
            wallet_address='0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            network=self.network
        )
        self.crypto = Cryptocurrency.objects.create(
            symbol='ETH',
            name='Ethereum',
            decimals=18
        )
        self.transaction = WalletTransaction.objects.create(
            wallet=self.wallet,
            transaction_type='payment',
            cryptocurrency=self.crypto,
            amount=Decimal('0.5'),
            from_address='0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            to_address='0x0000000000000000000000000000000000000000',
            transaction_hash='0x1234567890abcdef'
        )

    def test_transaction_creation(self):
        """Test transaction creation"""
        self.assertEqual(self.transaction.transaction_type, 'payment')
        self.assertEqual(self.transaction.amount, Decimal('0.5'))
        self.assertEqual(self.transaction.status, 'pending')


class WalletPaymentTest(TestCase):
    """Test WalletPayment model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.network = BlockchainNetwork.objects.create(
            name='ethereum',
            chain_id=1,
            rpc_url='https://eth-mainnet.g.alchemy.com/v2/demo',
            is_active=True
        )
        self.wallet = Wallet.objects.create(
            user=self.user,
            wallet_address='0x742d35Cc6634C0532925a3b844Bc9e7595f42D1f',
            network=self.network,
            balance=Decimal('1.0')
        )
        self.crypto = Cryptocurrency.objects.create(
            symbol='ETH',
            name='Ethereum',
            decimals=18
        )
        self.payment = WalletPayment.objects.create(
            wallet=self.wallet,
            order_id='ORDER123',
            cryptocurrency=self.crypto,
            amount=Decimal('0.1'),
            usd_amount=Decimal('200.00')
        )

    def test_payment_creation(self):
        """Test payment creation"""
        self.assertEqual(self.payment.order_id, 'ORDER123')
        self.assertEqual(self.payment.status, 'pending')
        self.assertEqual(self.payment.amount, Decimal('0.1'))
