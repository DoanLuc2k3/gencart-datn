import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Input, Tag, Button, Pagination, Avatar, Space, Select, Badge, Tooltip, Empty, Modal, List, Form
} from 'antd';
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SendOutlined
} from '@ant-design/icons';
import '../user-css/Blog.css';
// Removed i18n hooks to show Vietnamese only


const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const initialMockPosts = [
  {
    id: 1,
    title: 'Săn Sale 11.11: Tổng Hợp Voucher Khủng & Quà Tặng Độc Quyền!',
    description: 'Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra.',
    image: 'https://tinyurl.com/4dnsk5bw',
    category: 'Khuyến Mãi',
    tags: ['11.11', 'Voucher', 'Giảm Giá', 'Flash Sale'],
    author: 'Ban Quản Trị',
    avatar: 'https://i.pravatar.cc/150?img=1',
    date: '2025-11-05',
    views: 12800,
    likes: 950,
    comments: 2,
    readTime: '3 phút đọc',
    content: (
        <div className="post-content-detail">
          <p>Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra. Đây là cơ hội vàng để bạn sở hữu những món đồ yêu thích với giá hời nhất năm!</p>
          <h2>Các Voucher "Bí Mật" Sắp Lên Sóng</h2>
          <p>Hãy chuẩn bị sẵn sàng, vì đúng 0h ngày 11.11, các voucher sau sẽ chính thức có hiệu lực:</p>
          <ul>
            <li><strong>BIGSALE11:</strong> Giảm 50% (tối đa 100k) cho đơn hàng từ 200k.</li>
            <li><strong>FREESHIPMAX:</strong> Miễn phí vận chuyển toàn quốc cho mọi đơn hàng.</li>
            <li><strong>QUATANGKHUNG:</strong> Tặng 1 tai nghe trị giá 500k cho 100 đơn hàng đầu tiên.</li>
            <li><strong>FOLLOWSHOP:</strong> Giảm ngay 20k khi theo dõi gian hàng.</li>
          </ul>
          <h2>Làm Sao Để Săn Sale Hiệu Quả?</h2>
          <p>Bí kíp là hãy thêm sản phẩm vào giỏ hàng ngay từ bây giờ. Khi đồng hồ điểm 0h, bạn chỉ cần áp mã và thanh toán. Đừng quên rủ bạn bè cùng săn sale để tăng thêm niềm vui! Chúc bạn có một mùa mua sắm bội thu!</p>
        </div>
    ),
    commentsData: [
      {
        author: 'User123',
        avatar: 'https://i.pravatar.cc/150?img=11',
        content: 'Tuyệt vời! Đã lưu hết voucher, chờ 0h săn thôi!',
        date: '2025-11-05 10:30',
      },
      {
        author: 'Săn Sale Pro',
        avatar: 'https://i.pravatar.cc/150?img=12',
        content: 'Mong shop ra thêm mã freeship max 😭',
        date: '2025-11-05 11:15',
      },
    ]
  },
  {
    id: 2,
    title: 'Trên Tay Siêu Phẩm: Tai Nghe Chống Ồn XYZ Mới Nhất 2025',
    description: 'Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền?',
    image: 'https://tinyurl.com/mrxx3jp9',
    category: 'Sản Phẩm',
    tags: ['Đánh giá', 'Hàng mới', 'Âm thanh', 'Tech'],
    author: 'Tech Reviewer',
    avatar: 'https://i.pravatar.cc/150?img=2',
    date: '2025-11-04',
    views: 4500,
    likes: 310,
    comments: 1,
    readTime: '7 phút đọc',
    content: (
      <div className="post-content-detail">
        <p>Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền? Ngay từ cái nhìn đầu tiên, tai nghe XYZ 2025 đã gây ấn tượng mạnh với thiết kế tối giản nhưng không kém phần sang trọng.</p>
        <h2>Thiết Kế và Cảm Giác Đeo</h2>
        <p>Vỏ hộp được làm từ vật liệu tái chế, một điểm cộng lớn. Tai nghe có trọng lượng nhẹ đáng kinh ngạc, cảm giác đeo rất thoải mái, gần như không cảm nhận được sức nặng ngay cả khi sử dụng trong nhiều giờ liền. Phần đệm tai bằng da protein mềm mại, ôm khít tai, giúp tăng cường khả năng chống ồn thụ động.</p>
        <h2>Chất Lượng Âm Thanh & Chống Ồn (ANC)</h2>
        <p>Đây là phần "ăn tiền" nhất. Chất âm của XYZ 2025 rất cân bằng. Bass đánh sâu, uy lực nhưng không lấn át dải mid. Dải treble trong trẻo, chi tiết. Khả năng chống ồn chủ động (ANC) thực sự xuất sắc, lọc bỏ gần như 95% tiếng ồn môi trường như tiếng động cơ, tiếng điều hòa.</p>
        <h2>Kết Luận</h2>
        <p>Với mức giá X, tai nghe XYZ 2025 là một đối thủ đáng gờm trong phân khúc. Nếu bạn đang tìm kiếm một chiếc tai nghe ANC với chất âm tốt và thiết kế đẹp, đây là lựa chọn không thể bỏ qua.</p>
      </div>
    ),
    commentsData: [
      {
        author: 'AudioPhile',
        avatar: 'https://i.pravatar.cc/150?img=14',
        content: 'Chống ồn có ngon hơn con Sony XM5 không ad?',
        date: '2025-11-04 14:00',
      }
    ]
  },
  {
    id: 3,
    title: 'Chào Đón Cửa Hàng Mới Tại Hà Nội: Tuần Lễ Khai Trương Rộn Ràng',
    description: 'Ghé thăm không gian mua sắm mới của chúng tôi tại 123 Phố Huế. Rất nhiều quà tặng check-in và giảm giá đặc biệt!',
    image: 'https://tinyurl.com/2mdtv7c6',
    category: 'Sự Kiện',
    tags: ['Khai Trương', 'Cửa Hàng Mới', 'Hà Nội', 'Offline'],
    author: 'Team Marketing',
    avatar: 'https://i.pravatar.cc/150?img=3',
    date: '2025-11-02',
    views: 3200,
    likes: 180,
    comments: 0,
    readTime: 'Sự kiện 10-15/11',
    content: (
      <div className="post-content-detail">
        <p>Người dân thủ đô ơi! Chúng tôi vô cùng hào hứng thông báo cửa hàng flagship mới nhất của chúng tôi sẽ chính thức khai trương tại <strong>123 Phố Huế, Quận Hai Bà Trưng, Hà Nội</strong>.</p>
        <h2>Không Gian Mua Sắm Đẳng Cấp</h2>
        <p>Với diện tích lên đến 500m², cửa hàng mới được thiết kế theo concept hiện đại, rộng rãi, mang đến trải nghiệm mua sắm thoải mái và tiện nghi nhất cho khách hàng. Bạn có thể tìm thấy toàn bộ sản phẩm mới nhất được trưng bày tại đây.</p>
        <h2>Ưu Đãi Tuần Lễ Khai Trương (10/11 - 15/11)</h2>
        <ul>
          <li><strong>Check-in nhận quà:</strong> 100 khách hàng đầu tiên mỗi ngày check-in tại cửa hàng sẽ nhận được một túi tote độc quyền.</li>
          <li><strong>Giảm giá 20%</strong> toàn bộ sản phẩm (không áp dụng kèm các khuyến mãi khác).</li>
          <li><strong>Bốc thăm may mắn:</strong> Với mỗi hóa đơn từ 1.000.000 VNĐ, bạn sẽ có cơ hội bốc thăm trúng thưởng một chiếc điện thoại thông minh.</li>
        </ul>
        <p>Hãy lên lịch cùng bạn bè và gia đình đến chung vui cùng chúng tôi!</p>
      </div>
    ),
    commentsData: []
  },
  {
    id: 4,
    title: 'Hành Trình Của Chúng Tôi: 5 Năm Mang Sản Phẩm Chất Lượng Đến Tay Bạn',
    description: 'Nhìn lại 5 năm thành lập và phát triển, từ một ý tưởng nhỏ đến thương hiệu được tin cậy. Cảm ơn bạn đã đồng hành!',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    category: 'Về Chúng Tôi',
    tags: ['Thương Hiệu', 'Câu Chuyện', 'Kỷ Niệm'],
    author: 'Sáng Lập Viên',
    avatar: 'https://i.pravatar.cc/150?img=4',
    date: '2025-10-30',
    views: 1500,
    likes: 90,
    comments: 1,
    readTime: '4 phút đọc',
    content: (
      <div className="post-content-detail">
        <p>5 năm trước, chúng tôi bắt đầu chỉ với một ý tưởng đơn giản: mang đến những sản phẩm công nghệ chất lượng với mức giá hợp lý cho người tiêu dùng Việt Nam. Ngày hôm nay, khi nhìn lại, chúng tôi tự hào về chặng đường đã qua.</p>
        <h2>Từ Ga-ra Đến Thương Hiệu Toàn Quốc</h2>
        <p>Những ngày đầu tiên là vô vàn khó khăn. Chúng tôi làm việc trong một văn phòng nhỏ (thực ra là một ga-ra), tự tay đóng gói từng đơn hàng. Nhưng với niềm tin và sự ủng hộ của những khách hàng đầu tiên, chúng tôi đã dần dần lớn mạnh.</p>
        <p>Chúng tôi đã mở rộng hệ thống, xây dựng đội ngũ chăm sóc khách hàng chuyên nghiệp và không ngừng cải tiến chất lượng sản phẩm. Mỗi lời khen, mỗi góp ý của khách hàng đều là động lực để chúng tôi hoàn thiện hơn.</p>
        <h2>Cảm Ơn Vì Đã Tin Tưởng</h2>
        <p>Hành trình 5 năm này không thể thành công nếu thiếu sự tin tưởng và đồng hành của bạn. Chúng tôi cam kết sẽ tiếp tục nỗ lực, mang đến nhiều sản phẩm tốt hơn nữa. Cảm ơn bạn vì đã là một phần trong câu chuyện của chúng tôi.</p>
      </div>
    ),
    commentsData: [
        {
            author: 'Khách Hàng Thân Thiết',
            avatar: 'https://i.pravatar.cc/150?img=15',
            content: 'Chúc mừng 5 năm của shop! Luôn tin tưởng sản phẩm bên mình.',
            date: '2025-10-30 09:00',
        }
    ]
  },
  {
    id: 5,
    title: 'Cẩm Nang Chọn Quà 20/11: Gợi Ý Quà Tặng Ý Nghĩa Cho Thầy Cô',
    description: 'Ngày Nhà giáo Việt Nam đang đến gần. Cùng tham khảo 10+ gợi ý quà tặng thiết thực và ý nghĩa nhất.',
    image: 'https://tinyurl.com/3dk8nw3b',
    category: 'Tư Vấn',
    tags: ['Quà Tặng', '20/11', 'Cẩm Nang', 'Gợi Ý'],
    author: 'Content Team',
    avatar: 'https://i.pravatar.cc/150?img=5',
    date: '2025-10-28',
    views: 9100,
    likes: 720,
    comments: 0,
    readTime: '6 phút đọc',
    content: (
      <div className="post-content-detail">
        <p>Ngày 20/11 là dịp để chúng ta bày tỏ lòng biết ơn sâu sắc đến những người thầy, người cô đã tận tụy dìu dắt. Nhưng chọn quà gì vừa ý nghĩa, vừa thiết thực luôn là câu hỏi khiến nhiều người băn khoăn. Dưới đây là một số gợi ý:</p>
        <h2>Quà Tặng Sức Khỏe</h2>
        <p>Thầy cô thường phải đứng lớp và nói nhiều. Các sản phẩm tốt cho sức khỏe như yến sào, thực phẩm chức năng bổ sung, hoặc một chiếc máy massage cổ vai gáy sẽ là món quà vô cùng thiết thực.</p>
        <h2>Quà Tặng Công Nghệ</h2>
        <p>Trong thời đại 4.0, các thiết bị công nghệ hỗ trợ giảng dạy sẽ rất hữu ích. Bạn có thể cân nhắc:</p>
        <ul>
          <li><strong>USB/Ổ cứng di động:</strong> Để lưu trữ giáo án, tài liệu.</li>
          <li><strong>Chuột trình chiếu (bút laser):</strong> Giúp thầy cô chuyên nghiệp hơn khi giảng bài.</li>
          <li><strong>Loa Bluetooth nhỏ:</strong> Hỗ trợ âm thanh cho các lớp học.</li>
        </ul>
        <h2>Quà Tặng Truyền Thống</h2>
        <p>Những món quà như hoa tươi, vải may áo dài (cho cô giáo), hoặc một bộ ấm trà tinh xảo (cho thầy giáo) không bao giờ là lỗi thời. Đừng quên kèm theo một tấm thiệp viết tay chân thành nhé!</p>
      </div>
    ),
    commentsData: []
  },
  {
    id: 6,
    title: 'Mẹo Dùng Nồi Chiên Không Dầu: 5 Công Thức Nhanh Gọn',
    description: 'Tận dụng tối đa chiếc nồi chiên không dầu của bạn với 5 công thức món ăn lành mạnh, dễ làm chỉ trong 15 phút.',
    image: 'https://tinyurl.com/3zus8kvx',
    category: 'Mẹo Hay',
    tags: ['Gia Dụng', 'Nấu Ăn', 'Công Thức', 'Tutorial'],
    author: 'Đầu Bếp Tại Gia',
    avatar: 'https://i.pravatar.cc/150?img=6',
    date: '2025-10-25',
    views: 11200,
    likes: 1100,
    comments: 0,
    readTime: '8 phút đọc',
    content: (
      <div className="post-content-detail">
        <p>Nồi chiên không dầu (NCKD) đã trở thành vật dụng không thể thiếu trong căn bếp hiện đại. Nhưng nếu bạn chỉ dùng nó để chiên khoai tây thì thật lãng phí! Hãy thử ngay 5 công thức nhanh-gọn-lành mạnh dưới đây.</p>
        <h2>1. Gà Nướng Mật Ong Tỏi (15 phút)</h2>
        <p>Ướp ức gà cắt miếng với 2 thìa mật ong, 1 thìa tỏi băm, chút muối tiêu. Lót giấy bạc vào nồi, xếp gà vào. Set nhiệt 180°C trong 10 phút, lật mặt, nướng thêm 5 phút là chín vàng.</p>
        <h2>2. Cá Hồi Nướng Măng Tây (12 phút)</h2>
        <p>Phi lê cá hồi ướp với dầu ô liu, muối, tiêu. Măng tây cắt khúc, xóc đều với chút dầu. Cho cả hai vào NCKD, set nhiệt 190°C trong 12 phút. Bạn sẽ có món ăn chuẩn nhà hàng.</p>
        <h2>3. Đậu Hũ Chiên Sả Ớt (10 phút)</h2>
        <p>Đậu hũ cắt miếng vuông. Trộn đều sả băm, ớt băm, chút bột nêm. Xóc đậu hũ với hỗn hợp sả ớt. Cho vào NCKD, xịt thêm chút dầu ăn. Set nhiệt 200°C trong 10 phút, giữa chừng lắc đều.</p>
        <h2>4. Bánh Mì Nướng Bơ Tỏi (5 phút)</h2>
        <p>Bánh mì sandwich cắt làm 4. Trộn bơ lạt đun chảy với tỏi băm và lá ngò tây khô (parsley). Phết hỗn hợp lên bánh mì. Nướng 180°C trong 5 phút là giòn rụm.</p>
        <h2>5. Sữa Chua Nướng (8 phút)</h2>
        <p>Một món tráng miệng lạ mà ngon. Trộn đều 1 hộp sữa chua Hy Lạp, 1 quả trứng, 1 thìa mật ong. Đổ vào khuôn nướng nhỏ (an toàn cho NCKD). Set nhiệt 170°C trong 8 phút. Để nguội và thưởng thức!</p>
      </div>
    ),
    commentsData: []
  },
  {
    id: 7,
    title: 'Xu Hướng Thu Đông 2025: 3 Cách Phối Đồ Với Áo Khoác Blazer',
    description: 'Biến hóa phong cách từ công sở thanh lịch đến dạo phố cá tính chỉ với một chiếc áo khoác blazer. Khám phá ngay!',
    image: 'https://tinyurl.com/5zu4zk4h',
    category: 'Thời Trang',
    tags: ['Phối Đồ', 'OOTD', 'Thu Đông', 'Xu Hướng'],
    author: 'Fashionista Anna',
    avatar: 'https://i.pravatar.cc/150?img=7',
    date: '2025-10-22',
    views: 6300,
    likes: 410,
    comments: 0,
    readTime: '5 phút đọc',
    content: (
      <div className="post-content-detail">
        <p>Blazer là item "must-have" (phải có) trong tủ đồ thu đông. Nó không chỉ giữ ấm mà còn nâng tầm bộ trang phục của bạn. Dưới đây là 3 cách phối đồ đang thịnh hành nhất mùa mốt 2025.</p>
        <h2>1. Thanh Lịch Công Sở (Business Casual)</h2>
        <p>Đây là cách phối đồ cổ điển nhưng không bao giờ lỗi mốt. Khoác một chiếc blazer (ưu tiên màu trung tính như be, đen, xám) bên ngoài áo sơ mi hoặc áo len cổ lọ. Kết hợp cùng quần âu ống đứng và giày loafer. Bạn đã có ngay một set đồ chuẩn thanh lịch.</p>
        <h2>2. Năng Động Dạo Phố (Street Style)</h2>
        <p>Hãy thử một chiếc blazer dáng rộng (oversized) khoác ngoài áo hoodie mỏng. Phối cùng quần jeans rách gối và một đôi giày sneaker chunky. Phong cách này mang lại sự thoải mái, cá tính và cực kỳ "chất".</p>
        <h2>3. Quyến Rũ Dự Tiệc (Chic Night Out)</h2>
        <p>Ai nói blazer chỉ dành cho ban ngày? Hãy mặc blazer như một chiếc váy (blazer dress), hoặc khoác hờ bên ngoài một chiếc váy lụa hai dây (slip dress). Đừng quên một đôi giày cao gót mũi nhọn và phụ kiện lấp lánh để hoàn thiện vẻ ngoài quyến rũ.</p>
      </div>
    ),
    commentsData: []
  },
  {
    id: 8,
    title: 'Cập Nhật Chính Sách Bảo Hành: Mở Rộng Lên Đến 24 Tháng',
    description: 'Tin vui! Chúng tôi chính thức nâng thời gian bảo hành cho nhiều dòng sản phẩm để mang lại trải nghiệm an tâm nhất.',
    image: 'https://tinyurl.com/ythtn42k',
    category: 'Thông Báo',
    tags: ['Chính Sách', 'Bảo Hành', 'Hỗ Trợ', 'Quan Trọng'],
    author: 'Ban Quản Trị',
    avatar: 'https://i.pravatar.cc/150?img=1',
    date: '2025-10-20',
    views: 2100,
    likes: 50,
    comments: 0,
    readTime: '2 phút đọc',
    content: (
      <div className="post-content-detail">
        <h2>Thông Báo Quan Trọng Về Việc Thay Đổi Chính Sách Bảo Hành</h2>
        <p>Kính gửi Quý khách hàng,</p>
        <p>Nhằm nâng cao chất lượng dịch vụ và mang lại sự an tâm tuyệt đối cho khách hàng khi mua sắm, chúng tôi trân trọng thông báo về việc cập nhật chính sách bảo hành mới, chính thức có hiệu lực từ ngày 01/11/2025.</p>
        <h2>Nội Dung Cập Nhật:</h2>
        <p>Chúng tôi quyết định <strong>tăng thời gian bảo hành tiêu chuẩn từ 12 tháng lên 24 tháng</strong> cho các nhóm sản phẩm sau:</p>
        <ul>
          <li>Toàn bộ sản phẩm thuộc danh mục Gia Dụng (Nồi chiên, máy xay, ...).</li>
          <li>Toàn bộ sản phẩm thuộc danh mục Tai Nghe & Loa (trừ phụ kiện cáp sạc).</li>
          <li>Các dòng máy tính xách tay cao cấp (mã XYZ).</li>
        </ul>
        <p>Đối với các sản phẩm được mua trước ngày 01/11/2025 và vẫn còn trong thời hạn bảo hành 12 tháng, thời gian bảo hành sẽ tự động được gia hạn thêm 12 tháng (tổng cộng 24 tháng kể từ ngày mua).</p>
        <p>Chúng tôi tin rằng thay đổi này khẳng định cam kết của chúng tôi về chất lượng sản phẩm và dịch vụ hỗ trợ sau bán hàng. Mọi thắc mắc, vui lòng liên hệ hotline để được giải đáp.</p>
        <p>Trân trọng cảm ơn!</p>
      </div>
    ),
    commentsData: []
  },
  {
    id: 9,
    title: 'Cuộc Thi Ảnh "Khoảnh Khắc Cùng Shop": Rinh Ngay Quà Khủng!',
    description: 'Chia sẻ hình ảnh của bạn với sản phẩm của shop và có cơ hội nhận được voucher mua hàng 1.000.000 VNĐ. Xem thể lệ ngay!',
    image: 'https://tinyurl.com/fu43x35f',
    category: 'Sự Kiện',
    tags: ['Cuộc Thi', 'Minigame', 'Giveaway', 'Feedback'],
    author: 'Team Marketing',
    avatar: 'https://i.pravatar.cc/150?img=3',
    date: '2025-10-18',
    views: 15000,
    likes: 1500,
    comments: 0,
    readTime: 'Thể lệ cuộc thi',
    content: (
      <div className="post-content-detail">
        <p>Bạn đã mua sản phẩm của chúng tôi? Bạn có những bức ảnh "check-in" thật đẹp? Đừng ngần ngại tham gia ngay cuộc thi ảnh "Khoảnh Khắc Cùng Shop" để khoe ảnh đẹp và rinh về những phần quà giá trị!</p>
        <h2>Thể Lệ Tham Gia (Cực Kỳ Đơn Giản)</h2>
        <p><strong>Bước 1:</strong> Đăng tải một bức ảnh chụp bạn hoặc không gian của bạn cùng với BẤT KỲ sản phẩm nào đã mua tại shop lên Facebook cá nhân (chế độ công khai).</p>
        <p><strong>Bước 2:</strong> Viết một vài dòng chia sẻ cảm nhận của bạn về sản phẩm.</p>
        <p><strong>Bước 3:</strong> Gắn hashtag <strong>#KhoanhKhacCungShop</strong> và tag Fanpage chính thức của chúng tôi.</p>
        <h2>Cơ Cấu Giải Thưởng</h2>
        <ul>
          <li><strong>01 Giải Đặc Biệt (do BTC chọn):</strong> 01 Voucher mua hàng trị giá 1.000.000 VNĐ.</li>
          <li><strong>02 Giải Sáng Tạo (do BTC chọn):</strong> Mỗi giải 01 Voucher 500.000 VNĐ.</li>
          <li><strong>05 Giải Yêu Thích (dựa trên lượt tương tác):</strong> Mỗi giải 01 Voucher 200.000 VNĐ.</li>
        </ul>
        <h2>Thời Gian Diễn Ra</h2>
        <p>Từ hôm nay đến hết ngày 30/11/2025. Kết quả sẽ được công bố vào ngày 05/12/2025.</p>
        <p>Tham gia ngay thôi! Chúng tôi rất mong chờ được thấy những khoảnh khắc tuyệt vời của bạn.</p>
      </div>
    ),
    commentsData: []
  }
];


