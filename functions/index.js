'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LinguaBridge – Firebase Cloud Functions
//
// Layers implemented here:
//   1. Form Intake  – submitStudentEnrollment, submitTutorApplication
//   2. Admin Approval – approveStudent, approveTutor  (onCall, auth required)
//   3. Course Catalog – getCourses   (?lang= translation join)
//   4. Moodle          – enrolStudent (existing, kept as-is)
// ─────────────────────────────────────────────────────────────────────────────

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString }    = require('firebase-functions/params');
const { initializeApp, getApps }        = require('firebase-admin/app');
const { getAuth }                       = require('firebase-admin/auth');
const { getStorage }                    = require('firebase-admin/storage');
const Busboy                            = require('busboy');
const crypto                            = require('crypto');
const db                                = require('./lib/db');

// ── Firebase Admin init (idempotent) ─────────────────────────────────────────
if (!getApps().length) initializeApp();

// ── Secrets / params ─────────────────────────────────────────────────────────
const MOODLE_TOKEN    = defineSecret('MOODLE_TOKEN');
const ALLOWED_ORIGIN  = defineString('ALLOWED_ORIGIN', { default: '*' });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Set CORS headers so browser fetch works from the hosted domain. */
function setCors(req, res) {
  const origin = ALLOWED_ORIGIN.value() || '*';
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/** Respond to CORS pre-flight and return true if the caller should stop. */
function handlePreflight(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return true; }
  return false;
}

/** Split "Jane Smith" → { first_name: "Jane", last_name: "Smith" }. */
function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  return {
    first_name: parts[0] || '',
    last_name:  parts.slice(1).join(' ') || '',
  };
}

function safeParseJSON(str) {
  try { return str ? JSON.parse(str) : {}; } catch { return {}; }
}

/** Generate a cryptographically random temporary password. */
function tmpPassword() {
  // 20 random chars + forced uppercase + digit + symbol to satisfy policies
  return crypto.randomBytes(15).toString('base64url') + 'A1!';
}

