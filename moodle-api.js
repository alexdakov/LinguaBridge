// ─── MOODLE REST API HELPER ──────────────────────────────────────────────────
// Base URL and token for the LinguaBridge Moodle instance.
// NOTE: If you see CORS errors, add to Moodle's config.php:
//   header('Access-Control-Allow-Origin: *');
// or configure it via the Moodle admin panel under Security > HTTP Security.
// ─────────────────────────────────────────────────────────────────────────────

const MOODLE_BASE = 'http://132.145.38.243/moodle';
const MOODLE_TOKEN = 'feb2029f615460ff72956253a0e64262';
const MOODLE_URL   = `${MOODLE_BASE}/webservice/rest/server.php`;

/**
 * Generic Moodle REST API call.
 * @param {string} wsfunction  - e.g. 'core_enrol_get_users_courses'
 * @param {Object} params      - key/value query parameters
 * @returns {Promise<any>}
 */
async function moodleCall(wsfunction, params = {}) {
    const url = new URL(MOODLE_URL);
    url.searchParams.set('wstoken',            MOODLE_TOKEN);
    url.searchParams.set('wsfunction',         wsfunction);
    url.searchParams.set('moodlewsrestformat', 'json');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Moodle HTTP error: ${res.status}`);
    const data = await res.json();
    if (data && data.exception) {
        // Surface the specific Moodle error code for clearer handling
        const err = new Error(data.message || 'Moodle API error');
        err.moodleCode = data.errorcode || data.exception;
        throw err;
    }
    return data;
}

/**
 * Get a Moodle user object by their username.
 * Uses: core_user_get_users (available on all Moodle versions)
 * @param {string} username
 * @returns {Promise<Object|null>}  Moodle user object or null
 */
async function getMoodleUser(username) {
    const result = await moodleCall('core_user_get_users', {
        'criteria[0][key]':   'username',
        'criteria[0][value]': username
    });
    // Response shape: { users: [...], warnings: [...] }
    const users = Array.isArray(result) ? result : (result.users || []);
    return users.length > 0 ? users[0] : null;
}

/**
 * Get all courses a Moodle user is enrolled in.
 * Uses: core_enrol_get_users_courses
 * @param {number|string} userid
 * @returns {Promise<Array>}
 */
async function getMoodleUserCourses(userid) {
    return moodleCall('core_enrol_get_users_courses', { userid });
}

/**
 * Get sections/topics inside a Moodle course.
 * Uses: core_course_get_contents
 * @param {number|string} courseid
 * @returns {Promise<Array>}
 */
async function getMoodleCourseContents(courseid) {
    return moodleCall('core_course_get_contents', { courseid });
}

/**
 * Full pipeline: username → user object → enrolled courses → contents for each course.
 * Returns { user, courses } where each course has a .sections array.
 * @param {string} username
 * @returns {Promise<{user: Object, courses: Array}>}
 */
async function loadMoodlePortalData(username) {
    const user = await getMoodleUser(username);
    if (!user) throw new Error('Moodle user not found');

    const courses = await getMoodleUserCourses(user.id);

    // Fetch contents for each course in parallel (limit to 8 to avoid flooding)
    const limited = courses.slice(0, 8);
    await Promise.all(limited.map(async course => {
        try {
            course.sections = await getMoodleCourseContents(course.id);
        } catch {
            course.sections = [];
        }
    }));

    return { user, courses: limited };
}
