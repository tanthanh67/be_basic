insert into roles (name, description) values
	('ADMIN',  'Quản trị hệ thống: quản lý user, class, mentor và member'),
	('MEMBER', 'Thành viên: học trong các class mình tham gia')
on conflict (name) do nothing;

insert into permissions (name, description) values
	('USER_READ',           'Xem danh sách và chi tiết user'),
	('USER_CREATE',         'Tạo user'),
	('USER_UPDATE',         'Cập nhật user'),
	('USER_DELETE',         'Xóa user'),

	('CLASS_READ_ALL',      'Xem tất cả class'),
	('CLASS_READ_OWN',      'Xem class mình tham gia hoặc làm mentor'),
	('CLASS_CREATE',        'Tạo class'),
	('CLASS_UPDATE',        'Cập nhật class'),
	('CLASS_DELETE',        'Xóa class'),
	('CLASS_ASSIGN_MENTOR', 'Chỉ định mentor cho class'),

	('CLASS_MEMBER_READ',   'Xem danh sách member của class'),
	('CLASS_MEMBER_ADD',    'Thêm member vào class'),
	('CLASS_MEMBER_REMOVE', 'Xóa member khỏi class')
on conflict (name) do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name in (
	'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
	'CLASS_READ_ALL', 'CLASS_CREATE', 'CLASS_UPDATE', 'CLASS_DELETE', 'CLASS_ASSIGN_MENTOR',
	'CLASS_MEMBER_READ', 'CLASS_MEMBER_ADD', 'CLASS_MEMBER_REMOVE'
)
where r.name = 'ADMIN'
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name in (
	'CLASS_READ_OWN'
)
where r.name = 'MEMBER'
on conflict do nothing;
