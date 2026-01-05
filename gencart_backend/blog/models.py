from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils import timezone
import uuid

User = get_user_model()


class BlogCategory(models.Model):
    """Model for blog categories"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blog_blogcategory'
        managed = False  # Table already exists
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    """Model for blog posts"""
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('published', 'Đã xuất bản'),
    ]

    title = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, default='')
    content = models.TextField(default='')
    excerpt = models.TextField(blank=True, default='')
    image = models.CharField(max_length=200, blank=True)
    
    # Category relationship
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    
    # Author info
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blog_posts'
    )
    avatar = models.CharField(max_length=200, blank=True, default='')
    
    # Tags stored as JSON array
    tags = models.JSONField(default=list, blank=True)
    
    # Status and visibility
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    is_pinned = models.BooleanField(default=False)
    
    # Stats
    views = models.IntegerField(default=0)
    likes = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0, db_column='comments_count')
    
    # Read time
    read_time = models.CharField(max_length=50, blank=True, default='')
    
    # Timestamps
    date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'blog_blogpost'
        managed = False  # Table already exists
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            if not base_slug:
                base_slug = str(uuid.uuid4())[:8]
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        if not self.date:
            self.date = timezone.now()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class BlogComment(models.Model):
    """Model for blog comments"""
    post = models.ForeignKey(
        BlogPost,
        on_delete=models.CASCADE,
        related_name='post_comments'
    )
    # author is CharField in DB, not ForeignKey
    author = models.CharField(max_length=100)
    avatar = models.CharField(max_length=200, blank=True, default='')
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)

    class Meta:
        db_table = 'blog_blogcomment'
        managed = False  # Table already exists
        verbose_name = 'Blog Comment'
        verbose_name_plural = 'Blog Comments'
        ordering = ['-date']

    def __str__(self):
        return f"Comment by {self.author} on {self.post.title}"
