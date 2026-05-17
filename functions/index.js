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
// 3. PUBLIC: getCourses – localized course catalog
// GET /getCourses?lang=en   (defaults to 'en')
//
// Returns all active courses with title/description in the requested locale,
// falling back to the English translation when the locale is absent.
// ─────────────────────────────────────────────────────────────────────────────
exports.getCourses = onRequest(
  { cors: false },
  async (req, res) => {
    if (handlePreflight(req, res)) return;
    setCors(req, res);

    const lang = (req.query.lang || 'en').toLowerCase().trim();

    const result = await db.execute(
      `SELECT
           c.id,
           c.language,
           c.course_level,
           c.format,
           c.price_monthly,
           COALESCE(t_loc.title,       t_en.title)       AS title,
           COALESCE(t_loc.description, t_en.description) AS description
         FROM courses c
         LEFT JOIN courses_translations t_loc
           ON t_loc.course_id = c.id
          AND t_loc.locale    = :lang
         LEFT JOIN courses_translations t_en
           ON t_en.course_id  = c.id
          AND t_en.locale     = 'en'
        WHERE c.is_active = 1
        ORDER BY c.language, c.course_level`,
      { lang },
    );

    return res.json({ courses: result.rows, locale: lang });
  },
);

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
