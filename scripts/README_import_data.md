# Hướng dẫn Import Sample Data cho GenCart

## Tổng quan
Script này sẽ import tất cả dữ liệu mẫu cần thiết cho ứng dụng GenCart, bao gồm:
- Người dùng mẫu
- Danh mục và sản phẩm
- Đơn hàng mẫu
- Bài viết blog
- Đánh giá sản phẩm
- Dữ liệu blockchain mẫu

## Cách chạy trên Render

### 1. Truy cập Render Dashboard
- Đăng nhập vào tài khoản Render
- Chọn service backend của bạn

### 2. Mở Shell Terminal
- Trong dashboard, click vào **Shell** tab
- Hoặc sử dụng Render CLI nếu đã cài đặt

### 3. Chạy script import
```bash
# Điều hướng đến thư mục backend
cd gencart_backend

# Chạy command import sample data
python manage.py import_sample_data --clear
```

### 4. Xác nhận hoàn thành
Script sẽ hiển thị tiến trình và thông báo khi hoàn thành.

## Chi tiết dữ liệu được tạo

### Người dùng
- 1 Admin user: `admin` / `admin123`
- 5 Regular users với thông tin đầy đủ

### Sản phẩm
- 6 Danh mục chính
- 50+ sản phẩm với giá và hình ảnh
- Kho hàng ngẫu nhiên

### Đơn hàng
- 50 đơn hàng mẫu
- Phân bổ đều cho các user
- Trạng thái thanh toán ngẫu nhiên

### Blog Posts
- Import từ file `blog_posts_data.json`
- Các bài viết công nghệ và review sản phẩm

### Đánh giá
- 100+ đánh giá mẫu
- Sentiment analysis tự động

## Lưu ý quan trọng

1. **Backup database**: Luôn backup dữ liệu trước khi chạy `--clear`
2. **Thời gian**: Script có thể mất 2-3 phút để hoàn thành
3. **Environment**: Đảm bảo `DJANGO_SETTINGS_MODULE` được set đúng
4. **Dependencies**: Đảm bảo tất cả packages đã được install

## Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra environment variables
echo $DATABASE_URL
```

### Lỗi permission
```bash
# Đảm bảo user có quyền admin
python manage.py createsuperuser
```

### Script không chạy
```bash
# Kiểm tra Python path
which python
python --version
```

## Sau khi import

1. Truy cập admin dashboard tại `/admin`
2. Đăng nhập với `admin` / `admin123`
3. Kiểm tra dữ liệu trong các section
4. Test checkout flow với user thông thường

## Import thủ công từng phần

Nếu cần import từng phần:

```bash
# Chỉ products
python manage.py seed_products --count=50

# Chỉ reviews
python manage.py seed_reviews --count=100

# Chỉ blockchain data
python manage.py create_sample_data
```