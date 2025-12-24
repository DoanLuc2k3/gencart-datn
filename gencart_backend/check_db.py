#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gencart_backend.settings')
sys.path.append('.')
django.setup()

from blockchain.models import BlockchainPayment, WalletPayment, WalletTransaction, Wallet
from orders.models import Order

print("=== BLOCKCHAIN DATABASE CHECK ===")
print(f"BlockchainPayment count: {BlockchainPayment.objects.count()}")
print(f"WalletPayment count: {WalletPayment.objects.count()}")
print(f"WalletTransaction count: {WalletTransaction.objects.count()}")
print(f"Wallet count: {Wallet.objects.count()}")
print(f"Order count: {Order.objects.count()}")

print("\n=== RECENT BLOCKCHAIN PAYMENTS ===")
for payment in BlockchainPayment.objects.all()[:5]:
    print(f"ID: {payment.id}, Order: {payment.order.id}, Status: {payment.status}, Created: {payment.created_at}")

print("\n=== RECENT WALLET PAYMENTS ===")
for payment in WalletPayment.objects.all()[:5]:
    print(f"ID: {payment.id}, Order ID: {payment.order_id}, Status: {payment.status}, Amount: {payment.amount}")

print("\n=== RECENT TRANSACTIONS ===")
for tx in WalletTransaction.objects.all()[:5]:
    print(f"Hash: {tx.transaction_hash}, Status: {tx.status}, Amount: {tx.amount}")

print("\n=== ORDERS WITH PAYMENT STATUS ===")
for order in Order.objects.filter(payment_status=True)[:5]:
    print(f"Order {order.id}: payment_status={order.payment_status}, status={order.status}")