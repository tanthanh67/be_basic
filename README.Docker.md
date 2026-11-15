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
- `db`: PostgreSQL 18, lưu dữ liệu trong volume `db_data`.
- `server`: đợi PostgreSQL sẵn sàng, chạy `npm run db:setup` (migration rồi seed) trước khi khởi động backend. Lỗi migration/seed sẽ ngăn backend khởi động.
- Giữ nguyên SQL trong `db/init`; Compose không còn mount thư mục này vào PostgreSQL để tránh có hai cơ chế chạy SQL.
- Healthcheck của backend kiểm tra OpenAPI JSON.
- Swagger bao gồm 34 API; không có tài liệu cho API upload file.

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

## Đăng nhập, refresh và logout

Mỗi lần login tạo một phiên trong `auth_sessions`. Access token và refresh token cùng mang `sessionId`. Access token mặc định hết hạn sau 15 phút (`JWT_EXPIRES_IN=15m`); refresh token mặc định 7 ngày (`JWT_REFRESH_EXPIRES_IN=7d`). Giá trị đã cấu hình trong `.env` được ưu tiên. Thời hạn phiên khớp với refresh token.

Login chỉ trả `data.user` và `data.accessToken` trong JSON. Refresh token được đặt trong cookie `refresh` với `HttpOnly`, `SameSite=Lax`, `Path=/` và `Expires` khớp với thời hạn token. Frontend không đọc hoặc lưu refresh token vào localStorage. Service vẫn tạo/thu hồi phiên trong `auth_sessions` như trước.

Login, refresh và logout yêu cầu header `X-Requested-With: XMLHttpRequest`. Đây là biện pháp chống CSRF bằng [custom request header theo OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi), kết hợp với SameSite. Thiếu/sai header trả `403` trước khi tạo/thu hồi phiên hay thay đổi cookie.

Ví dụ frontend chạy cùng origin với API (cùng giao thức, host và cổng):

```js
const authHeaders = { "X-Requested-With": "XMLHttpRequest" };

const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  credentials: "include",
  headers: { ...authHeaders, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!loginResponse.ok) throw new Error("Đăng nhập thất bại");
let { accessToken, user } = (await loginResponse.json()).data;

const refreshResponse = await fetch("/api/auth/refresh", {
  method: "POST",
  credentials: "include",
  headers: authHeaders,
});
if (!refreshResponse.ok) throw new Error("Không thể làm mới phiên đăng nhập");
accessToken = (await refreshResponse.json()).data.accessToken;

const logoutResponse = await fetch("/api/auth/logout", {
  method: "POST",
  credentials: "include",
  headers: authHeaders,
});
// Xóa trạng thái đăng nhập trên frontend; server gửi header xóa cookie.
accessToken = null;
user = null;
if (!logoutResponse.ok) throw new Error("Server chưa xác nhận thu hồi phiên");
```

- Refresh/logout không cần body hoặc access token; chỉ đọc cookie, không dùng `refreshToken` trong JSON làm phương án dự phòng.
- Refresh chỉ cấp access token khi phiên còn hạn và chưa bị thu hồi; refresh token không đổi.
- Logout thu hồi đúng phiên trong database rồi xóa cookie. Phiên khác không bị ảnh hưởng. Gửi lại cùng cookie còn hạn vẫn trả `200` nếu phiên đã bị thu hồi hoặc không còn tồn tại; gọi lại sau khi trình duyệt đã xóa cookie trả `401`.
- Cookie thiếu, sai, hết hạn, trùng tên hoặc token không có `sessionId` trả `401`. Lỗi database trả `500`, không báo thành công; controller logout vẫn gửi header xóa cookie khi trả `401` hoặc `500`.
- Trong Swagger: login trước, giữ giá trị mặc định của header `X-Requested-With`, sau đó gọi refresh/logout. Trình duyệt tự lưu/gửi cookie; không nhập cookie trong **Authorize**. Các API dùng Bearer vẫn cần `accessToken` trong **Authorize**, và cần xóa token tại đó khi logout. Postman cũng cần header này và bật cookie jar.
- Access token đã cấp vẫn dùng được đến khi hết hạn. Middleware không truy vấn phiên ở mỗi request. Đăng nhập lại sau khi chuyển đổi để nhận cookie và phiên phù hợp.
- Migration `04_create_auth_sessions.sql` phải được áp dụng trước khi dùng login; Compose tự chạy migrations khi khởi động. Cách tổ chức SQL không thay đổi.

