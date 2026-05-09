// ─── MOODLE REST API HELPER ──────────────────────────────────────────────────
// LinguaBridge Academy – https://academy.linguabridge.study
// Token: admin web-service token.  Keep this file server-side or behind auth in
// production; here it is acceptable because the site is private-login-only.
// ─────────────────────────────────────────────────────────────────────────────

const MOODLE_BASE  = 'https://academy.linguabridge.study';
const MOODLE_TOKEN = 'feb2029f615460ff72956253a0e64262';
const MOODLE_URL   = `${MOODLE_BASE}/webservice/rest/server.php`;

/** Open a page inside the embedded Academy (moodle-classroom.html) */
function openMoodle(path = '') {
    window.location.href = 'moodle-classroom.html' + (path ? '?path=' + encodeURIComponent(path) : '');
}

/** Open a specific Moodle URL in a new tab (for quick-action deep links) */
function openMoodleTab(path = '') {
    window.open(MOODLE_BASE + path, '_blank');
}

/**
 * Generic Moodle REST API call.
 */
async function moodleCall(wsfunction, params = {}) {
    const url = new URL(MOODLE_URL);
    url.searchParams.set('wstoken',            MOODLE_TOKEN);
    url.searchParams.set('wsfunction',         wsfunction);
    url.searchParams.set('moodlewsrestformat', 'json');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Moodle HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.exception) {
        const err = new Error(data.message || 'Moodle API error');
        err.moodleCode = data.errorcode || data.exception;
        throw err;
    }
    return data;
}

/** Look up a Moodle user by username. */
async function getMoodleUser(username) {
    const result = await moodleCall('core_user_get_users', {
        'criteria[0][key]':   'username',
        'criteria[0][value]': username
    });
    const users = Array.isArray(result) ? result : (result.users || []);
    return users.length > 0 ? users[0] : null;
}

/** Courses a user is enrolled in. */
async function getMoodleUserCourses(userid) {
    return moodleCall('core_enrol_get_users_courses', { userid });
}

/** Sections/topics inside a course. */
async function getMoodleCourseContents(courseid) {
    return moodleCall('core_course_get_contents', { courseid });
}

/** Grade items for a user in a course (gradereport_user). */
async function getMoodleUserGrades(courseid, userid) {
    try {
        const result = await moodleCall('gradereport_user_get_grade_items', { courseid, userid });
        return (result.usergrades && result.usergrades[0]) || null;
    } catch {
        return null;
    }
}

/** All users enrolled in a course (for tutors). */
async function getMoodleCourseEnrolledUsers(courseid) {
    return moodleCall('core_enrol_get_enrolled_users', { courseid });
}

/** Activity completion status for a user in a course. */
async function getMoodleActivityCompletion(courseid, userid) {
    try {
        return await moodleCall('core_completion_get_activities_completion_status', { courseid, userid });
    } catch {
        return null;
    }
}

// ─── STUDENT: full data pipeline ─────────────────────────────────────────────
/**
 * username → { user, courses[] }
 * Each course gets: .sections, .grades, .completion
 */
async function loadMoodlePortalData(username) {
    const user = await getMoodleUser(username);
    if (!user) throw new Error('Moodle user not found');

    const courses = await getMoodleUserCourses(user.id);
    const limited = courses.slice(0, 8);

    await Promise.all(limited.map(async course => {
        // Course structure
        try { course.sections = await getMoodleCourseContents(course.id); }
        catch { course.sections = []; }

        // Grades
        course.grades = await getMoodleUserGrades(course.id, user.id);

        // Activity completion (used to count completed items)
        try {
            const comp = await getMoodleActivityCompletion(course.id, user.id);
            if (comp && comp.statuses) {
                const completed  = comp.statuses.filter(s => s.state === 1).length;
                const total      = comp.statuses.length;
                course.doneCount = completed;
                course.totalCount = total;
                if (total > 0 && course.progress == null) {
                    course.progress = Math.round((completed / total) * 100);
                }
            }
        } catch { /* ignore */ }
    }));

    return { user, courses: limited };
}

// ─── TUTOR: full data pipeline ────────────────────────────────────────────────
/**
 * username → { user, courses[] }
 * Each course gets: .sections, .students[] (enrolled learners)
 */
async function loadTutorPortalData(username) {
    const user = await getMoodleUser(username);
    if (!user) throw new Error('Moodle user not found');

    const courses = await getMoodleUserCourses(user.id);
    const limited = courses.slice(0, 8);

    await Promise.all(limited.map(async course => {
        // Course structure
        try { course.sections = await getMoodleCourseContents(course.id); }
        catch { course.sections = []; }

        // Enrolled students
        try {
            const all = await getMoodleCourseEnrolledUsers(course.id);
            // Keep only users with student role (exclude managers / editing teachers)
            course.students = all.filter(u => {
                const roles = u.roles || [];
                const isTeacher = roles.some(r =>
                    ['editingteacher', 'teacher', 'manager', 'coursecreator'].includes(r.shortname)
                );
                return !isTeacher;
            });
        } catch {
            course.students = [];
        }
    }));

    return { user, courses: limited };
}