/**
 * Parse a multipart/form-data request with Busboy.
 * Returns { fields: {key:value}, files: [{fieldname, filename, buffer, mimetype}] }
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb      = Busboy({ headers: req.headers });
    const fields  = {};
    const files   = [];

    bb.on('field', (name, val) => { fields[name] = val; });
    bb.on('file',  (name, stream, info) => {
      const chunks = [];
      stream.on('data', c  => chunks.push(c));
      stream.on('end',  () => files.push({
        fieldname: name,
        filename:  info.filename,
        mimetype:  info.mimeType,
        buffer:    Buffer.concat(chunks),
      }));
    });
    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error',  reject);
    req.pipe(bb);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1a. PUBLIC: Student Enrolment Intake
// POST /submitStudentEnrollment
// Body (JSON): { name, email, phone_number, requested_course_id, ...extra }
// ─────────────────────────────────────────────────────────────────────────────
exports.submitStudentEnrollment = onRequest(
  { cors: false },
  async (req, res) => {
    if (handlePreflight(req, res)) return;
    setCors(req, res);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body || {};
    const { name = '', email = '', phone_number = '', requested_course_id = '' } = body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { first_name, last_name } = splitName(name);

    // Serialise any extra intake fields (level, lessonTypes, etc.) as JSON notes
    const { name: _n, email: _e, phone_number: _p, requested_course_id: _c, ...extra } = body;
    const notes = Object.keys(extra).length ? JSON.stringify(extra) : null;

    const result = await db.execute(
      `INSERT INTO student_enrollments
         (first_name, last_name, email, phone_number, requested_course_id, status, notes)
       VALUES
         (:first_name, :last_name, :email, :phone_number, :course_id, 'pending', :notes)
       RETURNING id INTO :inserted_id`,
      {
        first_name,
        last_name,
        email,
        phone_number: phone_number || null,
        course_id:    requested_course_id || null,
        notes:        notes || null,
        inserted_id:  { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
      },
    );

    const enrollmentId = result.outBinds.inserted_id[0];
    return res.status(201).json({ success: true, enrollmentId });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 1b. PUBLIC: Tutor Application Intake  (multipart/form-data)
// POST /submitTutorApplication
// Fields: name, email, experience_years, main_language, [+ extra text fields]
// File:   cv  (PDF, max 10 MB)
// ─────────────────────────────────────────────────────────────────────────────
exports.submitTutorApplication = onRequest(
  { cors: false },
  async (req, res) => {
    if (handlePreflight(req, res)) return;
    setCors(req, res);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // ── Parse multipart body ────────────────────────────────────────────────
    let fields, files;
    try {
      ({ fields, files } = await parseMultipart(req));
    } catch (err) {
      return res.status(400).json({ error: 'Could not parse form data', detail: err.message });
    }

    const { name = '', email = '', experience_years = '', main_language = '', ...extra } = fields;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { first_name, last_name } = splitName(name);
    const expYears = experience_years ? parseInt(experience_years, 10) : null;

    // ── Upload CV to Firebase Storage ───────────────────────────────────────
    let cvUrl = null;
    const cvFile = files.find(f => f.fieldname === 'cv');
    if (cvFile && cvFile.buffer.length > 0) {
      const ext      = cvFile.filename.split('.').pop() || 'pdf';
      const safeName = `${first_name}_${last_name}_${Date.now()}.${ext}`
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const bucket   = getStorage().bucket();
      const gcsFile  = bucket.file(`cvs/${safeName}`);

      await gcsFile.save(cvFile.buffer, {
        contentType: cvFile.mimetype || 'application/pdf',
        metadata:    { cacheControl: 'private, max-age=0' },
      });

      // Signed URL valid for 10 years – long-lived link for admin access
      const [signedUrl] = await gcsFile.getSignedUrl({
        action:  'read',
        expires: new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000),
      });
      cvUrl = signedUrl;
    }

    // ── Serialise extra intake fields as JSON notes ─────────────────────────
    const notes = Object.keys(extra).length ? JSON.stringify(extra) : null;

    const oracledb = require('oracledb');
    const result = await db.execute(
      `INSERT INTO tutor_applications
         (first_name, last_name, email, experience_years, main_language, cv_url, status, notes)
       VALUES
         (:first_name, :last_name, :email, :exp_years, :main_lang, :cv_url, 'pending', :notes)
       RETURNING id INTO :inserted_id`,
      {
        first_name,
        last_name,
        email,
        exp_years: expYears,
        main_lang: main_language || null,
        cv_url:    cvUrl,
        notes:     notes || null,
        inserted_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );

    const applicationId = result.outBinds.inserted_id[0];
    return res.status(201).json({ success: true, applicationId, cvUploaded: !!cvUrl });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2a. ADMIN CALLABLE: approveStudent
// Provisions a Firebase Auth account and logs the user in the Oracle USERS
// table, then stamps the enrollment row as 'approved'.
//
// Request data: { enrollmentId: number, chosenNickname: string }
// Caller must be authenticated with admin custom claim { admin: true }.
// ─────────────────────────────────────────────────────────────────────────────
exports.approveStudent = onCall(async (request) => {
  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }
  if (!request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Requires admin privileges.');
  }

  const { enrollmentId, chosenNickname } = request.data;
  if (!enrollmentId || !chosenNickname) {
    throw new HttpsError('invalid-argument', 'enrollmentId and chosenNickname are required.');
  }

  // ── Fetch enrollment row ──────────────────────────────────────────────────
  const rows = await db.execute(
    `SELECT id, first_name, last_name, email, status
       FROM student_enrollments
      WHERE id = :id`,
    [enrollmentId],
  );

  if (!rows.rows.length) {
    throw new HttpsError('not-found', `No enrollment found with id ${enrollmentId}.`);
  }
  const enrol = rows.rows[0];
  if (enrol.STATUS !== 'pending') {
    throw new HttpsError('failed-precondition', `Enrollment is already '${enrol.STATUS}'.`);
  }

  // ── Provision Firebase Auth user ─────────────────────────────────────────
  let uid;
  try {
    const userRecord = await getAuth().createUser({
      email:         enrol.EMAIL,
      password:      tmpPassword(),
      displayName:   `${enrol.FIRST_NAME} ${enrol.LAST_NAME}`,
      emailVerified: false,
      disabled:      false,
    });
    uid = userRecord.uid;
    await getAuth().setCustomUserClaims(uid, { role: 'student' });
  } catch (authErr) {
    throw new HttpsError('already-exists',
      `Firebase Auth: ${authErr.message}`, { code: authErr.code });
  }

  // ── Oracle writes (transactional) ─────────────────────────────────────────
  try {
    await db.executeTransaction([
      {
        sql: `INSERT INTO users
                (id, nickname, first_name, last_name, email, role, is_active)
              VALUES
                (:id, :nickname, :first_name, :last_name, :email, 'student', 1)`,
        binds: {
          id:         uid,
          nickname:   chosenNickname,
          first_name: enrol.FIRST_NAME,
          last_name:  enrol.LAST_NAME,
          email:      enrol.EMAIL,
        },
      },
      {
        sql: `UPDATE student_enrollments
                 SET status = 'approved', firebase_uid = :uid
               WHERE id = :id`,
        binds: { uid, id: enrollmentId },
      },
    ]);
  } catch (dbErr) {
    // ── Rollback: delete the just-created Firebase Auth account ─────────────
    await getAuth().deleteUser(uid).catch(() => {});
    throw new HttpsError('internal',
      `Oracle write failed; Firebase Auth account rolled back. Detail: ${dbErr.message}`);
  }

  // Send password-reset email so the student can set their own password
  const resetLink = await getAuth().generatePasswordResetLink(enrol.EMAIL).catch(() => null);

  return {
    success:    true,
    uid,
    resetLink,  // pass this to your email service / admin UI
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2b. ADMIN CALLABLE: approveTutor
// Same pattern as approveStudent but sources data from tutor_applications
// and assigns role = 'tutor'.
//
// Request data: { applicationId: number, chosenNickname: string }
// ─────────────────────────────────────────────────────────────────────────────
exports.approveTutor = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be signed in.');
  }
  if (!request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Requires admin privileges.');
  }

  const { applicationId, chosenNickname } = request.data;
  if (!applicationId || !chosenNickname) {
    throw new HttpsError('invalid-argument', 'applicationId and chosenNickname are required.');
  }

  // ── Fetch application row ─────────────────────────────────────────────────
  const rows = await db.execute(
    `SELECT id, first_name, last_name, email, status
       FROM tutor_applications
      WHERE id = :id`,
    [applicationId],
  );

  if (!rows.rows.length) {
    throw new HttpsError('not-found', `No application found with id ${applicationId}.`);
  }
  const app = rows.rows[0];
  if (app.STATUS !== 'pending') {
    throw new HttpsError('failed-precondition', `Application is already '${app.STATUS}'.`);
  }

  // ── Provision Firebase Auth user ─────────────────────────────────────────
  let uid;
  try {
    const userRecord = await getAuth().createUser({
      email:         app.EMAIL,
      password:      tmpPassword(),
      displayName:   `${app.FIRST_NAME} ${app.LAST_NAME}`,
      emailVerified: false,
      disabled:      false,
    });
    uid = userRecord.uid;
    await getAuth().setCustomUserClaims(uid, { role: 'tutor' });
  } catch (authErr) {
    throw new HttpsError('already-exists',
      `Firebase Auth: ${authErr.message}`, { code: authErr.code });
  }

  // ── Oracle writes (transactional) ─────────────────────────────────────────
  try {
    await db.executeTransaction([
      {
        sql: `INSERT INTO users
                (id, nickname, first_name, last_name, email, role, is_active)
              VALUES
                (:id, :nickname, :first_name, :last_name, :email, 'tutor', 1)`,
        binds: {
          id:         uid,
          nickname:   chosenNickname,
          first_name: app.FIRST_NAME,
          last_name:  app.LAST_NAME,
          email:      app.EMAIL,
        },
      },
      {
        sql: `UPDATE tutor_applications
                 SET status = 'approved'
               WHERE id = :id`,
        binds: { id: applicationId },
      },
    ]);
  } catch (dbErr) {
    // ── Rollback: delete the just-created Firebase Auth account ─────────────
    await getAuth().deleteUser(uid).catch(() => {});
    throw new HttpsError('internal',
      `Oracle write failed; Firebase Auth account rolled back. Detail: ${dbErr.message}`);
  }

  const resetLink = await getAuth().generatePasswordResetLink(app.EMAIL).catch(() => null);

  return { success: true, uid, resetLink };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2c. ADMIN CALLABLE: getEnrollments
// Returns all student_enrollments rows, newest first.
// ─────────────────────────────────────────────────────────────────────────────
exports.getEnrollments = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const result = await db.execute(
    `SELECT id, first_name, last_name, email, phone_number,
            requested_course_id, status, firebase_uid, notes, created_at
       FROM student_enrollments
      ORDER BY created_at DESC`,
  );
  const enrollments = result.rows.map(r => {
    const extra = safeParseJSON(r.NOTES);
    return {
      id:              r.ID,
      name:            `${r.FIRST_NAME || ''} ${r.LAST_NAME || ''}`.trim(),
      email:           r.EMAIL,
      phone:           r.PHONE_NUMBER,
      courseId:        r.REQUESTED_COURSE_ID,
      status:          r.STATUS,
      firebaseUid:     r.FIREBASE_UID,
      createdAt:       r.CREATED_AT,
      ...extra,
    };
  });
  return { enrollments };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2d. ADMIN CALLABLE: getApplications
// Returns all tutor_applications rows, newest first.
// ─────────────────────────────────────────────────────────────────────────────
exports.getApplications = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const result = await db.execute(
    `SELECT id, first_name, last_name, email, experience_years,
            main_language, cv_url, status, notes, created_at
       FROM tutor_applications
      ORDER BY created_at DESC`,
  );
  const applications = result.rows.map(r => {
    const extra = safeParseJSON(r.NOTES);
    return {
      id:              r.ID,
      name:            `${r.FIRST_NAME || ''} ${r.LAST_NAME || ''}`.trim(),
      email:           r.EMAIL,
      experienceYears: r.EXPERIENCE_YEARS,
      mainLanguage:    r.MAIN_LANGUAGE,
      cvUrl:           r.CV_URL,
      status:          r.STATUS,
      createdAt:       r.CREATED_AT,
      ...extra,
    };
  });
  return { applications };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2e. ADMIN CALLABLE: updateEnrollmentStatus
// ─────────────────────────────────────────────────────────────────────────────
exports.updateEnrollmentStatus = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { enrollmentId, status } = request.data;
  const VALID = ['pending', 'approved', 'rejected'];
  if (!enrollmentId || !VALID.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of: ${VALID.join(', ')}`);
  }
  await db.execute(
    `UPDATE student_enrollments SET status = :status WHERE id = :id`,
    { status, id: enrollmentId },
  );
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2f. ADMIN CALLABLE: updateApplicationStatus
// ─────────────────────────────────────────────────────────────────────────────
exports.updateApplicationStatus = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { applicationId, status } = request.data;
  const VALID = ['pending', 'approved', 'rejected'];
  if (!applicationId || !VALID.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of: ${VALID.join(', ')}`);
  }
  await db.execute(
    `UPDATE tutor_applications SET status = :status WHERE id = :id`,
    { status, id: applicationId },
  );
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 2g. PUBLIC: submitPasswordResetRequest
// POST body: { email, message? }
// Stores request in Firestore for admin review.
// ─────────────────────────────────────────────────────────────────────────────
exports.submitPasswordResetRequest = onRequest(
  { cors: false },
  async (req, res) => {
    if (handlePreflight(req, res)) return;
    setCors(req, res);
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email = '', message = '' } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { getFirestore, Timestamp } = require('firebase-admin/firestore');
    const fsdb = getFirestore();
    await fsdb.collection('passwordResetRequests').add({
      email:     email.toLowerCase().trim(),
      message:   message.trim() || null,
      status:    'pending',
      createdAt: Timestamp.now(),
    });

    return res.status(201).json({ success: true });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2h. ADMIN CALLABLE: sendPasswordResetLink
// Generates a Firebase password-reset link and marks the request resolved.
// ─────────────────────────────────────────────────────────────────────────────
exports.sendPasswordResetLink = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { requestId, email } = request.data;
  if (!requestId || !email) throw new HttpsError('invalid-argument', 'requestId and email required.');

  const resetLink = await getAuth().generatePasswordResetLink(email);

  const { getFirestore, Timestamp } = require('firebase-admin/firestore');
  const fsdb = getFirestore();
  await fsdb.collection('passwordResetRequests').doc(requestId).update({
    status:     'resolved',
    resolvedAt: Timestamp.now(),
    resolvedBy: request.auth.uid,
  });

  return { success: true, resetLink };
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PUBLIC: getCourses – localized course catalog
// GET /getCourses?lang=en   (defaults to 'en')
//
// Returns all active courses with title/description in the requested locale,
// falling back to the English translation when the locale is absent.
// ─────────────────────────────────────────────────────────────────────────────
const ORDS_BASE = 'https://g328014ebe6dc91-linguabridgedb.adb.uk-london-1.oraclecloudapps.com/ords/admin';

exports.getCourses = onRequest(
  { cors: false },
  async (req, res) => {
    if (handlePreflight(req, res)) return;
    setCors(req, res);

    const lang = (req.query.lang || 'en').toLowerCase().trim();

    const ordsRes = await fetch(`${ORDS_BASE}/api/courses?lang=${encodeURIComponent(lang)}`);
    if (!ordsRes.ok) {
      return res.status(502).json({ error: 'ORDS request failed', status: ordsRes.status });
    }
    const data = await ordsRes.json();

    const courses = (data.items || []).map(r => ({
      id:           r.id,
      language:     r.language,
      level:        r.course_level,
      format:       r.format,
      priceMonthly: r.price_monthly,
      durationMin:  r.duration_min || 60,
      title:        r.title,
      description:  r.description,
    }));
    return res.json({ courses, locale: lang });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: write one row to audit_log (fire-and-forget, never throws)
// ─────────────────────────────────────────────────────────────────────────────
async function writeAudit(actorUid, action, targetType, targetId, detail) {
  try {
    await db.execute(
      `INSERT INTO audit_log (actor_uid, action, target_type, target_id, detail)
       VALUES (:actor, :action, :ttype, :tid, :detail)`,
      {
        actor:  actorUid  || null,
        action: action,
        ttype:  targetType || null,
        tid:    String(targetId || ''),
        detail: detail ? JSON.stringify(detail) : null,
      },
    );
  } catch (_) { /* non-fatal */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