export const BLOG_STORAGE_KEY = 'app_blog_posts_v1';

export const getStoredBlogPosts = () => {
  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
       return parsed.map(post => {
        const mockOrigin = initialMockPosts.find(p => p.id === post.id);
        return {
          ...post,
          content: mockOrigin ? mockOrigin.content : post.content,
        };
      });
      
    }
  } catch (e) {
    console.warn("Could not parse blog posts from localStorage, falling back to mock.", e);
    localStorage.removeItem(BLOG_STORAGE_KEY);
  }

  const storablePosts = initialMockPosts.map(post => {
    const { content, ...rest } = post;
    return { ...rest, content: (typeof post.content === 'string' ? post.content : post.description) };
  });

  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(storablePosts));
  return initialMockPosts;
};

export const saveStoredBlogPosts = (posts) => {
  try {
    const storablePosts = posts.map(post => {
        const safeContent = (typeof post.content === 'string' || !post.content) ? post.content : post.description;
        
        return {
            id: post.id,
            title: post.title,
            description: post.description,
            image: post.image,
            category: post.category,
            tags: post.tags,
            author: post.author,
            avatar: post.avatar,
            date: post.date,
            views: post.views,
            likes: post.likes,
            comments: post.comments,
            readTime: post.readTime,
            commentsData: post.commentsData,
            content: safeContent,
        };
    });

    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(storablePosts));
    window.dispatchEvent(new CustomEvent('storage', { detail: { key: BLOG_STORAGE_KEY } }));
    window.dispatchEvent(new Event('blog_posts_updated'));
  } catch (e) {
    console.error("Failed to save blog posts", e);
  }
};


