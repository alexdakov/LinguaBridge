-- ============================================================
-- LinguaBridge – Schema migration: extend tutor_applications
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- ============================================================

-- ── Add tutor profile columns ────────────────────────────────
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD role_title  VARCHAR2(200)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD languages   VARCHAR2(500)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD quote       VARCHAR2(2000)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD bio_points  CLOB';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD photo_url   VARCHAR2(2000)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/

-- ── Extend status constraint to allow ''inactive'' ────────────
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications DROP CONSTRAINT chk_application_status';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2443 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD CONSTRAINT chk_application_status
    CHECK (status IN (''pending'',''approved'',''rejected'',''inactive''))';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -2264 THEN RAISE; END IF;
END;
/

-- ── GET /api/tutors handler (approved tutors with all profile fields) ──
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'tutors'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'tutors',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 200,
    p_source         => q'[
SELECT id, first_name, last_name, email, main_language,
       role_title, languages, quote, bio_points, photo_url,
       status, cv_url, created_at
FROM   tutor_applications
WHERE  status IN ('approved','inactive')
ORDER  BY id
]'
  );
  COMMIT;
END;
/

-- ── GET /api/tutors/published (only approved – for the public website) ──
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'tutors/published'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'tutors/published',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 200,
    p_source         => q'[
SELECT id, first_name, last_name, role_title, languages,
       quote, bio_points, photo_url, main_language
FROM   tutor_applications
WHERE  status = 'approved'
ORDER  BY id
]'
  );
  COMMIT;
END;
/
