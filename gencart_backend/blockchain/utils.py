"""
Blockchain utility functions for Web3 operations, signature verification, etc.
"""
from web3 import Web3
from eth_keys import keys
import os
from decimal import Decimal


class Web3Manager:
    """Manager class for Web3 operations"""

    def __init__(self, rpc_url):
        """Initialize Web3 connection"""
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

    def is_connected(self):
        """Check if connected to blockchain"""
        return self.w3.is_connected()

    def get_balance(self, address):
        """
        Get balance of an address
        
        Args:
            address: Ethereum address
            
        Returns:
            Balance in Wei as Decimal
        """
        try:
            if not Web3.is_address(address):
                raise ValueError("Invalid address")
            
            balance_wei = self.w3.eth.get_balance(address)
            return Decimal(balance_wei) / Decimal(10**18)
        except Exception as e:
            raise Exception(f"Error getting balance: {str(e)}")

    def verify_signature(self, address, message, signature):
        """
        Verify a message signature from an address
        
        Args:
            address: Ethereum address
            message: Original message
            signature: Hex signature
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            if not Web3.is_address(address):
                return False
            
            message_hash = Web3.keccak(text=message)
            recovered_address = self.w3.eth.account.recover_message(
                Web3.encode_defunct(text=message),
                signature=signature
            )
            
            return Web3.to_checksum_address(recovered_address) == Web3.to_checksum_address(address)
        except Exception as e:
            print(f"Error verifying signature: {str(e)}")
            return False

    def get_transaction(self, tx_hash):
        """
        Get transaction details
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Transaction details
        """
        try:
            tx = self.w3.eth.get_transaction(tx_hash)
            return {
                'hash': tx.get('hash').hex(),
                'from': tx.get('from'),
                'to': tx.get('to'),
                'value': Decimal(tx.get('value', 0)) / Decimal(10**18),
                'gas': tx.get('gas'),
                'gas_price': tx.get('gasPrice'),
                'nonce': tx.get('nonce'),
                'block_number': tx.get('blockNumber'),
            }
        except Exception as e:
            raise Exception(f"Error getting transaction: {str(e)}")

    def get_transaction_receipt(self, tx_hash):
        """
        Get transaction receipt
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Transaction receipt details
        """
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return {
                'hash': receipt.get('transactionHash').hex(),
                'block_number': receipt.get('blockNumber'),
                'gas_used': receipt.get('gasUsed'),
                'status': receipt.get('status'),
                'contract_address': receipt.get('contractAddress'),
                'cumulative_gas_used': receipt.get('cumulativeGasUsed'),
            }
        except Exception as e:
            raise Exception(f"Error getting transaction receipt: {str(e)}")

    def validate_address(self, address):
        """
        Validate an Ethereum address
        
        Args:
            address: Address to validate
            
        Returns:
            Boolean indicating if address is valid
        """
        return Web3.is_address(address)

    def to_checksum_address(self, address):
        """Convert address to checksum format"""
        try:
            return Web3.to_checksum_address(address)
        except Exception:
            return None


class SignatureVerifier:
    """Helper class for signature verification"""

    @staticmethod
    def verify_wallet_ownership(web3_manager, address, message, signature):
        """
        Verify wallet ownership using signature
        
        Args:
            web3_manager: Web3Manager instance
            address: Wallet address
            message: Message that was signed
            signature: Signature hex string
            
        Returns:
            Boolean indicating verification success
        """
        return web3_manager.verify_signature(address, message, signature)

    @staticmethod
    def create_verification_message(wallet_address, timestamp):
        """
        Create a verification message for wallet owners to sign
        
        Args:
            wallet_address: User's wallet address
            timestamp: Timestamp for uniqueness
            
        Returns:
            Message string to be signed
        """
        return f"I own this wallet: {wallet_address}\nTimestamp: {timestamp}"


class AddressValidator:
    """Helper class for address validation"""

    @staticmethod
    def is_valid_eth_address(address):
        """Check if valid Ethereum address"""
        return Web3.is_address(address)

    @staticmethod
    def is_valid_checksum_address(address):
        """Check if address has valid checksum"""
        try:
            return Web3.is_checksum_address(address)
        except Exception:
            return False

    @staticmethod
    def to_checksum_address(address):
        """Convert to checksum address"""
        if Web3.is_address(address):
            return Web3.to_checksum_address(address)
        return None


# Blockchain network configurations
NETWORK_CONFIGS = {
    'ethereum': {
        'chain_id': 1,
        'rpc_url': 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
        'explorer_url': 'https://etherscan.io',
    },
    'ethereum_testnet': {
        'chain_id': 11155111,
        'rpc_url': 'https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY',
        'explorer_url': 'https://sepolia.etherscan.io',
    },
    'polygon': {
        'chain_id': 137,
        'rpc_url': 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
        'explorer_url': 'https://polygonscan.com',
    },
    'polygon_testnet': {
        'chain_id': 80001,
        'rpc_url': 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY',
        'explorer_url': 'https://mumbai.polygonscan.com',
    },
    'bsc': {
        'chain_id': 56,
        'rpc_url': 'https://bsc-dataseed.binance.org',
        'explorer_url': 'https://bscscan.com',
    },
    'bsc_testnet': {
        'chain_id': 97,
        'rpc_url': 'https://data-seed-prebsc-1-b.binance.org',
        'explorer_url': 'https://testnet.bscscan.com',
    },
}
