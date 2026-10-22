# LineryBooks Tailwind frontend

Giao diện được dựng từ frame Figma `linerybooks.vn` bằng React + TypeScript + Vite + Tailwind CSS v4.

## Chạy local

```powershell
npm install
npm run dev
```

Sau đó mở đúng địa chỉ server:

```text
http://127.0.0.1:5173/
```

Không mở trực tiếp `index.html` bằng double-click hoặc URL bắt đầu bằng `file:///`. `index.html` là entry của Vite và cần server để biên dịch `src/main.tsx` và nạp Tailwind.

Để xem bản build gần giống một website HTML tĩnh:

```powershell
npm run build
npm run preview
```

Mở địa chỉ mà Vite in ra, thường là `http://127.0.0.1:4173/`.

## Ghi chú bàn giao

- Dữ liệu sản phẩm hiện là mock data trong `src/App.tsx`, sẵn sàng thay bằng API.
- Asset tĩnh nằm trong `public/assets/`.
- Responsive đã định nghĩa cho desktop, tablet và mobile theo các frame 1920/768/390 trong Figma.
