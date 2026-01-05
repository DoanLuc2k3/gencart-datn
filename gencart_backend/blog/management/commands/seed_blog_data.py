"""
Management command to create sample blog data
Run with: python manage.py seed_blog_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blog.models import BlogCategory, BlogPost, BlogComment
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample blog data for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample blog data...')
        
        # Get or create admin user
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        # Create categories
        categories_data = [
            {'name': 'Khuyến Mãi', 'description': 'Thông tin về các chương trình khuyến mãi'},
            {'name': 'Sản Phẩm', 'description': 'Review và giới thiệu sản phẩm mới'},
            {'name': 'Sự Kiện', 'description': 'Các sự kiện và hoạt động của shop'},
            {'name': 'Về Chúng Tôi', 'description': 'Thông tin về công ty'},
            {'name': 'Tư Vấn', 'description': 'Hướng dẫn và tư vấn mua sắm'},
            {'name': 'Mẹo Hay', 'description': 'Mẹo vặt hữu ích'},
            {'name': 'Thời Trang', 'description': 'Xu hướng thời trang'},
            {'name': 'Thông Báo', 'description': 'Thông báo từ shop'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat, created = BlogCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories[cat_data['name']] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.name}')
        
        # Create blog posts
        posts_data = [
            {
                'title': 'Săn Sale 11.11: Tổng Hợp Voucher Khủng & Quà Tặng Độc Quyền!',
                'description': 'Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra.',
                'content': '''<div class="post-content-detail">
                    <p>Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra. Đây là cơ hội vàng để bạn sở hữu những món đồ yêu thích với giá hời nhất năm!</p>
                    <h2>Các Voucher "Bí Mật" Sắp Lên Sóng</h2>
                    <p>Hãy chuẩn bị sẵn sàng, vì đúng 0h ngày 11.11, các voucher sau sẽ chính thức có hiệu lực:</p>
                    <ul>
                        <li><strong>BIGSALE11:</strong> Giảm 50% (tối đa 100k) cho đơn hàng từ 200k.</li>
                        <li><strong>FREESHIPMAX:</strong> Miễn phí vận chuyển toàn quốc cho mọi đơn hàng.</li>
                        <li><strong>QUATANGKHUNG:</strong> Tặng 1 tai nghe trị giá 500k cho 100 đơn hàng đầu tiên.</li>
                    </ul>
                    <h2>Làm Sao Để Săn Sale Hiệu Quả?</h2>
                    <p>Bí kíp là hãy thêm sản phẩm vào giỏ hàng ngay từ bây giờ. Khi đồng hồ điểm 0h, bạn chỉ cần áp mã và thanh toán.</p>
                </div>''',
                'image': 'https://tinyurl.com/4dnsk5bw',
                'category': 'Khuyến Mãi',
                'tags': ['11.11', 'Voucher', 'Giảm Giá', 'Flash Sale'],
                'author_name': 'Ban Quản Trị',
                'avatar': 'https://i.pravatar.cc/150?img=1',
                'views': 12800,
                'likes': 950,
                'status': 'published',
                'is_pinned': True,
            },
            {
                'title': 'Trên Tay Siêu Phẩm: Tai Nghe Chống Ồn XYZ Mới Nhất 2025',
                'description': 'Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền?',
                'content': '''<div class="post-content-detail">
                    <p>Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền?</p>
                    <h2>Thiết Kế và Cảm Giác Đeo</h2>
                    <p>Vỏ hộp được làm từ vật liệu tái chế, một điểm cộng lớn. Tai nghe có trọng lượng nhẹ đáng kinh ngạc.</p>
                    <h2>Chất Lượng Âm Thanh & Chống Ồn (ANC)</h2>
                    <p>Đây là phần "ăn tiền" nhất. Chất âm của XYZ 2025 rất cân bằng. Bass đánh sâu, uy lực nhưng không lấn át dải mid.</p>
                </div>''',
                'image': 'https://tinyurl.com/mrxx3jp9',
                'category': 'Sản Phẩm',
                'tags': ['Đánh giá', 'Hàng mới', 'Âm thanh', 'Tech'],
                'author_name': 'Tech Reviewer',
                'avatar': 'https://i.pravatar.cc/150?img=2',
                'views': 4500,
                'likes': 310,
                'status': 'published',
            },
            {
                'title': 'Chào Đón Cửa Hàng Mới Tại Hà Nội: Tuần Lễ Khai Trương Rộn Ràng',
                'description': 'Ghé thăm không gian mua sắm mới của chúng tôi tại 123 Phố Huế. Rất nhiều quà tặng check-in và giảm giá đặc biệt!',
                'content': '''<div class="post-content-detail">
                    <p>Người dân thủ đô ơi! Chúng tôi vô cùng hào hứng thông báo cửa hàng flagship mới nhất của chúng tôi sẽ chính thức khai trương tại <strong>123 Phố Huế, Quận Hai Bà Trưng, Hà Nội</strong>.</p>
                    <h2>Không Gian Mua Sắm Đẳng Cấp</h2>
                    <p>Với diện tích lên đến 500m², cửa hàng mới được thiết kế theo concept hiện đại, rộng rãi.</p>
                </div>''',
                'image': 'https://tinyurl.com/2mdtv7c6',
                'category': 'Sự Kiện',
                'tags': ['Khai Trương', 'Cửa Hàng Mới', 'Hà Nội', 'Offline'],
                'author_name': 'Team Marketing',
                'avatar': 'https://i.pravatar.cc/150?img=3',
                'views': 3200,
                'likes': 180,
                'status': 'published',
            },
            {
                'title': 'Hành Trình Của Chúng Tôi: 5 Năm Mang Sản Phẩm Chất Lượng Đến Tay Bạn',
                'description': 'Nhìn lại 5 năm thành lập và phát triển, từ một ý tưởng nhỏ đến thương hiệu được tin cậy.',
                'content': '''<div class="post-content-detail">
                    <p>5 năm trước, chúng tôi bắt đầu chỉ với một ý tưởng đơn giản: mang đến những sản phẩm công nghệ chất lượng với mức giá hợp lý cho người tiêu dùng Việt Nam.</p>
                    <h2>Từ Ga-ra Đến Thương Hiệu Toàn Quốc</h2>
                    <p>Những ngày đầu tiên là vô vàn khó khăn. Nhưng với niềm tin và sự ủng hộ của những khách hàng đầu tiên, chúng tôi đã dần dần lớn mạnh.</p>
                </div>''',
                'image': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
                'category': 'Về Chúng Tôi',
                'tags': ['Thương Hiệu', 'Câu Chuyện', 'Kỷ Niệm'],
                'author_name': 'Sáng Lập Viên',
                'avatar': 'https://i.pravatar.cc/150?img=4',
                'views': 1500,
                'likes': 90,
                'status': 'published',
            },
            {
                'title': 'Cẩm Nang Chọn Quà 20/11: Gợi Ý Quà Tặng Ý Nghĩa Cho Thầy Cô',
                'description': 'Ngày Nhà giáo Việt Nam đang đến gần. Cùng tham khảo 10+ gợi ý quà tặng thiết thực và ý nghĩa nhất.',
                'content': '''<div class="post-content-detail">
                    <p>Ngày 20/11 là dịp để chúng ta bày tỏ lòng biết ơn sâu sắc đến những người thầy, người cô đã tận tụy dìu dắt.</p>
                    <h2>Quà Tặng Sức Khỏe</h2>
                    <p>Thầy cô thường phải đứng lớp và nói nhiều. Các sản phẩm tốt cho sức khỏe như yến sào sẽ là món quà vô cùng thiết thực.</p>
                </div>''',
                'image': 'https://tinyurl.com/3dk8nw3b',
                'category': 'Tư Vấn',
                'tags': ['Quà Tặng', '20/11', 'Cẩm Nang', 'Gợi Ý'],
                'author_name': 'Content Team',
                'avatar': 'https://i.pravatar.cc/150?img=5',
                'views': 9100,
                'likes': 720,
                'status': 'published',
            },
        ]
        
        for post_data in posts_data:
            category = categories.get(post_data.pop('category'))
            tags = post_data.pop('tags', [])
            
            post, created = BlogPost.objects.get_or_create(
                title=post_data['title'],
                defaults={
                    **post_data,
                    'category': category,
                    'tags': tags,
                    'author': admin_user,
                    'published_at': timezone.now(),
                }
            )
            if created:
                self.stdout.write(f'  Created post: {post.title[:50]}...')
        
        # Create sample comments
        posts = BlogPost.objects.all()[:3]
        comments_data = [
            {'author_name': 'User123', 'avatar': 'https://i.pravatar.cc/150?img=11', 'content': 'Tuyệt vời! Đã lưu hết voucher, chờ 0h săn thôi!'},
            {'author_name': 'Săn Sale Pro', 'avatar': 'https://i.pravatar.cc/150?img=12', 'content': 'Mong shop ra thêm mã freeship max 😭'},
            {'author_name': 'AudioPhile', 'avatar': 'https://i.pravatar.cc/150?img=14', 'content': 'Chống ồn có ngon hơn con Sony XM5 không ad?'},
        ]
        
        for i, post in enumerate(posts):
            if i < len(comments_data):
                comment, created = BlogComment.objects.get_or_create(
                    post=post,
                    content=comments_data[i]['content'],
                    defaults={
                        'author_name': comments_data[i]['author_name'],
                        'avatar': comments_data[i]['avatar'],
                    }
                )
                if created:
                    self.stdout.write(f'  Created comment on: {post.title[:30]}...')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {BlogCategory.objects.count()} categories, {BlogPost.objects.count()} posts, {BlogComment.objects.count()} comments'))