// 5a. Get sessions for the authenticated user (student or tutor)
// Returns sessions for the current week by default; pass ?from=&to= ISO dates to override.
exports.getSessions = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const uid  = request.auth.uid;
  const role = request.auth.token.role || (request.auth.token.admin ? 'admin' : null);

  const { from, to } = request.data || {};
  const fromDate = from ? new Date(from) : (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d; })();
  const toDate   = to   ? new Date(to)   : (() => { const d = new Date(fromDate); d.setDate(d.getDate() + 7); return d; })();

  let sql, binds;
  if (role === 'admin') {
    sql   = `SELECT s.*, u1.first_name || ' ' || u1.last_name AS tutor_name,
                    u2.first_name || ' ' || u2.last_name AS student_name,
                    c.language AS course_language
               FROM sessions s
               LEFT JOIN users u1 ON u1.id = s.tutor_id
               LEFT JOIN users u2 ON u2.id = s.student_id
               LEFT JOIN courses c ON c.id = s.course_id
              WHERE s.scheduled_at >= :from AND s.scheduled_at < :to
              ORDER BY s.scheduled_at`;
    binds = { from: fromDate, to: toDate };
  } else if (role === 'tutor') {
    sql   = `SELECT s.*, u.first_name || ' ' || u.last_name AS student_name,
                    c.language AS course_language
               FROM sessions s
               LEFT JOIN users u ON u.id = s.student_id
               LEFT JOIN courses c ON c.id = s.course_id
              WHERE s.tutor_id = :uid
                AND s.scheduled_at >= :from AND s.scheduled_at < :to
              ORDER BY s.scheduled_at`;
    binds = { uid, from: fromDate, to: toDate };
  } else {
    sql   = `SELECT s.*, u.first_name || ' ' || u.last_name AS tutor_name,
                    c.language AS course_language
               FROM sessions s
               LEFT JOIN users u ON u.id = s.tutor_id
               LEFT JOIN courses c ON c.id = s.course_id
              WHERE s.student_id = :uid
                AND s.scheduled_at >= :from AND s.scheduled_at < :to
              ORDER BY s.scheduled_at`;
    binds = { uid, from: fromDate, to: toDate };
  }

  const result = await db.execute(sql, binds);
  const sessions = result.rows.map(r => ({
    id:            r.ID,
    tutorId:       r.TUTOR_ID,
    studentId:     r.STUDENT_ID,
    courseId:      r.COURSE_ID,
    title:         r.TITLE,
    scheduledAt:   r.SCHEDULED_AT,
    durationMin:   r.DURATION_MIN,
    location:      r.LOCATION,
    status:        r.STATUS,
    tutorName:     r.TUTOR_NAME,
    studentName:   r.STUDENT_NAME,
    courseLanguage:r.COURSE_LANGUAGE,
  }));
  return { sessions };
});

