from rest_framework import serializers
from .models import BlogCategory, BlogPost, BlogComment


class BlogCategorySerializer(serializers.ModelSerializer):
    """Serializer for BlogCategory model"""
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = [
            'id', 'name', 'slug', 'description',
            'posts_count', 'created_at'
        ]
        read_only_fields = ['slug', 'created_at']

    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogCommentSerializer(serializers.ModelSerializer):
    """Serializer for BlogComment model"""
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        fields = [
            'id', 'post', 'author', 'avatar',
            'content', 'date', 'created_at', 'is_approved'
        ]

    def get_created_at(self, obj):
        """Format date for frontend compatibility"""
        return obj.date.strftime('%Y-%m-%d %H:%M') if obj.date else None


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    class Meta:
        model = BlogComment
        fields = ['post', 'author', 'avatar', 'content']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Serializer for listing blog posts (lightweight)"""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    comments = serializers.IntegerField(source='comments_count', read_only=True)
    commentsData = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'description', 'image',
            'category', 'category_name', 'author_name', 'avatar',
            'tags', 'status', 'is_pinned',
            'views', 'likes', 'comments', 'commentsData',
            'read_time', 'date', 'created_at'
        ]

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Anonymous'

    def get_commentsData(self, obj):
        comments = obj.post_comments.all()[:10]
        return BlogCommentSerializer(comments, many=True).data


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog post detail view"""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    comments = serializers.IntegerField(source='comments_count', read_only=True)
    commentsData = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'description', 'content', 'image',
            'category', 'category_name', 'author', 'avatar',
            'tags', 'status', 'is_pinned',
            'views', 'likes', 'comments', 'commentsData',
            'read_time', 'date', 'created_at', 'updated_at'
        ]

    def get_author(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Anonymous'

    def get_commentsData(self, obj):
        comments = obj.post_comments.all()
        return BlogCommentSerializer(comments, many=True).data


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating blog posts"""
    category = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'description', 'content', 'image',
            'category', 'avatar', 'tags',
            'status', 'is_pinned', 'read_time', 'date'
        ]

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        else:
            # Auto assign first admin user or create default
            admin_user = User.objects.filter(is_staff=True).first()
            if admin_user:
                validated_data['author'] = admin_user
        
        return super().create(validated_data)


class BlogPostAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin management with full control"""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    comments = serializers.IntegerField(source='comments_count', read_only=True)
    commentsData = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Anonymous'

    def get_commentsData(self, obj):
        comments = obj.post_comments.all()[:20]
        return BlogCommentSerializer(comments, many=True).data
