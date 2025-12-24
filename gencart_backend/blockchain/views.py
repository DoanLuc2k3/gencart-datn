from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid

from .models import (
    Wallet, WalletTransaction, WalletPayment, BlockchainPayment,
    BlockchainNetwork, Cryptocurrency
)
from .serializers import (
    WalletSerializer, WalletCreateSerializer, WalletDetailsSerializer,
    WalletTransactionSerializer, WalletPaymentSerializer, BlockchainPaymentSerializer,
    WalletVerificationSerializer, InitiateWalletPaymentSerializer,
    InitiateBlockchainPaymentSerializer, ConfirmBlockchainPaymentSerializer,
    BlockchainPaymentStatusSerializer,
    BlockchainNetworkSerializer, CryptocurrencySerializer
)


class BlockchainNetworkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing available blockchain networks
    """
    queryset = BlockchainNetwork.objects.filter(is_active=True)
    serializer_class = BlockchainNetworkSerializer
    permission_classes = [permissions.AllowAny]


class CryptocurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing supported cryptocurrencies
    """
    queryset = Cryptocurrency.objects.filter(is_active=True)
    serializer_class = CryptocurrencySerializer
    permission_classes = [permissions.AllowAny]


class WalletViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user blockchain wallets
    
    Available endpoints:
    - GET /wallets/ - List user's wallets
    - POST /wallets/ - Create a new wallet
    - GET /wallets/{id}/ - Get wallet details
    - POST /wallets/{id}/verify/ - Verify wallet ownership
    - POST /wallets/{id}/update-balance/ - Update wallet balance
    - POST /wallets/{id}/initiate-payment/ - Initiate a crypto payment
    - GET /wallets/{id}/transactions/ - Get wallet transactions
    - GET /wallets/{id}/payments/ - Get wallet payments
    """
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return wallets for the current user"""
        return Wallet.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return WalletCreateSerializer
        elif self.action == 'retrieve':
            return WalletDetailsSerializer
        elif self.action == 'verify':
            return WalletVerificationSerializer
        elif self.action == 'initiate_payment':
            return InitiateWalletPaymentSerializer
        return WalletSerializer

    def perform_create(self, serializer):
        """Create wallet for the current user"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Verify wallet ownership using signature verification
        
        Request body:
        {
            "wallet_address": "0x...",
            "signature": "0x...",
            "message": "I own this wallet"
        }
        """
        wallet = self.get_object()
        serializer = WalletVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        wallet_address = serializer.validated_data['wallet_address'].lower()
        if wallet_address != wallet.wallet_address.lower():
            return Response(
                {"detail": "Wallet address does not match"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # TODO: Implement signature verification using web3.py
        # This is a placeholder - in production, verify the signature cryptographically
        
        wallet.is_verified = True
        wallet.verified_at = timezone.now()
        wallet.verification_token = None
        wallet.save()

        return Response(
            {"detail": "Wallet verified successfully", "wallet": WalletSerializer(wallet).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def update_balance(self, request, pk=None):
        """
        Update wallet balance (admin/system use only)
        
        Request body:
        {
            "balance": "100.5",
            "block_number": 12345678
        }
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        wallet = self.get_object()
        balance = request.data.get('balance')
        block_number = request.data.get('block_number')

        if not balance or not block_number:
            return Response(
                {"detail": "Balance and block_number are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            wallet.balance = Decimal(str(balance))
            wallet.save()
            return Response(
                {"detail": "Balance updated", "wallet": WalletSerializer(wallet).data},
                status=status.HTTP_200_OK
            )
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid balance value"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def initiate_payment(self, request, pk=None):
        """
        Initiate a payment using cryptocurrency
        
        Request body:
        {
            "order_id": "12345",
            "cryptocurrency": 1,
            "amount": "0.05",
            "usd_amount": "150.00"
        }
        """
        wallet = self.get_object()
        
        if not wallet.is_verified:
            return Response(
                {"detail": "Wallet must be verified before making payments"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = InitiateWalletPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data['order_id']
        cryptocurrency = serializer.validated_data['cryptocurrency']
        amount = serializer.validated_data['amount']
        usd_amount = serializer.validated_data['usd_amount']

        # Check if wallet has sufficient balance
        if wallet.balance < amount:
            return Response(
                {"detail": f"Insufficient balance. Required: {amount}, Available: {wallet.balance}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create wallet payment record
        try:
            payment = WalletPayment.objects.create(
                wallet=wallet,
                order_id=order_id,
                cryptocurrency=cryptocurrency,
                amount=amount,
                usd_amount=usd_amount,
                status='pending'
            )

            return Response(
                {
                    "detail": "Payment initiated successfully",
                    "payment": WalletPaymentSerializer(payment).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"detail": f"Error creating payment: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for this wallet"""
        wallet = self.get_object()
        transactions = wallet.transactions.all()
        
        # Optional filtering
        status_filter = request.query_params.get('status')
        if status_filter:
            transactions = transactions.filter(status=status_filter)
        
        transaction_type = request.query_params.get('type')
        if transaction_type:
            transactions = transactions.filter(transaction_type=transaction_type)

        serializer = WalletTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """Get all payments for this wallet"""
        wallet = self.get_object()
        payments = wallet.payments.all()
        
        # Optional filtering
        status_filter = request.query_params.get('status')
        if status_filter:
            payments = payments.filter(status=status_filter)

        serializer = WalletPaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get wallet summary for current user"""
        user = request.user
        try:
            wallet = Wallet.objects.get(user=user)
            total_transactions = wallet.transactions.count()
            total_payments = wallet.payments.count()
            pending_payments = wallet.payments.filter(status='pending').count()

            return Response({
                'wallet': WalletSerializer(wallet).data,
                'total_transactions': total_transactions,
                'total_payments': total_payments,
                'pending_payments': pending_payments,
            })
        except Wallet.DoesNotExist:
            return Response(
                {"detail": "No wallet found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )


class WalletTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing wallet transactions (read-only)
    """
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return transactions for user's wallets only"""
        user = self.request.user
        return WalletTransaction.objects.filter(wallet__user=user)


class WalletPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing wallet payments (read-only)
    """
    serializer_class = WalletPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return payments for user's wallets only"""
        user = self.request.user
        return WalletPayment.objects.filter(wallet__user=user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Mark a payment as confirmed"""
        payment = self.get_object()
        
        if payment.wallet.user != request.user:
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        payment.status = 'confirmed'
        payment.save()

        return Response(
            {"detail": "Payment confirmed", "payment": WalletPaymentSerializer(payment).data}
        )


class BlockchainPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing blockchain payments
    
    Available endpoints:
    - GET /blockchain-payments/ - List user's blockchain payments
    - POST /blockchain-payments/initiate/ - Initiate a blockchain payment
    - POST /blockchain-payments/{id}/confirm/ - Confirm payment with transaction hash
    - GET /blockchain-payments/{id}/status/ - Get payment status
    """
    serializer_class = BlockchainPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BlockchainPayment.objects.filter(order__user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        Initiate a blockchain payment for an order
        
        Request body:
        {
            "order_id": 123,
            "wallet_id": "uuid",
            "cryptocurrency_id": 1
        }
        """
        serializer = InitiateBlockchainPaymentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        wallet_id = serializer.validated_data['wallet_id']
        cryptocurrency_id = serializer.validated_data['cryptocurrency_id']
        
        # Get related objects
        from orders.models import Order
        order = Order.objects.get(id=order_id)
        wallet = Wallet.objects.get(id=wallet_id)
        cryptocurrency = Cryptocurrency.objects.get(id=cryptocurrency_id)
        
        # Calculate crypto amount (simplified conversion)
        # In real implementation, you'd use price API
        usd_amount = order.total_amount
        crypto_amount = usd_amount / Decimal('2000')  # Simplified: assume 1 ETH = 2000 USD
        
        # Create wallet payment
        wallet_payment = WalletPayment.objects.create(
            wallet=wallet,
            order_id=str(order.id),
            cryptocurrency=cryptocurrency,
            amount=crypto_amount,
            usd_amount=usd_amount,
            status='pending'
        )
        
        # Create blockchain payment link
        from django.utils import timezone
        expires_at = timezone.now() + timezone.timedelta(hours=1)
        
        blockchain_payment = BlockchainPayment.objects.create(
            order=order,
            wallet_payment=wallet_payment,
            expires_at=expires_at
        )
        
        # Get merchant wallet address from settings
        from django.conf import settings
        merchant_address = getattr(settings, 'MERCHANT_WALLET_ADDRESS', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
        
        return Response({
            "payment_id": blockchain_payment.id,
            "to_address": merchant_address,
            "amount": str(crypto_amount),
            "cryptocurrency": cryptocurrency.symbol,
            "usd_amount": str(usd_amount),
            "expires_at": expires_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm blockchain payment with transaction hash
        
        Request body:
        {
            "transaction_hash": "0x..."
        }
        """
        blockchain_payment = self.get_object()
        serializer = ConfirmBlockchainPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tx_hash = serializer.validated_data['transaction_hash']
        
        # Check if payment is expired
        if blockchain_payment.is_expired():
            blockchain_payment.status = 'expired'
            blockchain_payment.save()
            return Response(
                {"detail": "Payment has expired"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already confirmed
        if blockchain_payment.status == 'confirmed':
            return Response(
                {"detail": "Payment already confirmed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create wallet transaction
        wallet_payment = blockchain_payment.wallet_payment
        transaction = WalletTransaction.objects.create(
            wallet=wallet_payment.wallet,
            transaction_type='payment',
            cryptocurrency=wallet_payment.cryptocurrency,
            amount=wallet_payment.amount,
            from_address=wallet_payment.wallet.wallet_address,
            to_address=getattr(settings, 'MERCHANT_WALLET_ADDRESS', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'),
            transaction_hash=tx_hash,
            status='pending'
        )
        
        # Link transaction to payment
        wallet_payment.transaction = transaction
        wallet_payment.transaction_hash = tx_hash
        wallet_payment.save()
        
        # Update blockchain payment status
        blockchain_payment.status = 'pending_confirmation'
        blockchain_payment.save()
        
        # Trigger background monitoring (simplified - in real app use Celery)
        # For now, we'll simulate immediate confirmation
        try:
            # In real implementation, this would be a background task
            self._monitor_transaction(transaction.id)
        except Exception as e:
            return Response(
                {"detail": f"Error monitoring transaction: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            "detail": "Payment confirmation initiated",
            "payment": BlockchainPaymentSerializer(blockchain_payment).data
        })
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get blockchain payment status
        """
        blockchain_payment = self.get_object()
        
        response_data = {
            "status": blockchain_payment.status,
            "is_expired": blockchain_payment.is_expired()
        }
        
        if blockchain_payment.wallet_payment.transaction:
            transaction = blockchain_payment.wallet_payment.transaction
            response_data.update({
                "confirmations": transaction.confirmation_count,
                "block_number": transaction.block_number,
                "transaction_hash": transaction.transaction_hash
            })
        
        return Response(response_data)
    
    def _monitor_transaction(self, transaction_id):
        """
        Simplified transaction monitoring (in real app, use background task)
        """
        try:
            transaction = WalletTransaction.objects.get(id=transaction_id)
            blockchain_payment = transaction.payment.order_link
            
            # Simulate confirmation (in real app, check blockchain)
            transaction.status = 'confirmed'
            transaction.confirmation_count = 12  # Simulate 12 confirmations
            transaction.block_number = 18500000  # Simulate block number
            transaction.save()
            
            # Update payment and order
            blockchain_payment.mark_as_confirmed()
            
        except Exception as e:
            # Mark as failed
            transaction.status = 'failed'
            transaction.save()
            blockchain_payment.mark_as_failed()
