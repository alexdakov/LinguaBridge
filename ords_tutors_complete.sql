-- ============================================================
-- LinguaBridge – Tutors: complete fix
-- Run ONCE in Oracle Database Actions (F5 / Run Script)
-- Safe to re-run; all steps are idempotent.
-- ============================================================

-- ── 1. Add missing profile columns to tutor_applications ─────
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD role_title VARCHAR2(200)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD languages  VARCHAR2(500)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD quote      VARCHAR2(2000)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD bio_points CLOB';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications ADD photo_url  VARCHAR2(2000)';
EXCEPTION WHEN OTHERS THEN IF SQLCODE != -1430 THEN RAISE; END IF;
END;
/

-- ── 2. Extend status constraint to allow ''inactive'' ─────────
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE tutor_applications DROP CONSTRAINT chk_application_status';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
  EXECUTE IMMEDIATE q'[ALTER TABLE tutor_applications ADD CONSTRAINT chk_application_status
    CHECK (status IN ('pending','approved','rejected','inactive'))]';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- ── 3. (Re)define tutor templates ────────────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(p_module_name => 'linguabridge', p_pattern => 'tutors');
  COMMIT;
END;
/
BEGIN
  ORDS.DEFINE_TEMPLATE(p_module_name => 'linguabridge', p_pattern => 'tutors/:id');
  COMMIT;
END;
/
BEGIN
  ORDS.DEFINE_TEMPLATE(p_module_name => 'linguabridge', p_pattern => 'tutors/published');
  COMMIT;
END;
/

-- ── 4. GET /api/tutors  (admin view: approved + inactive) ────
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

-- ── 5. GET /api/tutors/published  (public site: approved only) ──
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

-- ── 6. POST /api/tutors  (create new tutor) ──────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'tutors',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body   CLOB          := :body_text;
  v_fn     VARCHAR2(100) := JSON_VALUE(v_body, '$.first_name');
  v_ln     VARCHAR2(100) := JSON_VALUE(v_body, '$.last_name');
  v_email  VARCHAR2(255) := NVL(JSON_VALUE(v_body, '$.email'), 'noemail@linguabridge.internal');
  v_langs  VARCHAR2(500) := JSON_VALUE(v_body, '$.languages');
  v_mlang  VARCHAR2(100);
  v_role   VARCHAR2(200) := JSON_VALUE(v_body, '$.role_title');
  v_quote  VARCHAR2(2000):= JSON_VALUE(v_body, '$.quote');
  v_bio    CLOB          := JSON_VALUE(v_body, '$.bio_points');
  v_photo  VARCHAR2(2000):= NVL(JSON_VALUE(v_body, '$.photo_url'), '');
  v_status VARCHAR2(20)  := NVL(JSON_VALUE(v_body, '$.status'), 'approved');
  v_id     NUMBER;
BEGIN
  v_mlang := NVL(TRIM(REGEXP_SUBSTR(v_langs, '[^,]+', 1, 1)), 'Unknown');
  INSERT INTO tutor_applications
    (first_name, last_name, email, main_language, cv_url, status,
     role_title, languages, quote, bio_points, photo_url)
  VALUES
    (v_fn, v_ln, v_email, v_mlang, 'n/a', v_status,
     v_role, v_langs, v_quote, v_bio, v_photo)
  RETURNING id INTO v_id;
  :status_code      := 201;
  :forward_location := '';
  HTP.p('{"success":true,"id":' || v_id || '}');
END;
]'
  );
  COMMIT;
END;
/

-- ── 7. POST /api/tutors/:id  (update tutor profile) ──────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'tutors/:id',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body CLOB := :body_text;
BEGIN
  UPDATE tutor_applications SET
    first_name = NVL(JSON_VALUE(v_body, '$.first_name'), first_name),
    last_name  = NVL(JSON_VALUE(v_body, '$.last_name'),  last_name),
    role_title = NVL(JSON_VALUE(v_body, '$.role_title'), role_title),
    languages  = NVL(JSON_VALUE(v_body, '$.languages'),  languages),
    quote      = NVL(JSON_VALUE(v_body, '$.quote'),      quote),
    bio_points = NVL(JSON_VALUE(v_body, '$.bio_points'), bio_points),
    photo_url  = NVL(JSON_VALUE(v_body, '$.photo_url'),  photo_url),
    status     = NVL(JSON_VALUE(v_body, '$.status'),     status)
  WHERE id = :id;
  :status_code      := 200;
  :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

-- ── 8. DELETE /api/tutors/:id ─────────────────────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'tutors/:id',
    p_method         => 'DELETE',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
BEGIN
  DELETE FROM tutor_applications WHERE id = :id;
  :status_code      := 200;
  :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/
