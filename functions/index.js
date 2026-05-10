const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = require("node-fetch");

const MOODLE_TOKEN = defineSecret("MOODLE_TOKEN");

exports.enrolStudent = onCall(
  { secrets: [MOODLE_TOKEN] },
  async (request) => {

    const { moodleUserId, moodleCourseId } = request.data;

    if (!moodleUserId || !moodleCourseId) {
      throw new Error("Missing moodleUserId or moodleCourseId");
    }

    try {
      const response = await fetch(
        "https://academy.linguabridge.study/webservice/rest/server.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            wstoken: MOODLE_TOKEN.value(),
            wsfunction: "enrol_manual_enrol_users",
            moodlewsrestformat: "json",
            enrolments: JSON.stringify([
              {
                roleid: 5,
                userid: moodleUserId,
                courseid: moodleCourseId
              }
            ])
          })
        }
      );

      const result = await response.json();

      if (result && result.exception) {
        return {
          success: false,
          error: result.message || "Moodle error",
          result
        };
      }

      return {
        success: true,
        result
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
);
