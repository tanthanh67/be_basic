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
	('CLASS_MEMBER_REMOVE', 'Xóa member khỏi class'),

	('LESSON_READ',           'Xem lesson của class'),
	('LESSON_CREATE',         'Tạo lesson (mentor của class)'),
	('LESSON_UPDATE',         'Cập nhật lesson (mentor của class)'),
	('LESSON_DELETE',         'Xóa lesson (mentor của class)'),
	('LESSON_COMPLETE',       'Đánh dấu hoàn thành lesson'),
	('PROGRESS_READ_OWN',     'Xem tiến độ học của mình'),

	('ASSIGNMENT_READ',       'Xem assignment của class'),
	('ASSIGNMENT_CREATE',     'Tạo assignment (mentor của class)'),
	('ASSIGNMENT_UPDATE',     'Cập nhật assignment (mentor của class)'),
	('ASSIGNMENT_DELETE',     'Xóa assignment (mentor của class)'),

	('SUBMISSION_CREATE',     'Nộp bài'),
	('SUBMISSION_READ_OWN',   'Xem bài nộp của mình'),
	('SUBMISSION_READ_CLASS', 'Xem bài nộp của cả class'),
	('SUBMISSION_REVIEW',     'Chấm bài (mentor của class)')
on conflict (name) do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name in (
	'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
	'CLASS_READ_ALL', 'CLASS_CREATE', 'CLASS_UPDATE', 'CLASS_DELETE', 'CLASS_ASSIGN_MENTOR',
	'CLASS_MEMBER_READ', 'CLASS_MEMBER_ADD', 'CLASS_MEMBER_REMOVE',
	'LESSON_READ', 'ASSIGNMENT_READ', 'SUBMISSION_READ_CLASS'
)
where r.name = 'ADMIN'
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
join permissions p on p.name in (
	'CLASS_READ_OWN',
	'LESSON_READ', 'LESSON_CREATE', 'LESSON_UPDATE', 'LESSON_DELETE', 'LESSON_COMPLETE', 'PROGRESS_READ_OWN',
	'ASSIGNMENT_READ', 'ASSIGNMENT_CREATE', 'ASSIGNMENT_UPDATE', 'ASSIGNMENT_DELETE',
	'SUBMISSION_CREATE', 'SUBMISSION_READ_OWN', 'SUBMISSION_READ_CLASS', 'SUBMISSION_REVIEW'
)
where r.name = 'MEMBER'
on conflict do nothing;
