import os
import django
import sys
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gencart_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from products.views import ProductViewSet
from products.models import Category, Product
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_create():
    # Create a user
    user, created = User.objects.get_or_create(username='admin', email='admin@example.com', defaults={'is_staff': True, 'is_superuser': True})
    if not user.is_superuser:
        user.is_superuser = True
        user.save()
    
    # Create a category
    category, created = Category.objects.get_or_create(name='Test Category', defaults={'description': 'Test'})
    
    print(f"Category ID: {category.id}")
    
    # Simulate frontend data with missing category
    data = {
        'name': 'Test Product V3',
        'description': 'Test Description',
        'price': '100.00',
        'category_id': 'undefined', # Simulate frontend sending "undefined"
        'inventory': '10',
        'is_active': 'true',
    }
    
    factory = APIRequestFactory()
    
    print("\n--- Test: Create Product with invalid category_id ---")
    request = factory.post('/api/products/', data, format='multipart')
    force_authenticate(request, user=user)
    view = ProductViewSet.as_view({'post': 'create'})
    
    try:
        response = view(request)
        print(f"Status: {response.status_code}")
        if response.status_code != 201:
            print(f"Error: {response.data}")
        else:
            print("Success!")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == '__main__':
    debug_create()
