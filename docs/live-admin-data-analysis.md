# Live Admin → Supabase demo model

Nguồn đã đối chiếu: các màn Admin live và API read-only của LineryBooks.

## Dữ liệu nghiệp vụ quan sát được

- Sách: ISBN, tên sách, slug/đường dẫn, giá bán, giá so sánh, số trang, khổ sách, ngày xuất bản, trọng lượng, publisher, imprint, ngôn ngữ, format/thể thức, dòng sách, thể loại, chủ đề, trạng thái, tồn kho, mô tả HTML và ảnh.
- Quan hệ nhiều-nhiều: một sách có thể có nhiều tác giả, dịch giả, họa sĩ minh họa, chủ đề, thể loại, danh mục và ngôn ngữ.
- Tác giả: tên, slug, tiểu sử HTML, giới tính, năm sinh/mất, giải thưởng, thể loại, thể thức, chủ đề và ảnh đại diện.
- Hiển thị: sách có thể bật/tắt trên website và gắn vào nhiều module trang chủ.
- Module hiện thấy: New & Upcoming, Linery Press, Linery Picks, Grab & Save.

## Quyết định mô hình

Các giá trị Select2 được lưu trong `taxonomy_terms`, không lưu chuỗi phân cách bằng dấu phẩy trong `books`. Các quan hệ nhiều lựa chọn đi qua `book_taxonomy_terms`; quan hệ người sáng tạo đi qua `book_creators`. Ảnh có bảng riêng để hỗ trợ nhiều ảnh và thứ tự ảnh.

## Chạy trên Supabase

1. Chạy `supabase/schema.sql` trong SQL Editor.
2. Chạy `supabase/seed.sql` sau khi schema hoàn tất.
3. Cấu hình Storage bucket riêng cho `book-images` và `creator-images`, sau đó đưa `storage_path` vào các bảng ảnh.

Để đồng bộ catalog công khai hiện tại, chạy `scripts/build-live-catalog-import.ps1` rồi chạy SQL sinh ra trong SQL Editor. Lần kiểm tra ngày 2026-11-12 đã nạp 225 sách, 171 tác giả, 83 taxonomy term, 225 ảnh bìa và 227 quan hệ tác giả–sách. Nguồn công khai không trả các cờ module trang chủ chi tiết của Admin, nên các module đã seed vẫn được giữ riêng.

Không nhập tài khoản, khách hàng, đơn hàng, audit log, token hoặc thông tin vận hành nhạy cảm vào demo công khai.
