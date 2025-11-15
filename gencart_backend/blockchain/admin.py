from django.contrib import admin
from .models import (
    BlockchainNetwork, Cryptocurrency, Wallet,
    WalletTransaction, WalletPayment
)


@admin.register(BlockchainNetwork)
class BlockchainNetworkAdmin(admin.ModelAdmin):
    list_display = ['name', 'chain_id', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'chain_id']
    readonly_fields = ['created_at']


@admin.register(Cryptocurrency)
class CryptocurrencyAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'name', 'decimals', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['symbol', 'name']
    readonly_fields = ['created_at']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'wallet_address', 'wallet_type', 'network', 'is_verified', 'balance', 'created_at']
    list_filter = ['wallet_type', 'is_verified', 'network', 'created_at']
    search_fields = ['wallet_address', 'user__username', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'verification_token']

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'id')
        }),
        ('Wallet Details', {
            'fields': ('wallet_address', 'wallet_type', 'network', 'balance')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verified_at', 'verification_token')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'wallet', 'transaction_type', 'cryptocurrency',
        'amount', 'status', 'transaction_hash', 'created_at'
    ]
    list_filter = ['transaction_type', 'status', 'cryptocurrency', 'created_at']
    search_fields = ['wallet__user__username', 'transaction_hash', 'from_address', 'to_address']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Transaction Details', {
            'fields': ('id', 'wallet', 'transaction_type', 'cryptocurrency', 'amount', 'status')
        }),
        ('Blockchain Information', {
            'fields': ('transaction_hash', 'from_address', 'to_address', 'gas_fee', 'block_number', 'confirmation_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(WalletPayment)
class WalletPaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'wallet', 'order_id', 'cryptocurrency',
        'amount', 'usd_amount', 'status', 'created_at'
    ]
    list_filter = ['status', 'cryptocurrency', 'created_at']
    search_fields = ['wallet__user__username', 'order_id', 'transaction_hash']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Payment Details', {
            'fields': ('id', 'wallet', 'order_id', 'cryptocurrency')
        }),
        ('Amount Information', {
            'fields': ('amount', 'usd_amount')
        }),
        ('Status & Transaction', {
            'fields': ('status', 'transaction_hash', 'transaction')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
