create table auth_sessions (
	id uuid primary key,
	user_id integer not null,
	created_at timestamptz not null default now(),
	expires_at timestamptz not null,
	revoked_at timestamptz,

	constraint fk_auth_sessions_user foreign key (user_id)
		references users(id) on delete cascade,

	constraint ck_auth_sessions_expiry check (expires_at > created_at)
);

create index idx_auth_sessions_user_id on auth_sessions(user_id);
