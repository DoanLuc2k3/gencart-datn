from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogCategoryViewSet, BlogPostViewSet, BlogCommentViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'categories', BlogCategoryViewSet, basename='blog-category')
router.register(r'posts', BlogPostViewSet, basename='blog-post')
router.register(r'comments', BlogCommentViewSet, basename='blog-comment')

urlpatterns = [
    path('', include(router.urls)),
]

"""
API Endpoints:

Categories:
- GET    /api/blog/categories/           - List all categories
- POST   /api/blog/categories/           - Create category
- GET    /api/blog/categories/{id}/      - Get category detail
- PUT    /api/blog/categories/{id}/      - Update category
- PATCH  /api/blog/categories/{id}/      - Partial update category
- DELETE /api/blog/categories/{id}/      - Delete category

Posts:
- GET    /api/blog/posts/                - List published posts
- POST   /api/blog/posts/                - Create post
- GET    /api/blog/posts/{id}/           - Get post detail (auto increment view)
- PUT    /api/blog/posts/{id}/           - Update post
- PATCH  /api/blog/posts/{id}/           - Partial update post
- DELETE /api/blog/posts/{id}/           - Delete post
- POST   /api/blog/posts/{id}/like/      - Like/unlike post
- POST   /api/blog/posts/{id}/view/      - Increment view count
- GET    /api/blog/posts/admin/          - List all posts (admin)

Comments:
- GET    /api/blog/comments/             - List comments
- POST   /api/blog/comments/             - Create comment
- GET    /api/blog/comments/{id}/        - Get comment detail
- PUT    /api/blog/comments/{id}/        - Update comment
- PATCH  /api/blog/comments/{id}/        - Partial update comment
- DELETE /api/blog/comments/{id}/        - Delete comment
- GET    /api/blog/comments/post/{post_id}/ - Get comments by post

Query Parameters:
- Posts: ?category=1&status=published&is_visible=true&search=keyword&ordering=-created_at
- Posts: ?category_name=Khuyến Mãi (filter by category name)
- Posts: ?admin=true (get all posts including drafts)
- Comments: ?post=1&is_approved=true
"""
