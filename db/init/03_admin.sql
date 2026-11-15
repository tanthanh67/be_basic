-- Tài khoản ADMIN mặc định.
-- password_hash là bcrypt (10 rounds), khớp với src/utils/password.helper.js.
-- Hãy đổi mật khẩu sau lần đăng nhập đầu tiên khi deploy production.

-- Chỉ cấp quyền ADMIN cho tài khoản vừa được seed tạo mới.
-- Chạy lại seed không đặt lại mật khẩu, thông tin hoặc quyền của user đã tồn tại.
with created_admin as (
insert into users (name, email, password_hash, age) values
	('Tan Thanh', 'tanthanh@gmail.com', '$2b$10$t.e/UPJtFw55/VvIiT7PEOyzsQiQ3zIU4.atIMIpoHzb7jbDplrAi', 25)
on conflict (email) do nothing
returning id
)
insert into user_roles (user_id, role_id)
select u.id, r.id
from created_admin u
join roles r on r.name = 'ADMIN'
on conflict do nothing;

