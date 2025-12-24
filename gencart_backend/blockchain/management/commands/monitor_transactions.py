from django.core.management.base import BaseCommand
from django.utils import timezone
from blockchain.models import WalletTransaction, BlockchainPayment
from blockchain.utils import Web3Manager
import time


class Command(BaseCommand):
    help = 'Monitor pending blockchain transactions and update their status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=30,
            help='Monitoring interval in seconds (default: 30)',
        )
        parser.add_argument(
            '--max-confirmations',
            type=int,
            default=12,
            help='Minimum confirmations required (default: 12)',
        )

    def handle(self, *args, **options):
        interval = options['interval']
        max_confirmations = options['max_confirmations']

        self.stdout.write(
            self.style.SUCCESS(f'Starting transaction monitor (interval: {interval}s, confirmations: {max_confirmations})')
        )

        while True:
            try:
                self.monitor_transactions(max_confirmations)
            except Exception as e:
                self.stderr.write(f'Error monitoring transactions: {str(e)}')

            time.sleep(interval)

    def monitor_transactions(self, max_confirmations):
        """Monitor all pending transactions"""
        pending_transactions = WalletTransaction.objects.filter(status='pending')

        for transaction in pending_transactions:
            try:
                self.check_transaction_status(transaction, max_confirmations)
            except Exception as e:
                self.stderr.write(f'Error checking transaction {transaction.id}: {str(e)}')

    def check_transaction_status(self, transaction, max_confirmations):
        """Check status of a single transaction"""
        try:
            # Get Web3 manager for the network
            web3_manager = Web3Manager(transaction.wallet.network.rpc_url)

            # Get transaction receipt
            receipt = web3_manager.get_transaction_receipt(transaction.transaction_hash)

            if receipt:
                # Transaction is mined
                confirmations = web3_manager.get_confirmations(transaction.transaction_hash)

                # Update transaction details
                transaction.block_number = receipt.get('block_number')
                transaction.confirmation_count = confirmations
                transaction.gas_fee = receipt.get('gas_used', 0) * receipt.get('effective_gas_price', 0) / 10**18

                if confirmations >= max_confirmations:
                    # Transaction confirmed
                    transaction.status = 'confirmed'
                    transaction.save()

                    # Update related payment and order
                    self.update_payment_status(transaction)
                    self.stdout.write(
                        self.style.SUCCESS(f'Transaction {transaction.transaction_hash} confirmed')
                    )
                else:
                    # Still pending confirmations
                    transaction.save()
            else:
                # Transaction not yet mined, check if it's old (possible failed)
                if timezone.now() - transaction.created_at > timezone.timedelta(hours=24):
                    transaction.status = 'failed'
                    transaction.save()
                    self.update_payment_status(transaction, failed=True)
                    self.stderr.write(f'Transaction {transaction.transaction_hash} marked as failed (timeout)')

        except Exception as e:
            self.stderr.write(f'Error checking transaction {transaction.transaction_hash}: {str(e)}')

    def update_payment_status(self, transaction, failed=False):
        """Update payment and order status based on transaction"""
        try:
            blockchain_payment = transaction.payment.order_link

            if failed:
                blockchain_payment.mark_as_failed()
            else:
                blockchain_payment.mark_as_confirmed()

        except Exception as e:
            self.stderr.write(f'Error updating payment status: {str(e)}')