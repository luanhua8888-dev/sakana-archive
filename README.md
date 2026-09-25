# SAKANA — Thủy tộc chí

Website React chạy local, lấy cảm hứng từ hai ảnh tham chiếu của người dùng.

## Chạy

```powershell
cd sakana
npm install
npm run dev
```

Mở http://localhost:5173/.

## Kiểm tra

```powershell
npm run build
node node_modules/typescript/bin/tsc --noEmit
```

- React 19, TypeScript, Vinext/Vite.
- Parallax nhiều lớp bằng CSS perspective và translate3d; tranh 2D, không phải mô hình cá 3D.
- Animation nổi, hover và xuất hiện theo cuộn; có nút tạm dừng và hỗ trợ prefers-reduced-motion.
- Thông tin ba nhóm cá, hộp thoại hỗ trợ bàn phím, bố cục responsive.
- Ảnh và phông Noto Serif lưu local; không cần dịch vụ nội dung bên ngoài.
- Ảnh khắc là minh họa theo nhóm, không dùng để định danh loài.
- Chưa triển khai lên hosting.
