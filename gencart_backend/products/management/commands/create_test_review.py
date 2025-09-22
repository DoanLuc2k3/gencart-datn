from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product, Review

class Command(BaseCommand):
    help = 'Create a test review with Vietnamese text and persist to DB'

    def handle(self, *args, **options):
        User = get_user_model()
        user, _ = User.objects.get_or_create(username='persist_test_user')
        if not user.pk:
            user.set_password('testpass')
            user.save()

        category, _ = Category.objects.get_or_create(name='Persistent Category', slug='persistent-category')
        product, _ = Product.objects.get_or_create(
            name='Persistent Product',
            slug='persistent-product',
            defaults={
                'description': 'Product used for persisting test review',
                'price': '19.99',
                'category': category,
                'inventory': 5
            }
        )

        # Ensure the product has the correct category set (in case it existed without defaults)
        if product.category_id != category.id:
            product.category = category
            product.save()

        review, created = Review.objects.get_or_create(
            product=product,
            user=user,
            defaults={
                'rating': 5,
                'title': 'Tốt',
                'comment': 'sản phẩm tốt'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created review id={review.id}'))
        else:
            self.stdout.write(self.style.WARNING(f'Review already exists id={review.id}'))
