"""
Test script to measure Order API query performance
Run this after starting Django server to see query optimization results
"""
import time
import requests
from django.test.utils import override_settings
from django.db import connection, reset_queries

# Configuration
API_BASE_URL = "http://localhost:8000/api"
TOKEN = None  # Add your admin token here

def get_auth_headers():
    """Get authorization headers"""
    if TOKEN:
        return {"Authorization": f"Bearer {TOKEN}"}
    return {}

def test_orders_endpoint():
    """Test /api/orders/ endpoint performance"""
    print("\n" + "="*60)
    print("Testing Orders List Endpoint")
    print("="*60)
    
    # Reset queries
    reset_queries()
    
    # Measure time
    start_time = time.time()
    
    response = requests.get(
        f"{API_BASE_URL}/orders/",
        headers=get_auth_headers()
    )
    
    end_time = time.time()
    elapsed = end_time - start_time
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Time: {elapsed:.3f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and 'results' in data:
            print(f"Total Orders: {data.get('count', 0)}")
            print(f"Orders in Response: {len(data['results'])}")
        else:
            print(f"Orders in Response: {len(data)}")
    
    # Show queries if DEBUG=True
    if hasattr(connection, 'queries'):
        print(f"Database Queries: {len(connection.queries)}")
        if len(connection.queries) > 0:
            print("\nFirst 5 queries:")
            for i, query in enumerate(connection.queries[:5], 1):
                print(f"{i}. {query['sql'][:100]}...")

def test_user_orders_endpoint(user_id=1):
    """Test /api/orders/by-user/{user_id}/ endpoint performance"""
    print("\n" + "="*60)
    print(f"Testing User Orders Endpoint (User ID: {user_id})")
    print("="*60)
    
    # Reset queries
    reset_queries()
    
    # Measure time
    start_time = time.time()
    
    response = requests.get(
        f"{API_BASE_URL}/orders/by-user/{user_id}/",
        headers=get_auth_headers()
    )
    
    end_time = time.time()
    elapsed = end_time - start_time
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Time: {elapsed:.3f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and 'results' in data:
            print(f"Total Orders: {data.get('count', 0)}")
            print(f"Orders in Response: {len(data['results'])}")
        else:
            print(f"Orders in Response: {len(data)}")
    
    # Show queries if DEBUG=True
    if hasattr(connection, 'queries'):
        print(f"Database Queries: {len(connection.queries)}")

def main():
    """Run performance tests"""
    print("\n🚀 Order API Performance Test")
    print("="*60)
    print("Make sure Django DEBUG=True to see query count")
    print("Add your admin token to TOKEN variable for authenticated tests")
    print("="*60)
    
    # Test orders list
    test_orders_endpoint()
    
    # Test user-specific orders
    test_user_orders_endpoint(user_id=1)
    
    print("\n" + "="*60)
    print("✅ Performance Test Complete")
    print("="*60)
    print("\nOptimizations applied:")
    print("1. select_related('user', 'shipping_address', 'billing_address')")
    print("2. prefetch_related('items__product', 'items__product__category')")
    print("\nExpected improvement:")
    print("- Before: N+1 queries (1 + orders_count * 4+ queries)")
    print("- After: 4-5 queries total (regardless of orders count)")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
