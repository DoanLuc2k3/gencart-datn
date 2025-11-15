from rest_framework import serializers
from .models import (
    Wallet, WalletTransaction, WalletPayment, 
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
