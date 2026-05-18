-- ============================================================
-- LinguaBridge – ORDS handlers for the users table
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- ============================================================

-- ── GET /api/users/:uid  →  returns one user row ────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'users/:uid'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'users/:uid',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY_ONE_ROW,
    p_items_per_page => 1,
    p_source         => 'SELECT id, nickname, first_name, last_name, email, role, is_active FROM users WHERE id = :uid'
  );
  COMMIT;
END;
/

-- ── POST /api/users  →  insert or update a user row ─────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'users'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'users',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body  CLOB    := :body_text;
  v_id    VARCHAR2(128);
  v_fn    VARCHAR2(100);
  v_ln    VARCHAR2(100);
  v_email VARCHAR2(255);
  v_nick  VARCHAR2(100);
  v_role  VARCHAR2(20);
BEGIN
  v_id    := JSON_VALUE(v_body, '$.id');
  v_fn    := JSON_VALUE(v_body, '$.first_name');
  v_ln    := JSON_VALUE(v_body, '$.last_name');
  v_email := JSON_VALUE(v_body, '$.email');
  v_nick  := JSON_VALUE(v_body, '$.nickname');
  v_role  := JSON_VALUE(v_body, '$.role');

  MERGE INTO users u
  USING DUAL ON (u.id = v_id)
  WHEN MATCHED THEN
    UPDATE SET
      first_name = NVL(v_fn,    u.first_name),
      last_name  = NVL(v_ln,    u.last_name),
      email      = NVL(v_email, u.email),
      nickname   = NVL(v_nick,  u.nickname),
      role       = NVL(v_role,  u.role)
  WHEN NOT MATCHED THEN
    INSERT (id, first_name, last_name, email, nickname, role, is_active)
    VALUES (v_id, v_fn, v_ln, v_email, v_nick, v_role, 1);

  :status_code      := 200;
  :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/
