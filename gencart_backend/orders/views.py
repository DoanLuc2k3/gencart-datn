from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from products.models import Product
from users.models import Address
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer, OrderListSerializer

class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cart model
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        """
        Get or create a cart for the current user
        """
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """
        Get the current user's cart
        """
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Add an item to the cart with inventory validation
        """
        cart = self.get_object()
        # Log incoming payload for debugging
        try:
            print('add_item payload:', request.data)
        except Exception:
            pass

        product_id = request.data.get('product_id')
        # Safely parse quantity and return informative error on bad input
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid quantity value. Quantity must be an integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not product_id:
            return Response(
                {"detail": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than 0."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if the product is already in the cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 0}  # Start with 0, will be updated below
        )

        # Calculate new total quantity
        new_quantity = cart_item.quantity + quantity

        # Check inventory availability
        if new_quantity > product.inventory:
            return Response(
                {
                    "detail": f"Insufficient stock for {product.name}. Available: {product.inventory}, In cart: {cart_item.quantity}, Requested: {quantity}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update cart item quantity
        cart_item.quantity = new_quantity
        cart_item.save()

        print(f"Added {quantity} {product.name} to cart. Total in cart: {cart_item.quantity}, Available stock: {product.inventory}")

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """
        Remove an item from the cart
        """
        cart = self.get_object()
        cart_item_id = request.data.get('cart_item_id')

        if not cart_item_id:
            return Response(
                {"detail": "Cart item ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)
            cart_item.delete()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """
        Update the quantity of an item in the cart with inventory validation
        """
        cart = self.get_object()
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity')

        if not cart_item_id or not quantity:
            return Response(
                {"detail": "Cart item ID and quantity are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response(
                    {"detail": "Quantity must be greater than 0."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"detail": "Invalid quantity value."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)
            
            # Check inventory availability
            if quantity > cart_item.product.inventory:
                return Response(
                    {
                        "detail": f"Insufficient stock for {cart_item.product.name}. Available: {cart_item.product.inventory}, Requested: {quantity}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            old_quantity = cart_item.quantity
            cart_item.quantity = quantity
            cart_item.save()
            
            print(f"Updated {cart_item.product.name} quantity in cart: {old_quantity} -> {quantity}, Available stock: {cart_item.product.inventory}")
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """
        Clear all items from the cart
        """
        cart = self.get_object()
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Order model
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """
        Use lightweight serializer for list view, full serializer for detail view
        """
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def get_queryset(self):
        from django.db.models import Count
        user = self.request.user
        
        # Use different query optimization based on action
        if self.action == 'list':
            # For list view: load necessary relations to avoid N+1 queries
            queryset = Order.objects.select_related(
                'user',
                'shipping_address'
            ).prefetch_related(
                'items__product',
                'items__product__category'
            ).annotate(
                items_count=Count('items')
            )
        else:
            # For detail view: load everything
            queryset = Order.objects.select_related(
                'user',
                'shipping_address',
                'billing_address'
            ).prefetch_related(
                'items__product',
                'items__product__category'
            )
        
        if user.is_staff:
            return queryset
        return queryset.filter(user=user)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """
        Create a new order from the user's cart
        """
        user = request.user

        # Get the user's cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if the cart is empty
        if cart.items.count() == 0:
            return Response(
                {"detail": "Cannot create order from empty cart."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check inventory availability for all items before creating order
        inventory_errors = []
        for cart_item in cart.items.all():
            product = cart_item.product
            if product.inventory < cart_item.quantity:
                inventory_errors.append(
                    f"Insufficient stock for {product.name}. Available: {product.inventory}, Requested: {cart_item.quantity}"
                )
        
        if inventory_errors:
            return Response(
                {"detail": "Inventory insufficient", "errors": inventory_errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get shipping and billing addresses
        shipping_address_id = request.data.get('shipping_address_id')
        billing_address_id = request.data.get('billing_address_id')

        try:
            shipping_address = Address.objects.get(id=shipping_address_id, user=user)
            billing_address = Address.objects.get(id=billing_address_id, user=user)
        except Address.DoesNotExist:
            return Response(
                {"detail": "Shipping or billing address not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate total amount
        subtotal = cart.total_price
        shipping_cost = 50 if subtotal < 999 else 0  # Shipping logic
        tax = 0  # Tax logic, set to 0 for now
        total_amount = subtotal + shipping_cost + tax

        # Create the order
        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            billing_address=billing_address,
            total_amount=total_amount,
            shipping_cost=shipping_cost
        )

        # Handle blockchain payment if provided
        blockchain_tx_hash = request.data.get('blockchain_transaction_hash')
        payment_method = request.data.get('payment_method')
        blockchain_network = request.data.get('blockchain_network')
        wallet_address = request.data.get('wallet_address')

        if payment_method == 'blockchain' and blockchain_tx_hash:
            # Import blockchain models
            from blockchain.models import Wallet, Cryptocurrency, BlockchainPayment, WalletPayment, WalletTransaction

            try:
                # Get or create wallet for user
                wallet, created = Wallet.objects.get_or_create(
                    user=user,
                    defaults={
                        'wallet_address': wallet_address or 'unknown',
                        'wallet_type': 'metamask',
                        'is_verified': True  # Assume verified since they made payment
                    }
                )

                # Get default cryptocurrency (ETH)
                try:
                    cryptocurrency = Cryptocurrency.objects.get(symbol='ETH')
                except Cryptocurrency.DoesNotExist:
                    cryptocurrency = Cryptocurrency.objects.create(
                        symbol='ETH',
                        name='Ethereum',
                        decimals=18,
                        is_active=True
                    )

                # Calculate crypto amount (simplified conversion)
                crypto_amount = total_amount / 2000  # Assume 1 ETH = 2000 USD

                # Create wallet payment
                wallet_payment = WalletPayment.objects.create(
                    wallet=wallet,
                    order_id=str(order.id),
                    cryptocurrency=cryptocurrency,
                    amount=crypto_amount,
                    usd_amount=total_amount,
                    status='pending',
                    transaction_hash=blockchain_tx_hash
                )

                # Create wallet transaction
                transaction = WalletTransaction.objects.create(
                    wallet=wallet,
                    transaction_type='payment',
                    cryptocurrency=cryptocurrency,
                    amount=crypto_amount,
                    from_address=wallet_address or 'unknown',
                    to_address='0x742d35Cc6634C0532925a3b844Bc454e4438f44e',  # Merchant address
                    transaction_hash=blockchain_tx_hash,
                    status='pending'
                )

                # Link transaction to payment
                wallet_payment.transaction = transaction
                wallet_payment.save()

                # Create blockchain payment link
                from django.utils import timezone
                blockchain_payment = BlockchainPayment.objects.create(
                    order=order,
                    wallet_payment=wallet_payment,
                    expires_at=timezone.now() + timezone.timedelta(hours=1)
                )

                # Mark as confirmed (simplified - in real app use monitoring)
                blockchain_payment.mark_as_confirmed()

                print(f"Created blockchain payment for order {order.id}: {blockchain_tx_hash}")

            except Exception as e:
                print(f"Error creating blockchain payment: {str(e)}")
                # Continue with order creation even if blockchain payment fails

        # Create order items from cart items and decrease inventory
        for cart_item in cart.items.all():
            # Use discount price if available, otherwise use regular price
            item_price = cart_item.product.discount_price if cart_item.product.discount_price else cart_item.product.price
            
            print(f"Creating OrderItem for {cart_item.product.name}: original_price={cart_item.product.price}, discount_price={cart_item.product.discount_price}, using_price={item_price}")
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=item_price
            )
            
            # Decrease product inventory
            product = cart_item.product
            product.inventory -= cart_item.quantity
            product.save()
            
            print(f"Decreased inventory for {product.name}: {product.inventory + cart_item.quantity} -> {product.inventory}")

        # Clear the cart
        cart.items.all().delete()

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """
        Cancel an order and restore inventory
        """
        order = self.get_object()

        # Check if the order can be cancelled
        if order.status in ['delivered', 'cancelled']:
            return Response(
                {"detail": f"Cannot cancel order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore inventory for all order items
        for order_item in order.items.all():
            product = order_item.product
            product.inventory += order_item.quantity
            product.save()
            
            print(f"Restored inventory for {product.name}: {product.inventory - order_item.quantity} -> {product.inventory}")

        # Update order status to cancelled
        order.status = 'cancelled'
        order.save()

        serializer = self.get_serializer(order, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[0-9]+)')
    def by_user(self, request, user_id=None):
        """
        Get all orders for a specific user (admin only)
        Returns orders with full details including items, shipping address, etc.
        """
        # Check if user is staff/admin
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to view other users' orders."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get orders for the specified user with optimized queries
        orders = Order.objects.filter(user_id=user_id).select_related(
            'user',
            'shipping_address',
            'billing_address'
        ).prefetch_related(
            'items__product',
            'items__product__category'
        ).order_by('-created_at')
        
        # Use pagination if available
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
