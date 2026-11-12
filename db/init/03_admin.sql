-- Tài khoản ADMIN mặc định.
-- password_hash là bcrypt (10 rounds), khớp với src/utils/password.helper.js.
-- Hãy đổi mật khẩu sau lần đăng nhập đầu tiên khi deploy production.

insert into users (name, email, password_hash, age) values
	('Tan Thanh', 'tanthanh@gmail.com', '$2b$10$t.e/UPJtFw55/VvIiT7PEOyzsQiQ3zIU4.atIMIpoHzb7jbDplrAi', 25)
on conflict (email) do update set
	name = excluded.name,
	password_hash = excluded.password_hash,
	age = excluded.age,
	updated_at = now();

delete from user_roles
using users u
where user_roles.user_id = u.id
  and u.email = 'tanthanh@gmail.com';

insert into user_roles (user_id, role_id)
select u.id, r.id
from users u
join roles r on r.name = 'ADMIN'
where u.email = 'tanthanh@gmail.com'
on conflict do nothing;

