from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Category, Product, Review


class ReviewCreationTest(TestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(username='testuser', password='testpass')
		self.category = Category.objects.create(name='Test Category', slug='test-category')
		self.product = Product.objects.create(
			name='Test Product',
			slug='test-product',
			description='A product for testing',
			price='9.99',
			category=self.category,
			inventory=10
		)

	def test_create_vietnamese_review(self):
		"""Create a review with Vietnamese text 'sản phẩm tốt' and save to DB"""
		review = Review.objects.create(
			product=self.product,
			user=self.user,
			rating=5,
			title='Tốt',
			comment='sản phẩm tốt'
		)

		# Refresh from DB and assert
		fetched = Review.objects.get(id=review.id)
		self.assertEqual(fetched.comment, 'sản phẩm tốt')
		self.assertEqual(fetched.rating, 5)
		self.assertEqual(fetched.product.id, self.product.id)
