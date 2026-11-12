# Cấu hình Footer và Banner

## Footer người dùng

Footer được chia thành hai cột nội dung:

- **About Us**: Giới thiệu, Liên hệ.
- **Chính sách - điều khoản**: Chính sách, Điều khoản.

Mỗi mục không nhập URL tự do. Admin chọn một bài viết đã tạo trong **Tin tức**. Bài viết nên có tiêu đề, đường dẫn (slug), nội dung rich text, trạng thái xuất bản và trường SEO. Chỉ bài viết đã xuất bản mới được hiển thị trên website; đổi bài viết đích chỉ là thay lựa chọn trong cấu hình Footer.

## Vị trí banner

| Trường | Mục đích |
| --- | --- |
| Mã vị trí | Mã ổn định, viết hoa, dùng để gán banner ở frontend, ví dụ `HOME_HERO`. |
| Tên vị trí | Tên dễ hiểu cho người quản trị, ví dụ `Trang chủ - Hero`. |
| Thiết bị hiển thị | Desktop / mobile, chỉ desktop hoặc chỉ mobile. |
| Trạng thái | Bật/tắt vị trí mà không xóa dữ liệu banner. |

## Banner

| Trường | Mục đích |
| --- | --- |
| Tên banner | Tên nội bộ để nhận diện asset. |
| Ảnh banner | Upload JPG, PNG hoặc WebP; không nhập URL. Nên có bản desktop/mobile khi tỷ lệ hiển thị khác nhau. |
| Vị trí | Select2/select từ danh sách mã vị trí đã tạo. |
| Thứ tự | Số nguyên dương để quyết định thứ tự hiển thị. |
| Trạng thái | Bản nháp, Đang hoạt động hoặc Tạm ẩn. |

Nếu một vị trí có từ hai banner đang hoạt động, frontend hiển thị theo thứ tự và tự chuyển carousel. Backend nên trả về danh sách đã sắp xếp theo `position_code`, `display_order`, sau đó lọc theo `status` và thời gian hiệu lực nếu bổ sung lịch chạy.