Compose mặc định `COOKIE_SECURE=false` để chạy HTTP localhost. Khi triển khai HTTPS, đặt `COOKIE_SECURE=true` trong `.env` rồi build/chạy lại. Chạy Node trực tiếp sẽ mặc định bật Secure khi `NODE_ENV=production`; chỉ chấp nhận giá trị `true` hoặc `false` nếu cấu hình biến này.

Hiện chưa bật CORS. Nếu frontend khác origin (ví dụ localhost:5173 gọi localhost:3000), dùng dev proxy `/api` hoặc cấu hình CORS với đúng origin frontend, `credentials: true` và cho phép header `X-Requested-With`, `Content-Type`, `Authorization`. Không phản chiếu tùy ý Origin hoặc cho phép mọi origin. Nếu frontend/API khác site, cần xem lại SameSite và cấu hình HTTPS trước khi dùng cookie.

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

Dữ liệu PostgreSQL được giữ trong volume `db_data`.

## Migration và seed

Cấu trúc SQL hiện tại được giữ nguyên:

```text
db/init/
  01_schema.sql
  02_seed.sql
  03_admin.sql
  04_create_auth_sessions.sql
scripts/
  database.js
  migrate.js
  seed.js
```

- `npm run db:migrate`: chạy các migration chưa áp dụng và ghi `name`, `checksum`, `applied_at` vào `public.schema_migrations`. Mỗi migration chạy trong một transaction. Lỗi SQL sẽ rollback migration đó và dừng.
- `npm run db:seed`: chạy `02_seed.sql` rồi `03_admin.sql` trong một transaction. Hai file này là seed, được loại khỏi danh sách migrations. Seed chỉ bổ sung quyền và dữ liệu thiếu; không đặt lại mật khẩu, thông tin hoặc role của tài khoản admin đã tồn tại. Tài khoản trùng email có sẵn cũng không tự được cấp ADMIN.
- `npm run db:setup`: chạy migration rồi seed.

Thêm thay đổi schema bằng file SQL mới trong chính `db/init`, dùng số tiếp theo sau `04_create_auth_sessions.sql`. Dùng số thứ tự tăng dần và duy nhất; không sửa/xóa migration đã áp dụng. Runner chặn file đã chạy có checksum thay đổi. Không đặt `BEGIN`, `COMMIT`, `ROLLBACK` hay thao tác không chạy được trong transaction vào migration; runner quản lý transaction. Dùng bảng trong schema `public`.

Database cũ chưa có lịch sử migrations: runner tạo schema tham chiếu tạm trong transaction và đối chiếu các bảng, cột, constraints, indexes của `01_schema.sql` với database hiện có. Chỉ khi khớp mới ghi nhận migration đầu tiên, không tạo lại bảng hay thay đổi dữ liệu ứng dụng. Bảng phụ ngoài schema ban đầu được giữ lại. Nếu khác cấu trúc, runner dừng và nêu các bảng cần đối chiếu. Database user cần quyền tạo schema cho lần chuyển đổi này. Chỉ tự nhận diện schema ban đầu; các migration tiếp theo phải do runner áp dụng.

Chạy thủ công trong container đang hoạt động:

```sh
docker compose exec server npm run db:migrate
docker compose exec server npm run db:seed
```

Nếu server chưa khởi động được, chạy `docker compose up -d db`, sau đó dùng một container tác vụ:

```sh
docker compose run --rm --build server npm run db:setup
```

Chạy trên máy host cần Node.js và `.env` trỏ đến database đang chạy. Với PostgreSQL của Compose, dùng `DB_HOST=localhost`, `DB_PORT=5433` (hoặc cổng `DB_PUBLISHED_PORT` đã cấu hình):

```sh
npm run db:setup
```
