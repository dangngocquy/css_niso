## CSSNISO — Hệ thống khảo sát/NISO (React + Express)

### Giới thiệu
CSSNISO là hệ thống thu thập và quản trị khảo sát cho nhiều thương hiệu/chi nhánh, gồm:
- Quản trị biểu mẫu câu hỏi nhiều bước và nội dung cảm ơn sau khảo sát.
- Phân phối biểu mẫu theo thương hiệu/chi nhánh, chọn form áp dụng linh hoạt.
- Quản lý tài khoản và phân quyền cơ bản (Admin/User) trên giao diện.
- Theo dõi/lọc kết quả khảo sát và thao tác dữ liệu phục vụ báo cáo.
- Cấu hình tích hợp API ngoài để đẩy dữ liệu khảo sát.
- Hỗ trợ đa ngôn ngữ giao diện và vận hành qua HTTPS kèm proxy.

### Kiến trúc tổng quan
- **Frontend**: React 18, `react-router-dom`, `antd`, `styled-components`, i18next. Khởi chạy bằng `react-app-rewired` tại cổng 3008.
- **Backend**: Express chạy HTTPS tại cổng 3009, xác thực Basic cho tất cả endpoint. Đọc/ghi một số dữ liệu cấu hình vào thư mục `src/data/`.
- **Proxy**: `src/setupProxy.js` định tuyến các request `/login`, `/users`, `/question`, `/api-config`, ... đến máy chủ đích.

### Cấu trúc thư mục chính
- `src/`: mã nguồn React, router, trang quản trị và component biểu mẫu.
- `backend/`: dịch vụ Express HTTPS, route người dùng, câu hỏi, chi nhánh, cấu hình API.
- `public/`: tài nguyên tĩnh React.
- `SSL/`: chứng thư PFX cho server HTTPS (được backend đọc khi khởi động).

### Yêu cầu hệ thống
- Node.js LTS (>= 18 khuyến nghị)
- Windows (có sẵn các file `.bat`), vẫn có thể chạy trên macOS/Linux bằng lệnh `node`

### Cài đặt
```bash
npm install
```

### Chạy dự án (phát triển)
- Mở 2 cửa sổ terminal.

1) Frontend (React) ở cổng 3008:
```bash
npm start
```

2) Backend (Express HTTPS) ở cổng 3009:
```bash
cd backend
node server.js
# Hoặc dùng file batch: backend/app.bat
```

Lưu ý: Backend cần đọc file PFX từ `SSL/star-niso-com-vn.pfx` với mật khẩu được mã hoá cứng trong mã nguồn. Đảm bảo file tồn tại để khởi chạy HTTPS.

### Proxy và môi trường
- File `src/setupProxy.js` có 2 cấu hình:
  - Cục bộ (đang comment): `https://localhost:3009`
  - Mặc định hiện tại: `https://css.niso.com.vn:3008/`

Trong môi trường phát triển cục bộ, hãy bật dòng localhost và tắt dòng domain để proxy tới backend local:
```js
// const LINK = 'https://localhost:3009';
const LINK = 'https://css.niso.com.vn:3008/';
```

### Xác thực Basic cho API
- Tất cả route backend yêu cầu header `Authorization` dạng Basic.
- Thông tin mặc định trong `backend/server.js`:
  - Username: `Niso`
  - Password: `Niso@123`

Ví dụ dùng cURL:
```bash
curl -k -H "Authorization: Basic TmlzbzpOaXNvQDEyMw==" https://localhost:3009/users/all
```

### Các chức năng chính (điểm qua)
- Quản lý người dùng: thêm/sửa/xoá, tải lên/tải xuống CSV/JSON.
- Quản lý chi nhánh (Rescode/Chinhanh): CRUD và import/export.
- Quản lý câu hỏi/biểu mẫu: CRUD, bước câu hỏi, bản cảm ơn, lưu trữ form, sao chép bước.
- Cấu hình API đích: lưu nhiều cấu hình, nháp, cập nhật, xoá; thử gửi dữ liệu đến API ngoài.
- Đa ngôn ngữ: thư mục `src/data/locales/{vi,en,kh}/translation.json`.

### Phân quyền chức năng (RBAC đơn giản ở frontend)
- Thuộc tính vai trò nằm trong đối tượng người dùng trả về từ đăng nhập SQL: trường `PhanQuyen` (boolean). `true` = Admin, `false` = User.
- Frontend lưu người dùng tại `localStorage['user']` và sử dụng `user.PhanQuyen` để ẩn/hiện hoặc cho phép thao tác.
- Một số vị trí kiểm tra quyền:
  - `src/components/Admin.jsx`: Quản trị tài khoản (chỉ nên hiển thị/đi tới khi Admin). Hiển thị cột và switch `PhanQuyen`; thao tác thêm/sửa/xoá người dùng.
  - `src/components/Home.jsx`: Nhiều nút/hành động quản trị chỉ hiện với `user.PhanQuyen === true` (ví dụ tùy chỉnh câu hỏi, thao tác nhiều bước, các khối xử lý tổng hợp).
  - `src/components/form/SecondForm.jsx`: Chỉ Admin mới được chỉnh sửa các trường/khối (kiểm tra `user.PhanQuyen && canEditField(...)`).
  - `src/components/form/CustomQuestion.jsx`, `src/components/views/Views.jsx`, `src/components/ThankYou.jsx`: Chức năng chỉnh sửa/chia sẻ/hiển thị điều kiện dựa vào `user.PhanQuyen`.
- Backend hiện áp dụng mức bảo vệ chung bằng Basic Auth cho tất cả endpoint, nhưng chưa thực hiện kiểm soát vai trò chi tiết theo người dùng ở server (RBAC backend). Việc phân quyền chi tiết đang chủ yếu ở UI.

Khuyến nghị tăng cường bảo mật (tuỳ chọn):
- Truyền token phiên/role từ backend thay vì chỉ dựa UI; kiểm tra role ở middleware server theo route (ví dụ: chỉ Admin mới được `POST/PUT/DELETE` ở `/users`, `/question/*`, `/chinhanh/*`).
- Ẩn thông tin đăng nhập Basic khỏi mã nguồn, dùng biến môi trường và phát hành JWT/Session riêng cho từng người dùng sau khi đăng nhập SQL.

### Lưu trữ tệp cấu hình/dữ liệu
- `src/data/apiConfig.json`: chứa `apiConfigs`, `currentConfig`, và có thể ghi nháp.
- `src/data/question.json`: nguồn câu hỏi để lọc theo thương hiệu.

### Build sản phẩm
```bash
npm run build
```
Kết quả build nằm trong thư mục `build/`.

### Script hữu ích
- `npm start`: chạy React dev server tại cổng 3008.
- `npm run build`: build production.
- `backend/app.bat`: chạy backend HTTPS.
- `Run.bat`: chạy `node app.js` tại thư mục gốc (nếu bạn có tập tin app.js dùng riêng).

### Ghi chú bảo mật
- Không commit chứng thư thật vào kho mã công khai.
- Cân nhắc đưa thông tin xác thực Basic và mật khẩu PFX sang biến môi trường.

### Giấy phép
Nội bộ/NISO (tuỳ chỉnh theo yêu cầu tổ chức).


