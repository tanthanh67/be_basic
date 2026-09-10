CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_email
        UNIQUE (email),

    CONSTRAINT user_role
        CHECK (role IN ('ADMIN', 'MEMBER'))
);

CREATE TABLE classes (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE,
    mentorid        BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_class_date
        CHECK (end_date IS NULL OR end_date >= start_date),

    CONSTRAINT fk_classes_mentor
        FOREIGN KEY (mentorid)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE class_members (
    classid         BIGINT NOT NULL,
    memberid        BIGINT NOT NULL,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_class_members
        PRIMARY KEY (classid, memberid),

    CONSTRAINT fk_members_classes
        FOREIGN KEY (classid)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_class_members
        FOREIGN KEY (memberid)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE lessons (
    id              BIGSERIAL PRIMARY KEY,
    classid         BIGINT NOT NULL,
    title           VARCHAR(100) NOT NULL,
    content         TEXT,
    lesson_order    INTEGER NOT NULL,
    created_by      BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lessons_class
        FOREIGN KEY (classid)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lesson_created
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_lessons_order
        UNIQUE (classid, lesson_order),

    CONSTRAINT ck_lessons_order
        CHECK (lesson_order > 0)
);

CREATE TABLE lesson_progress (
    id              BIGSERIAL PRIMARY KEY,
    lessonid        BIGINT NOT NULL,
    memberid        BIGINT NOT NULL,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lesson_progress
        FOREIGN KEY (lessonid)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_progress_member
        FOREIGN KEY (memberid)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_progress_member
        UNIQUE (lessonid, memberid)
);

CREATE TABLE assignments (
    id              BIGSERIAL PRIMARY KEY,
    classid         BIGINT NOT NULL,
    title           VARCHAR(100) NOT NULL,
    description     TEXT,
    deadline        TIMESTAMPTZ,
    maximum_score   NUMERIC(4,2) NOT NULL,
    created_by      BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_class
        FOREIGN KEY (classid)
        REFERENCES classes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_created
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_maximum_score
        CHECK (maximum_score >= 0)
);

CREATE TABLE submissions (
    id              BIGSERIAL PRIMARY KEY,
    assignmentid    BIGINT NOT NULL,
    memberid        BIGINT NOT NULL,
    content         TEXT,
    repositoryurl   VARCHAR(500),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score           NUMERIC(4,2),
    feedback        TEXT,
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     BIGINT,

    CONSTRAINT uq_submissions_assignment_member
        UNIQUE (assignmentid, memberid),

    CONSTRAINT ck_submissions_content_or_repository
        CHECK (content IS NOT NULL OR repositoryurl IS NOT NULL),

    CONSTRAINT ck_submissions_score
        CHECK (score IS NULL OR score >= 0),

    CONSTRAINT fk_submissions_assignment
        FOREIGN KEY (assignmentid)
        REFERENCES assignments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_member
        FOREIGN KEY (memberid)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_submissions_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_classes_mentorid
    ON classes (mentorid);

CREATE INDEX idx_class_members_memberid
    ON class_members (memberid);

CREATE INDEX idx_lesson_progress_member_lesson
    ON lesson_progress (memberid, lessonid);

CREATE INDEX idx_assignments_class_deadline
    ON assignments (classid, deadline);

CREATE INDEX idx_submissions_memberid
    ON submissions (memberid);

CREATE INDEX idx_submissions_assignment_submitted_at
    ON submissions (assignmentid, submitted_at DESC);