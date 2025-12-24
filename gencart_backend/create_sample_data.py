#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gencart_backend.settings')
sys.path.append('.')
django.setup()

from blockchain.models import Wallet, Cryptocurrency, BlockchainPayment, WalletPayment, WalletTransaction
from orders.models import Order
from users.models import User
from decimal import Decimal

print("=== CREATING SAMPLE BLOCKCHAIN DATA ===")

# Get first user
try:
    user = User.objects.first()
    if not user:
        print("No users found. Creating a test user...")
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    print(f"Using user: {user.username}")
except Exception as e:
    print(f"Error getting user: {e}")
    sys.exit(1)

# Get or create cryptocurrency
try:
    crypto, created = Cryptocurrency.objects.get_or_create(
        symbol='ETH',
        defaults={
            'name': 'Ethereum',
            'decimals': 18,
            'is_active': True
        }
    )
    print(f"Cryptocurrency: {crypto.symbol} ({'created' if created else 'existing'})")
except Exception as e:
    print(f"Error creating cryptocurrency: {e}")
    sys.exit(1)

# Get or create wallet
try:
    wallet, created = Wallet.objects.get_or_create(
        user=user,
        defaults={
            'wallet_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            'wallet_type': 'metamask',
            'is_verified': True,
            'balance': Decimal('1.5')
        }
    )
    print(f"Wallet: {wallet.wallet_address} ({'created' if created else 'existing'})")
except Exception as e:
    print(f"Error creating wallet: {e}")
    sys.exit(1)

# Get an order
try:
    order = Order.objects.filter(user=user).first()
    if not order:
        print("No orders found for user. Creating a test order...")
        from users.models import Address
        address, created = Address.objects.get_or_create(
            user=user,
            defaults={
                'address_type': 'shipping',
                'street_address': '123 Test St',
                'city': 'Test City',
                'state': 'Test State',
                'country': 'Test Country',
                'zip_code': '12345'
            }
        )
        order = Order.objects.create(
            user=user,
            shipping_address=address,
            billing_address=address,
            total_amount=Decimal('150.00'),
            shipping_cost=Decimal('10.00'),
            payment_status=False
        )
    print(f"Using order: {order.id} (payment_status: {order.payment_status})")
except Exception as e:
    print(f"Error getting order: {e}")
    sys.exit(1)

# Create wallet payment
try:
    crypto_amount = order.total_amount / Decimal('2000')  # 1 ETH = 2000 USD
    wallet_payment = WalletPayment.objects.create(
        wallet=wallet,
        order_id=str(order.id),
        cryptocurrency=crypto,
        amount=crypto_amount,
        usd_amount=order.total_amount,
        status='pending',
        transaction_hash='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    )
    print(f"Created WalletPayment: {wallet_payment.id}")
except Exception as e:
    print(f"Error creating wallet payment: {e}")

# Create wallet transaction
try:
    transaction = WalletTransaction.objects.create(
        wallet=wallet,
        transaction_type='payment',
        cryptocurrency=crypto,
        amount=crypto_amount,
        from_address=wallet.wallet_address,
        to_address='0x742d35Cc6634C0532925a3b844Bc454e4438f44e',  # Merchant
        transaction_hash='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status='confirmed',
        block_number=18500000,
        confirmation_count=12
    )
    print(f"Created WalletTransaction: {transaction.id}")
except Exception as e:
    print(f"Error creating wallet transaction: {e}")

# Link transaction to payment
try:
    wallet_payment.transaction = transaction
    wallet_payment.status = 'confirmed'
    wallet_payment.save()
    print("Linked transaction to payment")
except Exception as e:
    print(f"Error linking transaction: {e}")

# Create blockchain payment
try:
    from django.utils import timezone
    blockchain_payment = BlockchainPayment.objects.create(
        order=order,
        wallet_payment=wallet_payment,
        status='confirmed',
        expires_at=timezone.now() + timezone.timedelta(hours=1),
        confirmed_at=timezone.now()
    )
    print(f"Created BlockchainPayment: {blockchain_payment.id}")
except Exception as e:
    print(f"Error creating blockchain payment: {e}")

# Update order payment status
try:
    order.payment_status = True
    order.status = 'processing'
    order.save()
    print(f"Updated order {order.id}: payment_status={order.payment_status}, status={order.status}")
except Exception as e:
    print(f"Error updating order: {e}")

print("\n=== FINAL CHECK ===")
print(f"BlockchainPayment count: {BlockchainPayment.objects.count()}")
print(f"WalletPayment count: {WalletPayment.objects.count()}")
print(f"WalletTransaction count: {WalletTransaction.objects.count()}")
print(f"Wallet count: {Wallet.objects.count()}")

print("\n=== SAMPLE DATA CREATED SUCCESSFULLY ===")
print("You can now test the blockchain payment API!")