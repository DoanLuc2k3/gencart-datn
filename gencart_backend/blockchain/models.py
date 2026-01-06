from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid
from decimal import Decimal


class BlockchainNetwork(models.Model):
    """
    Model to store blockchain network configurations
    """
    NETWORK_CHOICES = (
        ('ethereum', 'Ethereum'),
        ('ethereum_testnet', 'Ethereum Testnet (Sepolia)'),
        ('polygon', 'Polygon (Matic)'),
        ('polygon_testnet', 'Polygon Testnet (Mumbai)'),
        ('bsc', 'Binance Smart Chain'),
        ('bsc_testnet', 'BSC Testnet'),
    )

    name = models.CharField(max_length=50, choices=NETWORK_CHOICES, unique=True)
    chain_id = models.IntegerField(unique=True)
    rpc_url = models.URLField()
    explorer_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.get_name_display()} (Chain ID: {self.chain_id})"


class Wallet(models.Model):
    """
    Model to store user blockchain wallets
    """
    WALLET_TYPE_CHOICES = (
        ('ethereum', 'Ethereum'),
        ('metamask', 'MetaMask'),
        ('walletconnect', 'WalletConnect'),
        ('other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blockchain_wallet')
    wallet_address = models.CharField(max_length=255, unique=True)
    wallet_type = models.CharField(max_length=20, choices=WALLET_TYPE_CHOICES, default='metamask')
    network = models.ForeignKey(BlockchainNetwork, on_delete=models.SET_NULL, null=True, related_name='wallets')
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    balance = models.DecimalField(max_digits=30, decimal_places=18, default=Decimal('0.0'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Wallet for {self.user.username}"


class Cryptocurrency(models.Model):
    """
    Model to store supported cryptocurrencies
    """
    SYMBOL_CHOICES = (
        ('ETH', 'Ethereum'),
        ('MATIC', 'Polygon'),
        ('BNB', 'Binance Coin'),
        ('USDC', 'USD Coin'),
        ('USDT', 'Tether'),
    )

    symbol = models.CharField(max_length=10, choices=SYMBOL_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    contract_address = models.CharField(max_length=255, blank=True, null=True)
    decimals = models.IntegerField(default=18)
    is_active = models.BooleanField(default=True)
    logo_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Cryptocurrencies"
        ordering = ['symbol']

    def __str__(self):
        return f"{self.symbol} - {self.name}"


class WalletTransaction(models.Model):
    """
    Model to store blockchain transactions
    """
    TRANSACTION_TYPE_CHOICES = (
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('payment', 'Payment'),
        ('reward', 'Reward'),
    )

    TRANSACTION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    cryptocurrency = models.ForeignKey(Cryptocurrency, on_delete=models.PROTECT, related_name='transactions')
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    from_address = models.CharField(max_length=255)
    to_address = models.CharField(max_length=255)
    transaction_hash = models.CharField(max_length=255, unique=True, db_index=True)
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS_CHOICES, default='pending')
    gas_fee = models.DecimalField(max_digits=30, decimal_places=18, null=True, blank=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    confirmation_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.amount} {self.cryptocurrency.symbol}"


class WalletPayment(models.Model):
    """
    Model to link blockchain wallet payments to orders
    """
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='payments')
    order_id = models.CharField(max_length=100)  # Link to order
    cryptocurrency = models.ForeignKey(Cryptocurrency, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=30, decimal_places=18)
    usd_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_hash = models.CharField(max_length=255, blank=True, null=True)
    transaction = models.OneToOneField(WalletTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.amount} {self.cryptocurrency.symbol}"


class BlockchainPayment(models.Model):
    """
    Liên kết giữa Order và Blockchain Payment để quản lý thanh toán
    """
    PAYMENT_STATUS_CHOICES = (
        ('initiated', 'Initiated'),
        ('pending_confirmation', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('expired', 'Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='blockchain_payment')
    wallet_payment = models.OneToOneField(WalletPayment, on_delete=models.CASCADE, related_name='order_link')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='initiated')
    initiated_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-initiated_at']

    def __str__(self):
        return f"Blockchain Payment for Order {self.order.id}"

    def is_expired(self):
        """Check if payment has expired"""
        return timezone.now() > self.expires_at

    def mark_as_confirmed(self):
        """Mark payment as confirmed and update order"""
        from django.utils import timezone
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save()

        # Update wallet payment status
        if self.wallet_payment:
            self.wallet_payment.status = 'confirmed'
            self.wallet_payment.save()
            
            # Update wallet transaction status if exists
            if self.wallet_payment.transaction:
                self.wallet_payment.transaction.status = 'confirmed'
                self.wallet_payment.transaction.save()

        # Update order payment status
        self.order.payment_status = True
        self.order.status = 'processing'  # Move to processing
        self.order.save()

    def mark_as_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        self.save()
