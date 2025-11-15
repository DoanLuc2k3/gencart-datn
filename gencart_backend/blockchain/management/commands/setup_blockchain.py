from django.core.management.base import BaseCommand
from blockchain.models import BlockchainNetwork, Cryptocurrency
from blockchain.utils import NETWORK_CONFIGS


class Command(BaseCommand):
    help = 'Initialize blockchain networks and cryptocurrencies'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting blockchain setup...'))

        # Create blockchain networks
        networks_created = 0
        for network_name, config in NETWORK_CONFIGS.items():
            network, created = BlockchainNetwork.objects.get_or_create(
                name=network_name,
                defaults={
                    'chain_id': config['chain_id'],
                    'rpc_url': config['rpc_url'],
                    'explorer_url': config['explorer_url'],
                    'is_active': True,
                }
            )
            if created:
                networks_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created network: {network_name}')
                )
            else:
                self.stdout.write(f'→ Network already exists: {network_name}')

        # Create cryptocurrencies
        cryptocurrencies = [
            {
                'symbol': 'ETH',
                'name': 'Ethereum',
                'decimals': 18,
                'logo_url': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            },
            {
                'symbol': 'MATIC',
                'name': 'Polygon',
                'decimals': 18,
                'logo_url': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
            },
            {
                'symbol': 'BNB',
                'name': 'Binance Coin',
                'decimals': 18,
                'logo_url': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
            },
            {
                'symbol': 'USDC',
                'name': 'USD Coin',
                'decimals': 6,
                'logo_url': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
            },
            {
                'symbol': 'USDT',
                'name': 'Tether',
                'decimals': 6,
                'logo_url': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
            },
        ]

        cryptos_created = 0
        for crypto_data in cryptocurrencies:
            crypto, created = Cryptocurrency.objects.get_or_create(
                symbol=crypto_data['symbol'],
                defaults={
                    'name': crypto_data['name'],
                    'decimals': crypto_data['decimals'],
                    'logo_url': crypto_data['logo_url'],
                    'is_active': True,
                }
            )
            if created:
                cryptos_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created cryptocurrency: {crypto_data["symbol"]}')
                )
            else:
                self.stdout.write(f'→ Cryptocurrency already exists: {crypto_data["symbol"]}')

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Setup complete!\n'
            f'  Networks created: {networks_created}\n'
            f'  Cryptocurrencies created: {cryptos_created}'
        ))
