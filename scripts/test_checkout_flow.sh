#!/bin/bash
# Test script to verify checkout flow works after sample data import

echo "Testing checkout flow..."

# Set Django settings
export DJANGO_SETTINGS_MODULE=gencart_backend.settings

cd gencart_backend

echo "1. Testing API endpoints..."

# Test products endpoint
echo "Testing products API..."
curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/products/" | grep -q "200" && echo "✓ Products API OK" || echo "✗ Products API failed"

# Test users endpoint (requires auth)
echo "Testing users API..."
TOKEN=$(python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()
user = User.objects.filter(username='user1').first()
if user:
    refresh = RefreshToken.for_user(user)
    print(refresh.access_token)
else:
    print('no_token')
" 2>/dev/null)

if [ "$TOKEN" != "no_token" ]; then
    echo "✓ Sample user exists"
    # Test cart API
    CART_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" "${API_BASE_URL}/cart/my_cart/")
    if [ "$CART_STATUS" = "200" ]; then
        echo "✓ Cart API OK"
    else
        echo "✗ Cart API failed: $CART_STATUS"
    fi
else
    echo "✗ Sample user not found"
fi

echo "2. Checking database counts..."
python manage.py shell -c "
from products.models import Product, Category, Review
from orders.models import Order
from users.models import User
from blog.models import BlogPost

print(f'Products: {Product.objects.filter(is_active=True).count()}')
print(f'Categories: {Category.objects.count()}')
print(f'Orders: {Order.objects.count()}')
print(f'Users: {User.objects.count()}')
print(f'Reviews: {Review.objects.count()}')
print(f'Blog Posts: {BlogPost.objects.count()}')
"

echo "3. Testing order creation..."
# This would require frontend testing, but we can check the API exists
python manage.py shell -c "
from orders.views import OrderViewSet
print('✓ Order API exists')
"

echo "Checkout flow test completed!"
echo "Now test manually:"
echo "1. Login as user1 (password: password123)"
echo "2. Add products to cart"
echo "3. Go through checkout process"
echo "4. Verify order is created in admin dashboard"