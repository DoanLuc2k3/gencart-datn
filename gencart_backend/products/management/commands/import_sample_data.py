from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from products.models import Category, Product, Review
from orders.models import Order, OrderItem
from users.models import Address
from blog.models import BlogPost, BlogCategory
from decimal import Decimal
import json
import os
import random
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = "Import all sample data for the application"

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before importing')

    def handle(self, *args, **options):
        clear = options['clear']

        if clear:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_existing_data()

        self.stdout.write(self.style.SUCCESS('Starting sample data import...'))

        # 1. Create admin user if not exists
        self.create_admin_user()

        # 2. Seed products and categories
        self.stdout.write('Seeding products...')
        call_command('seed_products', count=50, clear=False)

        # 3. Create sample users
        self.create_sample_users()

        # 4. Create sample orders
        self.create_sample_orders()

        # 5. Import blog posts
        self.import_blog_posts()

        # 6. Seed reviews
        self.stdout.write('Seeding reviews...')
        call_command('seed_reviews', count=100, clear=False)

        # 7. Create blockchain sample data
        self.create_blockchain_data()

        self.stdout.write(self.style.SUCCESS('Sample data import completed!'))

    def clear_existing_data(self):
        """Clear existing data"""
        Review.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Product.objects.filter(is_active=True).update(is_active=False)  # Soft delete
        BlogPost.objects.all().delete()
        Address.objects.all().delete()
        # Keep categories and users

    def create_admin_user(self):
        """Create admin user"""
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@gencart.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f'Created admin user: {admin.username}')

    def create_sample_users(self):
        """Create sample regular users"""
        sample_users = [
            {'username': 'user1', 'email': 'user1@example.com', 'first_name': 'John', 'last_name': 'Doe'},
            {'username': 'user2', 'email': 'user2@example.com', 'first_name': 'Jane', 'last_name': 'Smith'},
            {'username': 'user3', 'email': 'user3@example.com', 'first_name': 'Bob', 'last_name': 'Johnson'},
            {'username': 'user4', 'email': 'user4@example.com', 'first_name': 'Alice', 'last_name': 'Williams'},
            {'username': 'user5', 'email': 'user5@example.com', 'first_name': 'Charlie', 'last_name': 'Brown'},
        ]

        for user_data in sample_users:
            if not User.objects.filter(username=user_data['username']).exists():
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password='password123',
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name']
                )
                # Create address for user
                Address.objects.get_or_create(
                    user=user,
                    defaults={
                        'address_type': 'shipping',
                        'street_address': f'{random.randint(1,999)} Sample St',
                        'city': 'Ho Chi Minh City',
                        'state': 'Ho Chi Minh',
                        'country': 'Vietnam',
                        'zip_code': f'{random.randint(70000,79999)}'
                    }
                )
                self.stdout.write(f'Created user: {user.username}')

    def create_sample_orders(self):
        """Create sample orders"""
        users = User.objects.filter(is_staff=False)
        products = Product.objects.filter(is_active=True)[:20]  # Get first 20 products

        if not users.exists() or not products.exists():
            self.stdout.write(self.style.WARNING('Not enough users or products to create orders'))
            return

        orders_created = 0
        for _ in range(50):  # Create 50 sample orders
            user = random.choice(users)
            num_items = random.randint(1, 5)
            order_items = random.sample(list(products), num_items)

            # Create order
            total_amount = sum(
                (item.discount_price or item.price) * random.randint(1, 3)
                for item in order_items
            )

            # Get or create address
            address, _ = Address.objects.get_or_create(
                user=user,
                defaults={
                    'address_type': 'shipping',
                    'street_address': f'{random.randint(1,999)} Order St',
                    'city': 'Ho Chi Minh City',
                    'state': 'Ho Chi Minh',
                    'country': 'Vietnam',
                    'zip_code': f'{random.randint(70000,79999)}'
                }
            )

            order = Order.objects.create(
                user=user,
                shipping_address=address,
                billing_address=address,
                total_amount=total_amount,
                shipping_cost=Decimal('5.00'),
                payment_status=random.choice([True, False]),
                created_at=datetime.now() - timedelta(days=random.randint(0, 365))
            )

            # Create order items
            for product in order_items:
                quantity = random.randint(1, 3)
                price = product.discount_price or product.price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )

            orders_created += 1

        self.stdout.write(f'Created {orders_created} sample orders')

    def import_blog_posts(self):
        """Import blog posts from JSON file"""
        json_file = os.path.join(os.path.dirname(__file__), '../../../blog_posts_data.json')

        if not os.path.exists(json_file):
            self.stdout.write(self.style.WARNING('Blog posts JSON file not found'))
            return

        with open(json_file, 'r', encoding='utf-8') as f:
            blog_data = json.load(f)

        # Create default blog category if not exists
        category, _ = BlogCategory.objects.get_or_create(
            name='Technology',
            defaults={'slug': 'technology', 'description': 'Tech news and reviews'}
        )

        # Get admin user
        admin = User.objects.filter(is_staff=True).first()
        if not admin:
            admin = User.objects.first()

        imported = 0
        for post_data in blog_data:
            if not BlogPost.objects.filter(title=post_data['title']).exists():
                BlogPost.objects.create(
                    title=post_data['title'],
                    slug=post_data['slug'],
                    description=post_data['description'],
                    content=post_data['content'],
                    image=post_data.get('image', ''),
                    tags=post_data.get('tags', []),
                    avatar=post_data.get('avatar', ''),
                    date=post_data.get('date', datetime.now()),
                    views=post_data.get('views', 0),
                    likes=post_data.get('likes', 0),
                    comments=post_data.get('comments_count', 0),
                    read_time=post_data.get('read_time', ''),
                    status=post_data.get('status', 'published'),
                    is_pinned=post_data.get('is_pinned', False),
                    is_visible=post_data.get('is_visible', True),
                    author=admin,
                    category=category,
                    excerpt=post_data.get('excerpt', ''),
                    published_at=post_data.get('published_at', datetime.now())
                )
                imported += 1

        self.stdout.write(f'Imported {imported} blog posts')

    def create_blockchain_data(self):
        """Create sample blockchain data"""
        try:
            call_command('create_sample_data')
            self.stdout.write('Blockchain sample data created')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Failed to create blockchain data: {e}'))