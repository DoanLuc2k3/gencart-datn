import os
import django
import json
from datetime import datetime

# Set Render database
os.environ['DATABASE_URL'] = 'postgresql://gencart_db_user:Kfj49DlBD8c4u2WJeBol8jy2OWbCQn9Y@dpg-d5e7tqlactks73c0q1q0-a.oregon-postgres.render.com/gencart_db'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gencart_backend.settings')
django.setup()

from blog.models import BlogPost, BlogCategory
from django.contrib.auth import get_user_model
from django.utils import timezone
from dateutil import parser

User = get_user_model()

# Load data
with open('blog_posts_data.json', 'r', encoding='utf-8') as f:
    posts = json.load(f)

print(f'Loaded {len(posts)} posts from JSON')
print(f'Current posts in Render DB: {BlogPost.objects.count()}')

# Check users
users = User.objects.all()
print(f'\nUsers in Render DB: {users.count()}')
for u in users[:5]:
    print(f'  - ID: {u.id}, Username: {u.username}')

# Check categories
categories = BlogCategory.objects.all()
print(f'\nCategories in Render DB: {categories.count()}')
for c in categories:
    print(f'  - ID: {c.id}, Name: {c.name}')

# Import posts
print('\n--- Importing Posts ---')
imported = 0
for p in posts:
    try:
        # Check if author exists, if not use first admin
        author_id = p['author_id']
        if not User.objects.filter(id=author_id).exists():
            admin = User.objects.filter(is_superuser=True).first()
            if admin:
                author_id = admin.id
                print(f"  Author {p['author_id']} not found, using admin {admin.username}")
            else:
                print(f"  No admin found, skipping post {p['title'][:30]}")
                continue

        # Check if category exists
        if not BlogCategory.objects.filter(id=p['category_id']).exists():
            print(f"  Category {p['category_id']} not found, skipping post {p['title'][:30]}")
            continue

        # Check if post already exists
        if BlogPost.objects.filter(id=p['id']).exists():
            print(f"  Post ID {p['id']} already exists, skipping")
            continue

        # Parse dates
        date_val = parser.parse(p['date']) if p['date'] else timezone.now()
        created_at = parser.parse(p['created_at']) if p['created_at'] else timezone.now()
        updated_at = parser.parse(p['updated_at']) if p['updated_at'] else timezone.now()

        post = BlogPost(
            id=p['id'],
            title=p['title'],
            slug=p['slug'],
            description=p['description'],
            content=p['content'],
            image=p['image'],
            tags=p['tags'],
            avatar=p['avatar'],
            date=date_val,
            views=p['views'],
            likes=p['likes'],
            comments_count=p['comments_count'],
            read_time=p['read_time'],
            status=p['status'],
            is_pinned=p['is_pinned'],
            created_at=created_at,
            updated_at=updated_at,
            author_id=author_id,
            category_id=p['category_id'],
            excerpt=p['excerpt']
        )
        post.save()
        imported += 1
        print(f"  ✓ Imported: {p['title'][:50]}")
    except Exception as e:
        print(f"  ✗ Error importing '{p['title'][:30]}': {e}")

print(f'\n=== Done! Imported {imported} posts ===')
print(f'Total posts in Render DB now: {BlogPost.objects.count()}')
