from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F

from .models import BlogCategory, BlogPost, BlogComment
from .serializers import (
    BlogCategorySerializer,
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateUpdateSerializer,
    BlogPostAdminSerializer,
    BlogCommentSerializer,
    BlogCommentCreateSerializer
)


class BlogCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Blog Categories
    - GET /api/blog/categories/ - List all categories
    - POST /api/blog/categories/ - Create category (admin)
    - GET /api/blog/categories/{id}/ - Get category detail
    - PUT/PATCH /api/blog/categories/{id}/ - Update category (admin)
    - DELETE /api/blog/categories/{id}/ - Delete category (admin)
    """
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Blog Posts
    - GET /api/blog/posts/ - List all published posts
    - POST /api/blog/posts/ - Create post (authenticated)
    - GET /api/blog/posts/{id}/ - Get post detail
    - PUT/PATCH /api/blog/posts/{id}/ - Update post (owner/admin)
    - DELETE /api/blog/posts/{id}/ - Delete post (owner/admin)
    
    Custom actions:
    - POST /api/blog/posts/{id}/like/ - Like/unlike a post
    - POST /api/blog/posts/{id}/view/ - Increment view count
    - GET /api/blog/posts/admin/ - List all posts for admin
    """
    queryset = BlogPost.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'is_pinned']
    search_fields = ['title', 'description', 'content', 'tags']
    ordering_fields = ['created_at', 'views', 'likes', 'title']
    ordering = ['-is_pinned', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        elif self.action == 'retrieve':
            return BlogPostDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogPostCreateUpdateSerializer
        elif self.action == 'admin_list':
            return BlogPostAdminSerializer
        return BlogPostDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Check if this is an admin request
        is_admin_request = self.request.query_params.get('admin', 'false').lower() == 'true'
        
        # For non-admin requests, only show published posts
        if not is_admin_request and not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(status='published')
        
        # Filter by category name (for frontend compatibility)
        category_name = self.request.query_params.get('category_name')
        if category_name and category_name != 'all':
            queryset = queryset.filter(category__name=category_name)
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Auto increment view when accessing detail
        BlogPost.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        """Toggle like on a post"""
        post = self.get_object()
        # Simple like increment (for anonymous users)
        # In production, you'd track user likes to prevent multiple likes
        action_type = request.data.get('action', 'like')
        
        if action_type == 'unlike':
            post.likes = max(0, post.likes - 1)
        else:
            post.likes = F('likes') + 1
        
        post.save(update_fields=['likes'])
        post.refresh_from_db()
        
        return Response({
            'status': 'success',
            'likes': post.likes,
            'action': action_type
        })

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """Increment view count"""
        post = self.get_object()
        post.views = F('views') + 1
        post.save(update_fields=['views'])
        post.refresh_from_db()
        
        return Response({
            'status': 'success',
            'views': post.views
        })

    @action(detail=False, methods=['get'], url_path='admin')
    def admin_list(self, request):
        """Get all posts for admin management"""
        queryset = BlogPost.objects.all().order_by('-created_at')
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        serializer = BlogPostAdminSerializer(queryset, many=True)
        return Response(serializer.data)


class BlogCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Blog Comments
    - GET /api/blog/comments/ - List comments
    - POST /api/blog/comments/ - Create comment
    - GET /api/blog/comments/{id}/ - Get comment detail
    - PUT/PATCH /api/blog/comments/{id}/ - Update comment
    - DELETE /api/blog/comments/{id}/ - Delete comment
    
    Filter by post:
    - GET /api/blog/comments/?post={post_id}
    """
    queryset = BlogComment.objects.all()
    permission_classes = [AllowAny]  # Allow anonymous comments
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return BlogCommentCreateSerializer
        return BlogCommentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Return full comment data
        response_serializer = BlogCommentSerializer(comment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='post/(?P<post_id>[^/.]+)')
    def by_post(self, request, post_id=None):
        """Get all comments for a specific post"""
        comments = self.get_queryset().filter(post_id=post_id)
        serializer = BlogCommentSerializer(comments, many=True)
        return Response(serializer.data)
