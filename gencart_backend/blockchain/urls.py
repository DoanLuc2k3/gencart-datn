from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlockchainNetworkViewSet, CryptocurrencyViewSet,
    WalletViewSet, WalletTransactionViewSet, WalletPaymentViewSet
)

router = DefaultRouter()
router.register(r'networks', BlockchainNetworkViewSet, basename='blockchain-network')
router.register(r'cryptocurrencies', CryptocurrencyViewSet, basename='cryptocurrency')
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'transactions', WalletTransactionViewSet, basename='wallet-transaction')
router.register(r'payments', WalletPaymentViewSet, basename='wallet-payment')

urlpatterns = [
    path('', include(router.urls)),
]
