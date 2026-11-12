# Demo đơn hàng và khách hàng

Nguồn đối chiếu: `https://linerybooks.vn/admin/orders` và `https://linerybooks.vn/admin/users` tại thời điểm 12/11/2026.

- 18 đơn hàng được đưa vào bộ dữ liệu demo local, giữ mã đơn, khách hiển thị, kênh Website, tổng tiền và trạng thái theo màn Admin live.
- 4 nhóm khách được tổng hợp từ các khách xuất hiện trong đơn hàng. Email và số điện thoại demo được che/mask để không phát tán thông tin liên hệ thật.
- Dữ liệu được seed một lần vào `localStorage` với key phiên bản `v2`. Những đơn hàng phát sinh từ checkout sẽ gọi `addStorefrontOrder`, cập nhật danh sách đơn hàng và tăng số đơn của khách tương ứng.
- Phạm vi chỉ dành cho Admin local/demo; không sử dụng dữ liệu này cho storefront công khai.
