# Generated migration for blockchain app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BlockchainNetwork',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('ethereum', 'Ethereum'), ('ethereum_testnet', 'Ethereum Testnet (Sepolia)'), ('polygon', 'Polygon (Matic)'), ('polygon_testnet', 'Polygon Testnet (Mumbai)'), ('bsc', 'Binance Smart Chain'), ('bsc_testnet', 'BSC Testnet')], max_length=50, unique=True)),
                ('chain_id', models.IntegerField(unique=True)),
                ('rpc_url', models.URLField()),
                ('explorer_url', models.URLField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Cryptocurrency',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(choices=[('ETH', 'Ethereum'), ('MATIC', 'Polygon'), ('BNB', 'Binance Coin'), ('USDC', 'USD Coin'), ('USDT', 'Tether')], max_length=10, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('contract_address', models.CharField(blank=True, max_length=255, null=True)),
                ('decimals', models.IntegerField(default=18)),
                ('is_active', models.BooleanField(default=True)),
                ('logo_url', models.URLField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Cryptocurrencies',
                'ordering': ['symbol'],
            },
        ),
        migrations.CreateModel(
            name='Wallet',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('wallet_address', models.CharField(max_length=255, unique=True)),
                ('wallet_type', models.CharField(choices=[('ethereum', 'Ethereum'), ('metamask', 'MetaMask'), ('walletconnect', 'WalletConnect'), ('other', 'Other')], default='metamask', max_length=20)),
                ('is_verified', models.BooleanField(default=False)),
                ('verification_token', models.CharField(blank=True, max_length=255, null=True)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('balance', models.DecimalField(decimal_places=18, default='0.0', max_digits=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('network', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='wallets', to='blockchain.blockchainnetwork')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='blockchain_wallet', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='WalletTransaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('transaction_type', models.CharField(choices=[('deposit', 'Deposit'), ('withdrawal', 'Withdrawal'), ('payment', 'Payment'), ('reward', 'Reward')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=18, max_digits=30)),
                ('from_address', models.CharField(max_length=255)),
                ('to_address', models.CharField(max_length=255)),
                ('transaction_hash', models.CharField(db_index=True, max_length=255, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('gas_fee', models.DecimalField(blank=True, decimal_places=18, max_digits=30, null=True)),
                ('block_number', models.BigIntegerField(blank=True, null=True)),
                ('confirmation_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cryptocurrency', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to='blockchain.cryptocurrency')),
                ('wallet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='blockchain.wallet')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='WalletPayment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order_id', models.CharField(max_length=100)),
                ('amount', models.DecimalField(decimal_places=18, max_digits=30)),
                ('usd_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('transaction_hash', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cryptocurrency', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='blockchain.cryptocurrency')),
                ('transaction', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payment', to='blockchain.wallettransaction')),
                ('wallet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='blockchain.wallet')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
