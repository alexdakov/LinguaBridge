-- ============================================================
-- LinguaBridge – ORDS POST handlers for form intake
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- Module name: linguabridge  (base path /api/)
-- ============================================================

-- ── 1. student_enrollments POST endpoint ────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'enrollments'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'enrollments',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body   CLOB    := :body_text;
  v_fn     VARCHAR2(100);
  v_ln     VARCHAR2(100);
  v_email  VARCHAR2(255);
  v_phone  VARCHAR2(50);
  v_cid    VARCHAR2(100);
  v_notes  CLOB;
  v_id     NUMBER;
BEGIN
  v_fn    := JSON_VALUE(v_body, '$.first_name');
  v_ln    := JSON_VALUE(v_body, '$.last_name');
  v_email := JSON_VALUE(v_body, '$.email');
  v_phone := JSON_VALUE(v_body, '$.phone_number');
  v_cid   := JSON_VALUE(v_body, '$.requested_course_id');
  v_notes := JSON_VALUE(v_body, '$.notes');

  INSERT INTO student_enrollments
    (first_name, last_name, email, phone_number, requested_course_id, status, notes)
  VALUES
    (v_fn, v_ln, v_email, v_phone, v_cid, 'pending', v_notes)
  RETURNING id INTO v_id;

  :status_code      := 201;
  :forward_location := '';
  HTP.p('{"success":true,"enrollmentId":' || v_id || '}');
END;
]'
  );
  COMMIT;
END;
/

-- ── 2. tutor_applications POST endpoint ─────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'applications'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'applications',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body    CLOB    := :body_text;
  v_fn      VARCHAR2(100);
  v_ln      VARCHAR2(100);
  v_email   VARCHAR2(255);
  v_exp     NUMBER;
  v_lang    VARCHAR2(100);
  v_cv_url  VARCHAR2(2000);
  v_notes   CLOB;
  v_id      NUMBER;
BEGIN
  v_fn     := JSON_VALUE(v_body, '$.first_name');
  v_ln     := JSON_VALUE(v_body, '$.last_name');
  v_email  := JSON_VALUE(v_body, '$.email');
  v_exp    := TO_NUMBER(JSON_VALUE(v_body, '$.experience_years'));
  v_lang   := JSON_VALUE(v_body, '$.main_language');
  v_cv_url := JSON_VALUE(v_body, '$.cv_url');
  v_notes  := JSON_VALUE(v_body, '$.notes');

  INSERT INTO tutor_applications
    (first_name, last_name, email, experience_years, main_language, cv_url, status, notes)
  VALUES
    (v_fn, v_ln, v_email, v_exp, v_lang, v_cv_url, 'pending', v_notes)
  RETURNING id INTO v_id;

  :status_code      := 201;
  :forward_location := '';
  HTP.p('{"success":true,"applicationId":' || v_id || '}');
END;
]'
  );
  COMMIT;
END;
/
