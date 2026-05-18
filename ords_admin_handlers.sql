-- ============================================================
-- LinguaBridge – ORDS admin data endpoints
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- ============================================================

-- ── GET /api/users  (list all users) ────────────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'users',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 500,
    p_source         => 'SELECT id, nickname, first_name, last_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  COMMIT;
END;
/

-- ── GET /api/enrollments  (list all) ────────────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'enrollments',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 500,
    p_source         => 'SELECT id, first_name, last_name, email, phone_number, requested_course_id, status, firebase_uid, notes, created_at FROM student_enrollments ORDER BY created_at DESC'
  );
  COMMIT;
END;
/

-- ── GET /api/applications  (list all) ───────────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'applications',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 500,
    p_source         => 'SELECT id, first_name, last_name, email, experience_years, main_language, cv_url, status, notes, created_at FROM tutor_applications ORDER BY created_at DESC'
  );
  COMMIT;
END;
/

-- ── GET /api/enrollments/:id  (single row) ──────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'enrollments/:id'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'enrollments/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY_ONE_ROW,
    p_items_per_page => 1,
    p_source         => 'SELECT id, first_name, last_name, email, phone_number, requested_course_id, status, firebase_uid, notes, created_at FROM student_enrollments WHERE id = :id'
  );
  COMMIT;
END;
/

-- ── GET /api/applications/:id  (single row) ─────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'applications/:id'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'applications/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY_ONE_ROW,
    p_items_per_page => 1,
    p_source         => 'SELECT id, first_name, last_name, email, experience_years, main_language, cv_url, status, notes, created_at FROM tutor_applications WHERE id = :id'
  );
  COMMIT;
END;
/

-- ── POST /api/enrollments/:id/status ────────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'enrollments/:id/status'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'enrollments/:id/status',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_status VARCHAR2(20) := JSON_VALUE(:body_text, '$.status');
BEGIN
  IF v_status NOT IN ('pending','approved','rejected') THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"error":"Invalid status"}'); RETURN;
  END IF;
  UPDATE student_enrollments SET status = v_status WHERE id = :id;
  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

-- ── POST /api/applications/:id/status ───────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'applications/:id/status'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'applications/:id/status',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_status VARCHAR2(20) := JSON_VALUE(:body_text, '$.status');
BEGIN
  IF v_status NOT IN ('pending','approved','rejected') THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"error":"Invalid status"}'); RETURN;
  END IF;
  UPDATE tutor_applications SET status = v_status WHERE id = :id;
  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

-- ── POST /api/enrollments/:id/approve ───────────────────────
-- Atomically: inserts user row + marks enrollment approved
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'enrollments/:id/approve'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'enrollments/:id/approve',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body   CLOB           := :body_text;
  v_uid    VARCHAR2(128)  := JSON_VALUE(v_body, '$.uid');
  v_nick   VARCHAR2(100)  := JSON_VALUE(v_body, '$.nickname');
  v_fn     VARCHAR2(100);
  v_ln     VARCHAR2(100);
  v_email  VARCHAR2(255);
  v_status VARCHAR2(20);
BEGIN
  SELECT first_name, last_name, email, status
  INTO   v_fn, v_ln, v_email, v_status
  FROM   student_enrollments WHERE id = :id;

  IF v_status != 'pending' THEN
    :status_code := 409; :forward_location := '';
    HTP.p('{"error":"Enrollment already ' || v_status || '"}'); RETURN;
  END IF;

  INSERT INTO users (id, nickname, first_name, last_name, email, role, is_active)
  VALUES (v_uid, v_nick, v_fn, v_ln, v_email, 'student', 1);

  UPDATE student_enrollments
     SET status = 'approved', firebase_uid = v_uid
   WHERE id = :id;

  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

-- ── POST /api/applications/:id/approve ──────────────────────
-- Atomically: inserts user row + marks application approved
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'applications/:id/approve'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'applications/:id/approve',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body   CLOB           := :body_text;
  v_uid    VARCHAR2(128)  := JSON_VALUE(v_body, '$.uid');
  v_nick   VARCHAR2(100)  := JSON_VALUE(v_body, '$.nickname');
  v_fn     VARCHAR2(100);
  v_ln     VARCHAR2(100);
  v_email  VARCHAR2(255);
  v_status VARCHAR2(20);
BEGIN
  SELECT first_name, last_name, email, status
  INTO   v_fn, v_ln, v_email, v_status
  FROM   tutor_applications WHERE id = :id;

  IF v_status != 'pending' THEN
    :status_code := 409; :forward_location := '';
    HTP.p('{"error":"Application already ' || v_status || '"}'); RETURN;
  END IF;

  INSERT INTO users (id, nickname, first_name, last_name, email, role, is_active)
  VALUES (v_uid, v_nick, v_fn, v_ln, v_email, 'tutor', 1);

  UPDATE tutor_applications SET status = 'approved' WHERE id = :id;

  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/
