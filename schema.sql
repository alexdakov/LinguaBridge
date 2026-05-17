-- ============================================================
-- LinguaBridge – Oracle Cloud Database Schema
-- Run this script against your Autonomous Database instance.
-- Uses BEGIN/EXCEPTION blocks so re-runs are safe.
-- ============================================================

-- ── 1. USERS ────────────────────────────────────────────────
-- Core user registry; id = Firebase UID (28-char alphanumeric)
BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE users (
            id            VARCHAR2(128)  PRIMARY KEY,
            nickname      VARCHAR2(100),
            first_name    VARCHAR2(100)  NOT NULL,
            last_name     VARCHAR2(100)  NOT NULL,
            email         VARCHAR2(255)  NOT NULL UNIQUE,
            role          VARCHAR2(20)   NOT NULL
                          CONSTRAINT chk_user_role
                          CHECK (role IN (''student'',''tutor'',''admin'')),
            is_active     NUMBER(1)      DEFAULT 1 NOT NULL
                          CONSTRAINT chk_user_active CHECK (is_active IN (0,1)),
            created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
        )';
EXCEPTION
    WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── 2. COURSES ──────────────────────────────────────────────
BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE courses (
            id              VARCHAR2(100)   PRIMARY KEY,
            language        VARCHAR2(50)    NOT NULL,
            course_level    VARCHAR2(20),
            format          VARCHAR2(30),
            price_monthly   NUMBER(10,2),
            is_active       NUMBER(1)       DEFAULT 1 NOT NULL
                            CONSTRAINT chk_course_active CHECK (is_active IN (0,1)),
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
        )';
EXCEPTION
    WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── 3. COURSES_TRANSLATIONS ─────────────────────────────────
-- Maps localized title/description per locale ('en', 'bg', 'ru', 'zh')
BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE courses_translations (
            id          NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            course_id   VARCHAR2(100)   NOT NULL,
            locale      VARCHAR2(5)     NOT NULL,
            title       VARCHAR2(255),
            description VARCHAR2(4000),
            CONSTRAINT fk_ct_course
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            CONSTRAINT uq_ct_course_locale
                UNIQUE (course_id, locale)
        )';
EXCEPTION
    WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── 4. STUDENT_ENROLLMENTS ──────────────────────────────────
-- Intake rows created when a student submits the enrol form.
-- firebase_uid is populated once the account is provisioned.
BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE student_enrollments (
            id                  NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            first_name          VARCHAR2(100)   NOT NULL,
            last_name           VARCHAR2(100)   NOT NULL,
            email               VARCHAR2(255)   NOT NULL,
            phone_number        VARCHAR2(50),
            requested_course_id VARCHAR2(100),
            status              VARCHAR2(20)    DEFAULT ''pending'' NOT NULL
                                CONSTRAINT chk_enrollment_status
                                CHECK (status IN (''pending'',''approved'',''rejected'')),
            firebase_uid        VARCHAR2(128),
            notes               CLOB,
            created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
        )';
EXCEPTION
    WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── 5. TUTOR_APPLICATIONS ───────────────────────────────────
-- Intake rows created when a tutor submits the application form.
BEGIN
    EXECUTE IMMEDIATE '
        CREATE TABLE tutor_applications (
            id              NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            first_name      VARCHAR2(100)   NOT NULL,
            last_name       VARCHAR2(100)   NOT NULL,
            email           VARCHAR2(255)   NOT NULL,
            experience_years NUMBER(3),
            main_language   VARCHAR2(100),
            cv_url          VARCHAR2(2000),
            status          VARCHAR2(20)    DEFAULT ''pending'' NOT NULL
                            CONSTRAINT chk_application_status
                            CHECK (status IN (''pending'',''approved'',''rejected'')),
            notes           CLOB,
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
        )';
EXCEPTION
    WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── Indexes ──────────────────────────────────────────────────
BEGIN EXECUTE IMMEDIATE 'CREATE INDEX idx_enrollment_email  ON student_enrollments(email)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF; END;/
BEGIN EXECUTE IMMEDIATE 'CREATE INDEX idx_enrollment_status ON student_enrollments(status)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF; END;/
BEGIN EXECUTE IMMEDIATE 'CREATE INDEX idx_application_email  ON tutor_applications(email)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF; END;/
BEGIN EXECUTE IMMEDIATE 'CREATE INDEX idx_application_status ON tutor_applications(status)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF; END;/
BEGIN EXECUTE IMMEDIATE 'CREATE INDEX idx_ct_locale ON courses_translations(course_id, locale)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF; END;/

-- ── Sample seed data (optional) ──────────────────────────────
-- INSERT INTO courses (id, language, level, format, price_monthly)
-- VALUES ('ru-beginner-group', 'Russian', 'A1', 'group', 79);
-- INSERT INTO courses_translations (course_id, locale, title, description)
-- VALUES ('ru-beginner-group', 'en', 'Russian for Beginners', 'Group classes, A1 level, 8 sessions/month.');
-- INSERT INTO courses_translations (course_id, locale, title, description)
-- VALUES ('ru-beginner-group', 'bg', 'Руски за начинаещи', 'Групови занятия, ниво A1, 8 занятия/месец.');
-- COMMIT;
