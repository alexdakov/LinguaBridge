-- ============================================================
-- LinguaBridge – ORDS tutor write endpoints
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- ============================================================

-- ── POST /api/tutors  (create new tutor, status = approved) ─
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
  v_role   VARCHAR2(100) := JSON_VALUE(v_body, '$.role_title');
  v_quote  VARCHAR2(2000):= JSON_VALUE(v_body, '$.quote');
  v_bio    VARCHAR2(4000):= JSON_VALUE(v_body, '$.bio_points');
  v_photo  VARCHAR2(2000):= NVL(JSON_VALUE(v_body, '$.photo_url'), '');
  v_status VARCHAR2(20)  := NVL(JSON_VALUE(v_body, '$.status'), 'approved');
  v_id     NUMBER;
BEGIN
  v_mang := NVL(TRIM(REGEXP_SUBSTR(v_langs, '[^,]+', 1, 1)), 'Unknown');
  INSERT INTO tutor_applications
    (first_name, last_name, email, main_language, cv_url, status,
     role_title, languages, quote, bio_points, photo_url)
  VALUES
    (v_fn, v_ln, v_email, v_mang, 'n/a', v_status,
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

-- ── POST /api/tutors/:id  (update tutor profile fields) ─────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'tutors/:id'
  );
  COMMIT;
END;
/

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
    role_title = JSON_VALUE(v_body, '$.role_title'),
    languages  = JSON_VALUE(v_body, '$.languages'),
    quote      = JSON_VALUE(v_body, '$.quote'),
    bio_points = JSON_VALUE(v_body, '$.bio_points'),
    photo_url  = JSON_VALUE(v_body, '$.photo_url'),
    status     = NVL(JSON_VALUE(v_body, '$.status'), status)
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

-- ── DELETE /api/tutors/:id ───────────────────────────────────
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
