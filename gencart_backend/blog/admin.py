from django.contrib import admin
from .models import BlogCategory, BlogPost, BlogComment


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'get_author_name', 'status', 'is_pinned', 'views', 'likes', 'created_at']
    list_filter = ['status', 'is_pinned', 'category', 'created_at']
    search_fields = ['title', 'description', 'content']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Anonymous'
    get_author_name.short_description = 'Tác giả'
    
    fieldsets = (
        ('Nội dung', {
            'fields': ('title', 'slug', 'description', 'content', 'image')
        }),
        ('Phân loại', {
            'fields': ('category', 'tags')
        }),
        ('Tác giả', {
            'fields': ('author', 'avatar')
        }),
        ('Trạng thái', {
            'fields': ('status', 'is_pinned', 'read_time')
        }),
        ('Thống kê', {
            'fields': ('views', 'likes', 'comments_count'),
            'classes': ('collapse',)
        }),
        ('Thời gian', {
            'fields': ('date',),
            'classes': ('collapse',)
        }),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'is_approved', 'date']
    list_filter = ['is_approved', 'date']
    search_fields = ['author', 'content', 'post__title']
    date_hierarchy = 'date'
    ordering = ['-date']
