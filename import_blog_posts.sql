-- Import blog posts to Render database
-- Schema mapping: local -> Render
-- comments_count -> comments

INSERT INTO blog_blogpost (
    id, title, slug, description, content, image, tags, avatar, date, 
    views, likes, comments, read_time, status, is_pinned, is_visible,
    created_at, updated_at, author_id, category_id, excerpt, published_at, comments_data
) VALUES 
(
    1, 
    'Săn Sale 11.11: Tổng Hợp Voucher Khủng & Quà Tặng Độc Quyền!', 
    'san-sale-1111-tong-hop-voucher-khung-qua-tang-oc-quyen', 
    'Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra.', 
    'Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra. Đây là cơ hội vàng để bạn sở hữu những món đồ yêu thích với giá hời nhất năm!', 
    'https://tinyurl.com/4dnsk5bw', 
    '["11.11", "Voucher", "Giảm Giá", "Flash Sale"]'::jsonb, 
    'https://i.pravatar.cc/150?img=1', 
    '2025-12-24'::date, 
    12800, 950, 2, '3 phút đọc', 'published', false, true,
    '2025-12-24 04:15:39.923672+00', '2025-12-24 04:15:39.923676+00', 
    9, 1, '', NOW(), '{}'::jsonb
),
(
    2, 
    'Trên Tay Siêu Phẩm: Tai Nghe Chống Ồn XYZ Mới Nhất 2025', 
    'tren-tay-sieu-pham-tai-nghe-chong-on-xyz-moi-nhat-2025', 
    'Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền?', 
    'Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền? Ngay từ cái nhìn đầu tiên, tai nghe XYZ 2025 đã gây ấn tượng mạnh với thiết kế tối giản nhưng không kém phần sang trọng.', 
    'https://tinyurl.com/mrxx3jp9', 
    '["Đánh giá", "Hàng mới", "Âm thanh", "Tech"]'::jsonb, 
    'https://i.pravatar.cc/150?img=2', 
    '2025-12-24'::date, 
    4500, 310, 1, '7 phút đọc', 'published', false, true,
    '2025-12-24 04:15:39.933014+00', '2025-12-24 04:15:39.933018+00', 
    9, 2, '', NOW(), '{}'::jsonb
),
(
    11, 
    'Test Post', 
    'test-post', 
    'test desc', 
    'test content', 
    '', 
    '[]'::jsonb, 
    '', 
    '2026-01-05'::date, 
    0, 0, 0, '', 'published', false, true,
    '2026-01-05 09:14:46.539301+00', '2026-01-05 09:14:46.539308+00', 
    2, 1, '', NOW(), '{}'::jsonb
),
(
    12, 
    'feefe', 
    'feefe', 
    'fefe', 
    '1111', 
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHj92DnmYlRfkWcc8uxqSLV-6MoBb4mevu6L-FSHi0jDI3UUy50EdbWGeKdClCTht983srSQ1kIkhS6Z8wQHc75DQmIKkKbNP0n6W-gfxPjA&s=10', 
    '["11"]'::jsonb, 
    '', 
    '2026-01-05'::date, 
    0, 0, 0, '5 phút đọc', 'published', false, true,
    '2026-01-05 09:17:59.050823+00', '2026-01-05 09:17:59.050829+00', 
    2, 6, '', NOW(), '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    image = EXCLUDED.image,
    tags = EXCLUDED.tags,
    avatar = EXCLUDED.avatar,
    date = EXCLUDED.date,
    views = EXCLUDED.views,
    likes = EXCLUDED.likes,
    comments = EXCLUDED.comments,
    read_time = EXCLUDED.read_time,
    status = EXCLUDED.status,
    is_pinned = EXCLUDED.is_pinned,
    is_visible = EXCLUDED.is_visible,
    updated_at = NOW(),
    author_id = EXCLUDED.author_id,
    category_id = EXCLUDED.category_id;

-- Reset sequence to max id
SELECT setval('blog_blogpost_id_seq', (SELECT MAX(id) FROM blog_blogpost));