// 5b. Admin / tutor: create a session
exports.createSession = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const role = request.auth.token.role;
  if (!request.auth.token.admin && role !== 'tutor') {
    throw new HttpsError('permission-denied', 'Tutors and admins only.');
  }
  const { tutorId, studentId, courseId, title, scheduledAt, durationMin = 60, location } = request.data;
  if (!tutorId || !studentId || !scheduledAt) {
    throw new HttpsError('invalid-argument', 'tutorId, studentId and scheduledAt are required.');
  }
  const result = await db.execute(
    `INSERT INTO sessions (tutor_id, student_id, course_id, title, scheduled_at, duration_min, location)
     VALUES (:tutor_id, :student_id, :course_id, :title, :scheduled_at, :duration_min, :location)
     RETURNING id INTO :inserted_id`,
    {
      tutor_id:     tutorId,
      student_id:   studentId,
      course_id:    courseId  || null,
      title:        title     || null,
      scheduled_at: new Date(scheduledAt),
      duration_min: durationMin,
      location:     location  || null,
      inserted_id:  { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
    },
  );
  const id = result.outBinds.inserted_id[0];
  await writeAudit(request.auth.uid, 'create_session', 'session', id, { tutorId, studentId, scheduledAt });
  return { success: true, id };
});

// 5c. Update session status (complete, cancel, no-show) — tutor or admin
exports.updateSessionStatus = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const role = request.auth.token.role;
  if (!request.auth.token.admin && role !== 'tutor') {
    throw new HttpsError('permission-denied', 'Tutors and admins only.');
  }
  const { sessionId, status, tutorNotes } = request.data;
  const VALID = ['scheduled', 'completed', 'cancelled', 'no_show'];
  if (!sessionId || !VALID.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of: ${VALID.join(', ')}`);
  }
  await db.execute(
    `UPDATE sessions SET status = :status, tutor_notes = :notes WHERE id = :id`,
    { status, notes: tutorNotes || null, id: sessionId },
  );
  await writeAudit(request.auth.uid, 'update_session_status', 'session', sessionId, { status });
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. COURSE ENROLLMENTS (active student ↔ course links)
// ─────────────────────────────────────────────────────────────────────────────

// 6a. Student: get my enrolled courses with progress
exports.getMyCourses = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const uid = request.auth.uid;
  const result = await db.execute(
    `SELECT ce.id, ce.course_id, ce.status, ce.progress_pct, ce.started_at,
            c.language, c.course_level, c.format, c.price_monthly,
            u.first_name || ' ' || u.last_name AS tutor_name,
            COALESCE(t.title, c.id) AS title,
            t.description
       FROM course_enrollments ce
       JOIN courses c ON c.id = ce.course_id
       LEFT JOIN users u ON u.id = ce.tutor_id
       LEFT JOIN courses_translations t ON t.course_id = c.id AND t.locale = 'en'
      WHERE ce.student_id = :uid AND ce.status = 'active'
      ORDER BY ce.started_at DESC`,
    { uid },
  );
  const courses = result.rows.map(r => ({
    enrollmentId: r.ID,
    courseId:     r.COURSE_ID,
    title:        r.TITLE,
    description:  r.DESCRIPTION,
    language:     r.LANGUAGE,
    level:        r.COURSE_LEVEL,
    format:       r.FORMAT,
    priceMonthly: r.PRICE_MONTHLY,
    tutorName:    r.TUTOR_NAME,
    progressPct:  r.PROGRESS_PCT,
    startedAt:    r.STARTED_AT,
    status:       r.STATUS,
  }));
  return { courses };
});

// 6b. Tutor: get my students across all courses
exports.getMyStudents = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  if (request.auth.token.role !== 'tutor' && !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Tutors and admins only.');
  }
  const uid = request.auth.uid;
  const result = await db.execute(
    `SELECT ce.id AS enrollment_id, ce.progress_pct, ce.started_at,
            u.id AS student_id, u.first_name, u.last_name, u.email, u.nickname,
            c.id AS course_id, c.language, c.course_level,
            COALESCE(t.title, c.id) AS course_title,
            (SELECT MAX(s.scheduled_at) FROM sessions s
              WHERE s.student_id = u.id AND s.tutor_id = ce.tutor_id
                AND s.status = 'completed') AS last_session_at
       FROM course_enrollments ce
       JOIN users u ON u.id = ce.student_id
       JOIN courses c ON c.id = ce.course_id
       LEFT JOIN courses_translations t ON t.course_id = c.id AND t.locale = 'en'
      WHERE ce.tutor_id = :uid AND ce.status = 'active'
      ORDER BY u.last_name, u.first_name`,
    { uid },
  );
  const students = result.rows.map(r => ({
    enrollmentId: r.ENROLLMENT_ID,
    studentId:    r.STUDENT_ID,
    name:         `${r.FIRST_NAME} ${r.LAST_NAME}`.trim(),
    email:        r.EMAIL,
    nickname:     r.NICKNAME,
    courseId:     r.COURSE_ID,
    courseTitle:  r.COURSE_TITLE,
    language:     r.LANGUAGE,
    level:        r.COURSE_LEVEL,
    progressPct:  r.PROGRESS_PCT,
    startedAt:    r.STARTED_AT,
    lastSessionAt:r.LAST_SESSION_AT,
  }));
  return { students };
});

// 6c. Admin: enrol a student in a course (after approveStudent)
exports.createCourseEnrollment = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { studentId, courseId, tutorId } = request.data;
  if (!studentId || !courseId) throw new HttpsError('invalid-argument', 'studentId and courseId required.');
  const result = await db.execute(
    `INSERT INTO course_enrollments (student_id, course_id, tutor_id)
     VALUES (:student_id, :course_id, :tutor_id)
     RETURNING id INTO :inserted_id`,
    {
      student_id: studentId,
      course_id:  courseId,
      tutor_id:   tutorId || null,
      inserted_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
    },
  );
  const id = result.outBinds.inserted_id[0];
  await writeAudit(request.auth.uid, 'create_course_enrollment', 'course_enrollment', id, { studentId, courseId, tutorId });
  return { success: true, id };
});

// 6d. Admin / tutor: update course progress %
exports.updateCourseProgress = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const { enrollmentId, progressPct } = request.data;
  if (enrollmentId == null || progressPct == null) {
    throw new HttpsError('invalid-argument', 'enrollmentId and progressPct required.');
  }
  await db.execute(
    `UPDATE course_enrollments SET progress_pct = :pct WHERE id = :id`,
    { pct: progressPct, id: enrollmentId },
  );
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

// 7a. Student: get my payment history
exports.getMyPayments = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const uid = request.auth.uid;
  const result = await db.execute(
    `SELECT p.id, p.type, p.amount, p.currency, p.status, p.description,
            p.reference_id, p.paid_at, p.created_at,
            COALESCE(t.title, p.course_id) AS course_title
       FROM payments p
       LEFT JOIN courses_translations t ON t.course_id = p.course_id AND t.locale = 'en'
      WHERE p.user_id = :uid AND p.type = 'charge'
      ORDER BY p.created_at DESC`,
    { uid },
  );
  const payments = result.rows.map(r => ({
    id:          r.ID,
    type:        r.TYPE,
    amount:      r.AMOUNT,
    currency:    r.CURRENCY,
    status:      r.STATUS,
    description: r.DESCRIPTION,
    referenceId: r.REFERENCE_ID,
    courseTitle: r.COURSE_TITLE,
    paidAt:      r.PAID_AT,
    createdAt:   r.CREATED_AT,
  }));
  return { payments };
});

// 7b. Tutor: get my earnings summary + history
exports.getMyEarnings = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  if (request.auth.token.role !== 'tutor' && !request.auth.token.admin) {
    throw new HttpsError('permission-denied', 'Tutors and admins only.');
  }
  const uid = request.auth.uid;
  const summaryResult = await db.execute(
    `SELECT
         SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_paid,
         SUM(CASE WHEN status = 'pending'   THEN amount ELSE 0 END) AS total_pending,
         COUNT(*) AS total_transactions
       FROM payments
      WHERE user_id = :uid AND type = 'payout'`,
    { uid },
  );
  const s = summaryResult.rows[0];
  const historyResult = await db.execute(
    `SELECT id, amount, currency, status, description, reference_id, paid_at, created_at
       FROM payments
      WHERE user_id = :uid AND type = 'payout'
      ORDER BY created_at DESC
      FETCH FIRST 50 ROWS ONLY`,
    { uid },
  );
  return {
    summary: {
      totalPaid:        s.TOTAL_PAID    || 0,
      totalPending:     s.TOTAL_PENDING || 0,
      totalTransactions:s.TOTAL_TRANSACTIONS || 0,
    },
    history: historyResult.rows.map(r => ({
      id:          r.ID,
      amount:      r.AMOUNT,
      currency:    r.CURRENCY,
      status:      r.STATUS,
      description: r.DESCRIPTION,
      referenceId: r.REFERENCE_ID,
      paidAt:      r.PAID_AT,
      createdAt:   r.CREATED_AT,
    })),
  };
});

// 7c. Admin: record a payment or payout
exports.createPayment = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { userId, courseId, type, amount, currency = 'EUR', description, referenceId } = request.data;
  const VALID_TYPES = ['charge', 'payout', 'refund', 'credit'];
  if (!userId || !amount || !VALID_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', 'userId, amount, and valid type required.');
  }
  const result = await db.execute(
    `INSERT INTO payments (user_id, course_id, type, amount, currency, description, reference_id, status)
     VALUES (:user_id, :course_id, :type, :amount, :currency, :desc, :ref, 'pending')
     RETURNING id INTO :inserted_id`,
    {
      user_id:     userId,
      course_id:   courseId    || null,
      type,
      amount,
      currency,
      desc:        description || null,
      ref:         referenceId || null,
      inserted_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
    },
  );
  const id = result.outBinds.inserted_id[0];
  await writeAudit(request.auth.uid, 'create_payment', 'payment', id, { userId, type, amount, currency });
  return { success: true, id };
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. TASKS (tutor to-do list)
// ─────────────────────────────────────────────────────────────────────────────

// 8a. Get tasks for authenticated tutor (or all tasks for admin)
exports.getMyTasks = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const uid  = request.auth.uid;
  const isAdmin = request.auth.token.admin;
  const result = await db.execute(
    isAdmin
      ? `SELECT t.*, u.first_name || ' ' || u.last_name AS assigned_to_name
           FROM tasks t JOIN users u ON u.id = t.assigned_to
          ORDER BY t.due_at ASC NULLS LAST, t.priority DESC`
      : `SELECT * FROM tasks WHERE assigned_to = :uid AND is_done = 0
         ORDER BY due_at ASC NULLS LAST, priority DESC`,
    isAdmin ? {} : { uid },
  );
  return {
    tasks: result.rows.map(r => ({
      id:         r.ID,
      title:      r.TITLE,
      priority:   r.PRIORITY,
      dueAt:      r.DUE_AT,
      isDone:     r.IS_DONE === 1,
      createdAt:  r.CREATED_AT,
      assignedTo: r.ASSIGNED_TO_NAME || undefined,
    })),
  };
});

// 8b. Mark task done / undone
exports.updateTaskStatus = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const { taskId, isDone } = request.data;
  if (taskId == null || isDone == null) throw new HttpsError('invalid-argument', 'taskId and isDone required.');
  await db.execute(
    `UPDATE tasks SET is_done = :done WHERE id = :id AND assigned_to = :uid`,
    { done: isDone ? 1 : 0, id: taskId, uid: request.auth.uid },
  );
  return { success: true };
});

// 8c. Admin: create a task for a tutor
exports.createTask = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { assignedTo, title, priority = 'normal', dueAt } = request.data;
  if (!assignedTo || !title) throw new HttpsError('invalid-argument', 'assignedTo and title required.');
  const result = await db.execute(
    `INSERT INTO tasks (assigned_to, title, priority, due_at)
     VALUES (:assigned_to, :title, :priority, :due_at)
     RETURNING id INTO :inserted_id`,
    {
      assigned_to: assignedTo,
      title,
      priority,
      due_at:      dueAt ? new Date(dueAt) : null,
      inserted_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
    },
  );
  return { success: true, id: result.outBinds.inserted_id[0] };
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. ANNOUNCEMENTS (centre updates feed)
// ─────────────────────────────────────────────────────────────────────────────

// 9a. Get announcements for the calling user's role
exports.getAnnouncements = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  const role = request.auth.token.admin ? 'admin' : (request.auth.token.role || 'student');
  const result = await db.execute(
    `SELECT a.id, a.title, a.body, a.audience, a.published_at,
            u.first_name || ' ' || u.last_name AS author
       FROM announcements a
       LEFT JOIN users u ON u.id = a.created_by
      WHERE a.audience = 'all' OR a.audience = :role OR :role = 'admin'
      ORDER BY a.published_at DESC
      FETCH FIRST 20 ROWS ONLY`,
    { role },
  );
  return {
    announcements: result.rows.map(r => ({
      id:          r.ID,
      title:       r.TITLE,
      body:        r.BODY,
      audience:    r.AUDIENCE,
      publishedAt: r.PUBLISHED_AT,
      author:      r.AUTHOR,
    })),
  };
});

// 9b. Admin: create announcement
exports.createAnnouncement = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { title, body, audience = 'all' } = request.data;
  const VALID = ['all', 'tutors', 'students', 'admin'];
  if (!title || !VALID.includes(audience)) {
    throw new HttpsError('invalid-argument', 'title and valid audience required.');
  }
  const result = await db.execute(
    `INSERT INTO announcements (title, body, audience, created_by)
     VALUES (:title, :body, :audience, :created_by)
     RETURNING id INTO :inserted_id`,
    {
      title,
      body:        body || null,
      audience,
      created_by:  request.auth.uid,
      inserted_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
    },
  );
  await writeAudit(request.auth.uid, 'create_announcement', 'announcement', result.outBinds.inserted_id[0], { title, audience });
  return { success: true, id: result.outBinds.inserted_id[0] };
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. PROMO CODES
// ─────────────────────────────────────────────────────────────────────────────

// 10a. PUBLIC: validate a promo code (called from enrol.html)
exports.validatePromoCode = onRequest({ cors: false }, async (req, res) => {
  if (handlePreflight(req, res)) return;
  setCors(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });
  const result = await db.execute(
    `SELECT id, discount_pct, expires_at, max_uses, used_count
       FROM promo_codes
      WHERE UPPER(code) = UPPER(:code) AND is_active = 1`,
    { code: code.trim() },
  );
  if (!result.rows.length) return res.status(404).json({ valid: false, error: 'Invalid or expired code.' });
  const row = result.rows[0];
  if (row.EXPIRES_AT && new Date(row.EXPIRES_AT) < new Date()) {
    return res.json({ valid: false, error: 'This promo code has expired.' });
  }
  if (row.MAX_USES && row.USED_COUNT >= row.MAX_USES) {
    return res.json({ valid: false, error: 'This promo code has reached its usage limit.' });
  }
  return res.json({ valid: true, discountPct: row.DISCOUNT_PCT });
});

// 10b. Admin: list all promo codes
exports.getPromoCodes = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const result = await db.execute(
    `SELECT id, code, discount_pct, max_uses, used_count, expires_at, is_active, created_at
       FROM promo_codes ORDER BY created_at DESC`,
  );
  return {
    codes: result.rows.map(r => ({
      id:          r.ID,
      code:        r.CODE,
      discountPct: r.DISCOUNT_PCT,
      maxUses:     r.MAX_USES,
      usedCount:   r.USED_COUNT,
      expiresAt:   r.EXPIRES_AT,
      isActive:    r.IS_ACTIVE === 1,
      createdAt:   r.CREATED_AT,
    })),
  };
});

// 10c. Admin: create a promo code
exports.createPromoCode = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { code, discountPct, maxUses, expiresAt } = request.data;
  if (!code || !discountPct) throw new HttpsError('invalid-argument', 'code and discountPct required.');
  await db.execute(
    `INSERT INTO promo_codes (code, discount_pct, max_uses, expires_at)
     VALUES (UPPER(:code), :pct, :max_uses, :expires_at)`,
    {
      code:       code.trim(),
      pct:        discountPct,
      max_uses:   maxUses   || null,
      expires_at: expiresAt ? new Date(expiresAt) : null,
    },
  );
  await writeAudit(request.auth.uid, 'create_promo_code', 'promo_code', code, { discountPct, maxUses });
  return { success: true };
});

// 10d. Admin: toggle promo code active/inactive
exports.togglePromoCode = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { id, isActive } = request.data;
  if (id == null || isActive == null) throw new HttpsError('invalid-argument', 'id and isActive required.');
  await db.execute(
    `UPDATE promo_codes SET is_active = :active WHERE id = :id`,
    { active: isActive ? 1 : 0, id },
  );
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. AUDIT LOG (admin read)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAuditLog = onCall(async (request) => {
  if (!request.auth?.token.admin) throw new HttpsError('permission-denied', 'Admins only.');
  const { limit = 100, offset = 0 } = request.data || {};
  const result = await db.execute(
    `SELECT a.id, a.actor_uid, a.action, a.target_type, a.target_id, a.detail, a.created_at,
            u.first_name || ' ' || u.last_name AS actor_name, u.email AS actor_email
       FROM audit_log a
       LEFT JOIN users u ON u.id = a.actor_uid
      ORDER BY a.created_at DESC
      OFFSET :offset ROWS FETCH NEXT :lim ROWS ONLY`,
    { offset: Number(offset), lim: Number(limit) },
  );
  return {
    log: result.rows.map(r => ({
      id:         r.ID,
      actorUid:   r.ACTOR_UID,
      actorName:  r.ACTOR_NAME,
      actorEmail: r.ACTOR_EMAIL,
      action:     r.ACTION,
      targetType: r.TARGET_TYPE,
      targetId:   r.TARGET_ID,
      detail:     safeParseJSON(r.DETAIL),
      createdAt:  r.CREATED_AT,
    })),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXISTING: enrolStudent – Moodle manual enrolment (kept from original)
// ─────────────────────────────────────────────────────────────────────────────
const { onCall: onCallV2 } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');

exports.enrolStudent = onCallV2(
  { secrets: [MOODLE_TOKEN] },
  async (request) => {
    const { moodleUserId, moodleCourseId } = request.data;

    if (!moodleUserId || !moodleCourseId) {
      throw new HttpsError('invalid-argument', 'Missing moodleUserId or moodleCourseId');
    }

    try {
      const response = await fetch(
        'https://academy.linguabridge.study/webservice/rest/server.php',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    new URLSearchParams({
            wstoken:             MOODLE_TOKEN.value(),
            wsfunction:          'enrol_manual_enrol_users',
            moodlewsrestformat:  'json',
            enrolments:          JSON.stringify([{
              roleid:   5,
              userid:   moodleUserId,
              courseid: moodleCourseId,
            }]),
          }),
        },
      );

      const result = await response.json();
      if (result?.exception) {
        return { success: false, error: result.message || 'Moodle error', result };
      }
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);
