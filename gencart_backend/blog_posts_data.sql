--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: blog_blogpost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_blogpost (id, title, slug, description, content, image, tags, avatar, date, views, likes, comments_count, read_time, status, is_pinned, created_at, updated_at, author_id, category_id, excerpt) FROM stdin;
1	Săn Sale 11.11: Tổng Hợp Voucher Khủng & Quà Tặng Độc Quyền!	san-sale-1111-tong-hop-voucher-khung-qua-tang-oc-quyen	Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra.	Đừng bỏ lỡ! Lưu ngay 10+ voucher giảm giá lên đến 50%, freeship và hàng ngàn quà tặng hấp dẫn sắp tung ra. Đây là cơ hội vàng để bạn sở hữu những món đồ yêu thích với giá hời nhất năm!	https://tinyurl.com/4dnsk5bw	["11.11", "Voucher", "Giảm Giá", "Flash Sale"]	https://i.pravatar.cc/150?img=1	2025-12-24 11:15:39.923647+07	12800	950	2	3 phút đọc	published	f	2025-12-24 11:15:39.923672+07	2025-12-24 11:15:39.923676+07	9	1	
2	Trên Tay Siêu Phẩm: Tai Nghe Chống Ồn XYZ Mới Nhất 2025	tren-tay-sieu-pham-tai-nghe-chong-on-xyz-moi-nhat-2025	Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền?	Mở hộp và đánh giá nhanh mẫu tai nghe đang làm mưa làm gió. Liệu chất âm có xứng đáng với giá tiền? Ngay từ cái nhìn đầu tiên, tai nghe XYZ 2025 đã gây ấn tượng mạnh với thiết kế tối giản nhưng không kém phần sang trọng.	https://tinyurl.com/mrxx3jp9	["Đánh giá", "Hàng mới", "Âm thanh", "Tech"]	https://i.pravatar.cc/150?img=2	2025-12-24 11:15:39.932992+07	4500	310	1	7 phút đọc	published	f	2025-12-24 11:15:39.933014+07	2025-12-24 11:15:39.933018+07	9	2	
11	Test Post	test-post	test desc	test content		[]		2026-01-05 16:14:46.538709+07	0	0	0		published	f	2026-01-05 16:14:46.539301+07	2026-01-05 16:14:46.539308+07	2	1	
12	feefe	feefe	fefe	1111	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHj92DnmYlRfkWcc8uxqSLV-6MoBb4mevu6L-FSHi0jDI3UUy50EdbWGeKdClCTht983srSQ1kIkhS6Z8wQHc75DQmIKkKbNP0n6W-gfxPjA&s=10	["11"]		2026-01-05 16:17:59.049926+07	0	0	0	5 phút đọc	published	f	2026-01-05 16:17:59.050823+07	2026-01-05 16:17:59.050829+07	2	6	
\.


--
-- Name: blog_blogpost_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_blogpost_id_seq', 12, true);


--
-- PostgreSQL database dump complete
--