const Blog = () => {
  // displaying Vietnamese only, removed i18n
  const [allPosts, setAllPosts] = useState(() => getStoredBlogPosts());
  const [newComment, setNewComment] = useState("");
  const [form] = Form.useForm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState([]);
  const pageSize = 6;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const refetchPosts = () => {
      console.log("Blog.js: Nhận được cập nhật, đang tải lại bài viết...");
      setAllPosts(getStoredBlogPosts());
    };
    window.addEventListener('blog_posts_updated', refetchPosts);
    const onStorage = (ev) => {
      if ((ev.key === BLOG_STORAGE_KEY) || (ev.detail && ev.detail.key === BLOG_STORAGE_KEY)) {
        refetchPosts();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('blog_posts_updated', refetchPosts);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const categories = useMemo(() => {
    return ['all', ...new Set(allPosts.map(post => post.category))];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allPosts, searchTerm, selectedCategory]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPosts.slice(startIndex, startIndex + pageSize);
  }, [filteredPosts, currentPage]);

  const handleLike = (postId) => {
    const isLiked = likedPosts.includes(postId);

    setLikedPosts(prev =>
      isLiked
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );

    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    setAllPosts(updatedPosts);
    saveStoredBlogPosts(updatedPosts);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadMore = (post) => {
    const freshPost = allPosts.find(p => p.id === post.id);
    setSelectedPost(freshPost);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
    form.resetFields();
    setNewComment("");
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      author: 'Bạn',
      avatar: 'https://i.pravatar.cc/150?img=10',
      content: newComment,
      date: new Date().toLocaleString('vi-VN'),
    };

    const updatedPosts = allPosts.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: post.comments + 1,
          commentsData: [...(post.commentsData || []), newCommentObj]
        };
      }
      return post;
    });
    setAllPosts(updatedPosts);
    saveStoredBlogPosts(updatedPosts);

    setSelectedPost(prevPost => ({
      ...prevPost,
      comments: prevPost.comments + 1,
      commentsData: [...(prevPost.commentsData || []), newCommentObj]
    }));

    setNewComment("");
    form.resetFields();
  };


  return (
    <div className="blog-container">
      <div className="blog-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="blog-header">
        <div className="header-content">
          <h1 className="blog-title">
            <span className="title-gradient">Blog</span>
          </h1>
          <p className="blog-subtitle">Tin tức, mẹo vặt và hướng dẫn mua sắm</p>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-content">
          <div className="search-wrapper">
              <Search
              placeholder={"Tìm bài viết, từ khóa..."}
              allowClear
              size="large"
              prefix={<SearchOutlined className="search-icon" />}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="blog-search"
            />
          </div>

          <div className="category-filter">
            <FilterOutlined className="filter-icon" />
            <Select
              size="large"
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
              className="category-select"
              suffixIcon={null}
            >
                  {categories.map(cat => (
                <Option key={cat} value={cat}>
                  {cat === 'all' ? 'Tất cả' : cat}
                </Option>
              ))}
            </Select>
          </div>
        </div>

          <div className="results-count">
          <Badge
            count={filteredPosts.length}
            showZero
            style={{ backgroundColor: '#10b981' }}
          />
          <span className="count-text">bài viết</span>
        </div>
      </div>

      <div className="blog-grid">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => {
            const isLiked = likedPosts.includes(post.id);
            const displayLikes = post.likes;

            return (
              <Card
                key={post.id}
                className="blog-card"
                cover={
                  <div className="card-image-wrapper">
                    <img
                      alt={post.title}
                      src={post.image}
                      className="card-image"
                    />
                    <div className="image-overlay">
                      <Tag className="category-tag" color="rgba(16, 185, 129, 0.9)">
                        {post.category}
                      </Tag>
                    </div>
                  </div>
                }
                hoverable
              >
                <div className="card-content">
                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-description">{post.description}</p>

                  <div className="card-tags">
                    {(post.tags || []).map((tag, index) => (
                      <Tag key={index} className="post-tag">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  <div className="card-meta">
                    <div className="author-info">
                      <Avatar src={post.avatar} size={36} className="author-avatar" />
                      <div className="author-details">
                        <span className="author-name">{post.author}</span>
                          <span className="post-date">
                          <ClockCircleOutlined /> {post.date} • {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <Space size="large">
                      <Tooltip title={'Lượt xem'}>
                        <span className="action-item">
                          <EyeOutlined />
                          <span className="action-count">{(post.views || 0).toLocaleString()}</span>
                        </span>
                      </Tooltip>

                      <Tooltip title={isLiked ? 'Bỏ thích' : 'Thích'}>
                        <Button
                          type="text"
                          className={`action-button ${isLiked ? 'liked' : ''}`}
                          icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                        >
                          <span className="action-count">{(displayLikes || 0).toLocaleString()}</span>
                        </Button>
                      </Tooltip>

                      <Tooltip title={'Bình luận'}>
                        <Button
                          type="text"
                          className="action-button"
                          icon={<CommentOutlined />}
                          onClick={() => handleReadMore(post)}
                        >
                          <span className="action-count">{(post.comments || 0).toLocaleString()}</span>
                        </Button>
                      </Tooltip>
                    </Space>

                    <Button
                      type="primary"
                      className="read-more-btn"
                      onClick={() => handleReadMore(post)}
                    >
                      {'Đọc tiếp'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="empty-state">
            <Empty
              description={'Không tìm thấy bài viết'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      {filteredPosts.length > pageSize && (
        <div className="pagination-wrapper">
          <Pagination
            current={currentPage}
            total={filteredPosts.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            className="blog-pagination"
          />
        </div>
      )}

      {selectedPost && (
        <Modal
          title={<h2 style={{ margin: 0, paddingRight: '40px' }}>{selectedPost.title}</h2>}
          open={isModalVisible}
          onCancel={handleModalClose}
          width={800}
          className="blog-detail-modal"
          footer={[
            <Tooltip
              title={likedPosts.includes(selectedPost.id) ? 'Bỏ thích' : 'Thích'}
              key="like"
            >
              <Button
                className={`modal-like-btn ${likedPosts.includes(selectedPost.id) ? 'liked' : ''}`}
                icon={likedPosts.includes(selectedPost.id) ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => handleLike(selectedPost.id)}
                size="large"
              >
                {(selectedPost.likes || 0).toLocaleString()}
              </Button>
            </Tooltip>,
            <Button key="close" type="primary" size="large" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
        >
          <div
            className="modal-post-meta"
            style={{
              margin: '16px 0',
              borderTop: '1px solid #f0f0f0',
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 0'
            }}
          >
            <Space style={{ marginBottom: 16 }}>
              <Avatar src={selectedPost.avatar} />
              <strong>{selectedPost.author}</strong>
              <span>|</span>
              <ClockCircleOutlined />
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </Space>

              <Space size="large" style={{ display: 'flex' }}>
              <span className="action-item" style={{ fontSize: 15, color: '#555' }}>
                <EyeOutlined />
                <span className="action-count" style={{ marginLeft: 8 }}>
                  {(selectedPost.views || 0).toLocaleString()} lượt xem
                </span>
              </span>
              <span className="action-item" style={{ fontSize: 15, color: '#555' }}>
                <CommentOutlined />
                <span className="action-count" style={{ marginLeft: 8 }}>
                  {(selectedPost.comments || 0).toLocaleString()} Bình luận
                </span>
              </span>
            </Space>
          </div>

          <div className="modal-post-content">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
            />
            {typeof selectedPost.content === 'string' ? (
                <div className="post-content-detail" dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\n/g, '<br />') }} />
            ) : (
                selectedPost.content
            )}

            <div className="comment-section">
              <h3 className="comment-title">Bình luận ({selectedPost.comments})</h3>

              <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={selectedPost.commentsData || []}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={<span className="comment-author">{item.author}</span>}
                      description={
                        <>
                          <p className="comment-content">{item.content}</p>
                          <span className="comment-date">{item.date}</span>
                        </>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'Chưa có bình luận nào. Hãy là người đầu tiên!' }}
              />

              <div className="comment-form-wrapper">
                <Avatar
                  src="https://i.pravatar.cc/150?img=10"
                  className="comment-form-avatar"
                />
                <Form
                  form={form}
                  onFinish={handleCommentSubmit}
                  className="comment-form"
                >
                  <Form.Item
                    name="comment"
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                      <TextArea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={'Viết bình luận...'}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      className="comment-input"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    className="comment-submit-btn"
                    disabled={!newComment.trim()}
                  />
                </Form>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default Blog;