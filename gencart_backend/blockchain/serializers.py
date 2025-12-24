from rest_framework import serializers
from .models import (
    Wallet, WalletTransaction, WalletPayment, BlockchainPayment,
    BlockchainNetwork, Cryptocurrency
)


class BlockchainNetworkSerializer(serializers.ModelSerializer):
    """Serializer for BlockchainNetwork model"""
    class Meta:
        model = BlockchainNetwork
        fields = ['id', 'name', 'chain_id', 'rpc_url', 'explorer_url', 'is_active']
        read_only_fields = ['id']


class CryptocurrencySerializer(serializers.ModelSerializer):
    """Serializer for Cryptocurrency model"""
    class Meta:
        model = Cryptocurrency
        fields = ['id', 'symbol', 'name', 'contract_address', 'decimals', 'is_active', 'logo_url']
        read_only_fields = ['id']


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Serializer for WalletTransaction model"""
    cryptocurrency_symbol = serializers.CharField(
        source='cryptocurrency.symbol', 
        read_only=True
    )

    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'transaction_type', 'cryptocurrency', 'cryptocurrency_symbol',
            'amount', 'from_address', 'to_address', 'transaction_hash', 'status',
            'gas_fee', 'block_number', 'confirmation_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_hash', 'status', 'block_number', 
            'confirmation_count', 'created_at', 'updated_at'
        ]


class WalletPaymentSerializer(serializers.ModelSerializer):
    """Serializer for WalletPayment model"""
    cryptocurrency_symbol = serializers.CharField(
        source='cryptocurrency.symbol',
        read_only=True
    )

    class Meta:
        model = WalletPayment
        fields = [
            'id', 'order_id', 'cryptocurrency', 'cryptocurrency_symbol',
            'amount', 'usd_amount', 'status', 'transaction_hash', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'transaction_hash', 'created_at', 'updated_at']


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for Wallet model"""
    network_name = serializers.CharField(
        source='network.get_name_display',
        read_only=True
    )
    transactions = WalletTransactionSerializer(many=True, read_only=True)
    balance = serializers.DecimalField(max_digits=30, decimal_places=18, read_only=True)

    class Meta:
        model = Wallet
        fields = [
            'id', 'wallet_address', 'wallet_type', 'network', 'network_name',
            'is_verified', 'verified_at', 'balance', 'transactions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_verified', 'verified_at', 'balance', 'transactions', 'created_at', 'updated_at'
        ]


class WalletCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new wallet"""
    class Meta:
        model = Wallet
        fields = ['wallet_address', 'wallet_type', 'network']

    def validate_wallet_address(self, value):
        """Validate blockchain wallet address format"""
        if not value or len(value) < 26:
            raise serializers.ValidationError("Invalid wallet address format")
        return value.lower()


class WalletVerificationSerializer(serializers.Serializer):
    """Serializer for wallet verification"""
    wallet_address = serializers.CharField(max_length=255)
    signature = serializers.CharField()
    message = serializers.CharField()

    def validate_wallet_address(self, value):
        """Validate wallet address"""
        if not value or len(value) < 26:
            raise serializers.ValidationError("Invalid wallet address")
        return value.lower()


class WalletBalanceUpdateSerializer(serializers.Serializer):
    """Serializer for wallet balance updates"""
    balance = serializers.DecimalField(max_digits=30, decimal_places=18)
    block_number = serializers.IntegerField()


class InitiateWalletPaymentSerializer(serializers.Serializer):
    """Serializer for initiating wallet payment"""
    order_id = serializers.CharField(max_length=100)
    cryptocurrency = serializers.PrimaryKeyRelatedField(queryset=Cryptocurrency.objects.all())
    amount = serializers.DecimalField(max_digits=30, decimal_places=18)
    usd_amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class WalletDetailsSerializer(serializers.ModelSerializer):
    """Detailed wallet serializer with additional info"""
    network = BlockchainNetworkSerializer(read_only=True)
    recent_transactions = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = [
            'id', 'wallet_address', 'wallet_type', 'network', 'is_verified',
            'verified_at', 'balance', 'recent_transactions', 'created_at'
        ]
        read_only_fields = fields

    def get_recent_transactions(self, obj):
        """Get last 10 transactions"""
        transactions = obj.transactions.all()[:10]
        return WalletTransactionSerializer(transactions, many=True).data


class BlockchainPaymentSerializer(serializers.ModelSerializer):
    """Serializer for BlockchainPayment model"""
    order_id = serializers.CharField(source='order.id', read_only=True)
    wallet_payment_details = WalletPaymentSerializer(source='wallet_payment', read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = BlockchainPayment
        fields = [
            'id', 'order_id', 'wallet_payment_details', 'status',
            'initiated_at', 'confirmed_at', 'expires_at', 'is_expired',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'initiated_at', 'confirmed_at', 'created_at', 'updated_at']

    def get_is_expired(self, obj):
        return obj.is_expired()


class InitiateBlockchainPaymentSerializer(serializers.Serializer):
    """Serializer for initiating blockchain payment"""
    order_id = serializers.IntegerField()
    wallet_id = serializers.UUIDField()
    cryptocurrency_id = serializers.IntegerField()

    def validate_order_id(self, value):
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
            if order.payment_status:
                raise serializers.ValidationError("Order has already been paid")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")

    def validate_wallet_id(self, value):
        from .models import Wallet
        try:
            wallet = Wallet.objects.get(id=value, user=self.context['request'].user)
            if not wallet.is_verified:
                raise serializers.ValidationError("Wallet must be verified")
            return value
        except Wallet.DoesNotExist:
            raise serializers.ValidationError("Wallet not found or not owned by user")

    def validate_cryptocurrency_id(self, value):
        from .models import Cryptocurrency
        try:
            crypto = Cryptocurrency.objects.get(id=value, is_active=True)
            return value
        except Cryptocurrency.DoesNotExist:
            raise serializers.ValidationError("Cryptocurrency not found or inactive")


class ConfirmBlockchainPaymentSerializer(serializers.Serializer):
    """Serializer for confirming blockchain payment"""
    transaction_hash = serializers.CharField(max_length=255)

    def validate_transaction_hash(self, value):
        from web3 import Web3
        if not Web3.is_hex(value):
            raise serializers.ValidationError("Invalid transaction hash format")
        return value


class BlockchainPaymentStatusSerializer(serializers.Serializer):
    """Serializer for blockchain payment status"""
    status = serializers.CharField()
    confirmations = serializers.IntegerField(required=False)
    block_number = serializers.IntegerField(required=False)
    error = serializers.CharField(required=False)
