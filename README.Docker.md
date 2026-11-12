# Chạy backend và Swagger bằng Docker

Cần Docker Desktop đang chạy với Linux containers và Docker Compose.
Backend, Swagger và PostgreSQL chạy bằng Compose; không cần cài Node.js hoặc PostgreSQL trên máy host.

## Khởi động

Nếu chưa có `.env`, tạo từ mẫu bằng PowerShell rồi điều chỉnh cấu hình:

```powershell
Copy-Item .env.example .env
```

Nếu đã có `.env`, dùng tiếp file hiện tại. Các biến `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`JWT_SECRET` và `JWT_REFRESH_SECRET` cần được cấu hình.

Tại thư mục dự án, chạy:

```sh
docker compose up --build -d --wait
```

- `server`: backend Express, phục vụ cả `/api`, `/api-docs` và `/api-docs.json`.
- `db`: PostgreSQL 18, tự khởi tạo schema, quyền và dữ liệu seed từ `db/init` khi volume còn trống.
- Backend đợi PostgreSQL sẵn sàng trước khi chạy. Healthcheck của backend kiểm tra OpenAPI JSON.
- Swagger bao gồm 33 API; không có tài liệu cho API upload file.

## Truy cập

| Dịch vụ | Địa chỉ mặc định |
| --- | --- |
| Swagger UI | http://localhost:3000/api-docs |
| OpenAPI JSON | http://localhost:3000/api-docs.json |
| API | http://localhost:3000/api |
| PostgreSQL từ máy host | localhost:5433 |

Đặt `APP_PUBLISHED_PORT` trong `.env` để đổi cổng Docker backend trên máy host. Container backend luôn dùng cổng `3000`.
Nếu cổng `3000` đang có ứng dụng khác chạy, đặt `APP_PUBLISHED_PORT=3001` rồi mở Swagger tại http://localhost:3001/api-docs.
Đặt `DB_PUBLISHED_PORT` để đổi cổng PostgreSQL trên máy host; mặc định là `5433`.
Trong mạng Compose, backend luôn kết nối đến `db:5432`.

Swagger dùng server tương đối `/api`, nên **Try it out** gọi đúng host/cổng đang mở.
Đăng nhập qua `POST /auth/login`, sao chép `data.accessToken`, rồi dán token vào **Authorize**.

## Xem trạng thái và log

```sh
docker compose ps
docker compose logs --tail=100 server db
```

Sau khi sửa code hoặc tài liệu Swagger, chạy lại `docker compose up --build -d --wait`.
Các file `src/docs` được đóng gói trong image backend khi build.

## Dừng dịch vụ

```sh
docker compose down
```

Dữ liệu PostgreSQL được giữ trong volume `db_data`. Các script `db/init` chỉ tự chạy khi volume chưa có dữ liệu;
cập nhật file SQL không tự áp dụng lại vào database hiện có.
