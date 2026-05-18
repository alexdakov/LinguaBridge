-- ============================================================
-- LinguaBridge – Promo Codes: schema + ORDS endpoints
-- Run in Oracle Database Actions (SQL Worksheet, F5 / Run Script)
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE promo_codes (
      id             NUMBER          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      code           VARCHAR2(50)    NOT NULL UNIQUE,
      discount_type  VARCHAR2(10)    NOT NULL
                     CONSTRAINT chk_promo_type CHECK (discount_type IN (''percent'',''fixed'')),
      discount_value NUMBER(10,2)    NOT NULL,
      max_uses       NUMBER          DEFAULT NULL,
      uses_count     NUMBER          DEFAULT 0 NOT NULL,
      valid_from     DATE            DEFAULT SYSDATE NOT NULL,
      valid_until    DATE            DEFAULT NULL,
      is_active      NUMBER(1)       DEFAULT 1 NOT NULL
                     CONSTRAINT chk_promo_active CHECK (is_active IN (0,1)),
      notes          VARCHAR2(2000),
      created_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
  WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
END;
/

-- ── GET /api/promo_codes ─────────────────────────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'promo_codes'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY,
    p_items_per_page => 500,
    p_source         => q'[
SELECT id, code, discount_type, discount_value, max_uses, uses_count,
       TO_CHAR(valid_from,  'YYYY-MM-DD') AS valid_from,
       TO_CHAR(valid_until, 'YYYY-MM-DD') AS valid_until,
       is_active, notes,
       TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at
FROM   promo_codes
ORDER  BY created_at DESC
]'
  );
  COMMIT;
END;
/

-- ── POST /api/promo_codes (create) ───────────────────────────
BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body  CLOB         := :body_text;
  v_code  VARCHAR2(50) := UPPER(TRIM(JSON_VALUE(v_body, '$.code')));
  v_type  VARCHAR2(10) := NVL(JSON_VALUE(v_body, '$.discount_type'), 'percent');
  v_val   NUMBER       := TO_NUMBER(NVL(JSON_VALUE(v_body, '$.discount_value'), '0'));
  v_max   NUMBER       := TO_NUMBER(JSON_VALUE(v_body, '$.max_uses'));
  v_from  DATE         := NVL(TO_DATE(JSON_VALUE(v_body, '$.valid_from'),  'YYYY-MM-DD'), SYSDATE);
  v_until DATE         := TO_DATE(JSON_VALUE(v_body, '$.valid_until'), 'YYYY-MM-DD');
  v_act   NUMBER(1)    := NVL(TO_NUMBER(JSON_VALUE(v_body, '$.is_active')), 1);
  v_notes VARCHAR2(2000) := JSON_VALUE(v_body, '$.notes');
  v_id    NUMBER;
BEGIN
  IF v_code IS NULL THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"error":"code is required"}'); RETURN;
  END IF;
  INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, valid_from, valid_until, is_active, notes)
  VALUES (v_code, v_type, v_val, v_max, v_from, v_until, v_act, v_notes)
  RETURNING id INTO v_id;
  :status_code := 201; :forward_location := '';
  HTP.p('{"success":true,"id":' || v_id || '}');
END;
]'
  );
  COMMIT;
END;
/

-- ── GET + POST + DELETE /api/promo_codes/:id ─────────────────
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'promo_codes/:id'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.SOURCE_TYPE_QUERY_ONE_ROW,
    p_items_per_page => 1,
    p_source         => q'[
SELECT id, code, discount_type, discount_value, max_uses, uses_count,
       TO_CHAR(valid_from,  'YYYY-MM-DD') AS valid_from,
       TO_CHAR(valid_until, 'YYYY-MM-DD') AS valid_until,
       is_active, notes
FROM   promo_codes WHERE id = :id
]'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes/:id',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_body  CLOB          := :body_text;
  v_code  VARCHAR2(50)  := UPPER(TRIM(JSON_VALUE(v_body, '$.code')));
  v_type  VARCHAR2(10)  := JSON_VALUE(v_body, '$.discount_type');
  v_val   NUMBER        := TO_NUMBER(JSON_VALUE(v_body, '$.discount_value'));
  v_max   NUMBER        := TO_NUMBER(JSON_VALUE(v_body, '$.max_uses'));
  v_from  DATE          := TO_DATE(JSON_VALUE(v_body, '$.valid_from'),  'YYYY-MM-DD');
  v_until DATE          := TO_DATE(JSON_VALUE(v_body, '$.valid_until'), 'YYYY-MM-DD');
  v_act   NUMBER(1)     := TO_NUMBER(JSON_VALUE(v_body, '$.is_active'));
  v_notes VARCHAR2(2000):= JSON_VALUE(v_body, '$.notes');
BEGIN
  UPDATE promo_codes SET
    code           = NVL(v_code,  code),
    discount_type  = NVL(v_type,  discount_type),
    discount_value = NVL(v_val,   discount_value),
    max_uses       = v_max,
    valid_from     = NVL(v_from,  valid_from),
    valid_until    = v_until,
    is_active      = NVL(v_act,   is_active),
    notes          = v_notes
  WHERE id = :id;
  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes/:id',
    p_method         => 'DELETE',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
BEGIN
  DELETE FROM promo_codes WHERE id = :id;
  :status_code := 200; :forward_location := '';
  HTP.p('{"success":true}');
END;
]'
  );
  COMMIT;
END;
/

-- ── POST /api/promo_codes/validate (check a code at checkout) ─
BEGIN
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'linguabridge',
    p_pattern     => 'promo_codes/validate'
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_HANDLER(
    p_module_name    => 'linguabridge',
    p_pattern        => 'promo_codes/validate',
    p_method         => 'POST',
    p_source_type    => ORDS.SOURCE_TYPE_PLSQL,
    p_items_per_page => 0,
    p_source         => q'[
DECLARE
  v_code  VARCHAR2(50) := UPPER(TRIM(JSON_VALUE(:body_text, '$.code')));
  v_id    NUMBER;
  v_type  VARCHAR2(10);
  v_val   NUMBER;
  v_max   NUMBER;
  v_uses  NUMBER;
  v_until DATE;
  v_act   NUMBER(1);
BEGIN
  BEGIN
    SELECT id, discount_type, discount_value, max_uses, uses_count, valid_until, is_active
    INTO   v_id, v_type, v_val, v_max, v_uses, v_until, v_act
    FROM   promo_codes WHERE code = v_code AND SYSDATE >= valid_from;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    :status_code := 404; :forward_location := '';
    HTP.p('{"valid":false,"error":"Code not found"}'); RETURN;
  END;
  IF v_act = 0 THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"valid":false,"error":"Code is inactive"}'); RETURN;
  END IF;
  IF v_until IS NOT NULL AND SYSDATE > v_until THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"valid":false,"error":"Code has expired"}'); RETURN;
  END IF;
  IF v_max IS NOT NULL AND v_uses >= v_max THEN
    :status_code := 400; :forward_location := '';
    HTP.p('{"valid":false,"error":"Code has reached its usage limit"}'); RETURN;
  END IF;
  :status_code := 200; :forward_location := '';
  HTP.p('{"valid":true,"discount_type":"' || v_type || '","discount_value":' || v_val || ',"id":' || v_id || '}');
END;
]'
  );
  COMMIT;
END;
/
