import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    voters: {
      executor: "constant-vus",
      vus: 1,
      duration: "20s",
    },
  },
};

const SUPABASE_URL =
  "https://cftivspgkykbymugbfuf.supabase.co";

const SUPABASE_ANON_KEY =
  "dNOD8C0APZMl2fJGg_vegXpGXl";

const SESSION_ID = "z0d4ehpg"; // remplace par ton vrai id

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

export default function () {
  // ---------------------------------
  // 1. JOIN SESSION (participant)
  // ---------------------------------
  const joinRes = http.post(
    `${SUPABASE_URL}/rest/v1/participants`,
    JSON.stringify({
      session_id: SESSION_ID,
    }),
    { headers }
  );

  check(joinRes, {
    "participant created": (r) =>
      r.status === 201,
  });

  // récupérer participant id
  const participantId =
    joinRes.headers["Location"]
      ?.split("id=eq.")
      ?.pop();

  if (!participantId) {
    console.log("No participant id");
    return;
  }

  // ---------------------------------
  // 2. GET CURRENT SESSION
  // ---------------------------------
  const sessionRes = http.get(
    `${SUPABASE_URL}/rest/v1/sessions?id=eq.${SESSION_ID}&select=*`,
    { headers }
  );

  const sessionData = JSON.parse(
    sessionRes.body
  )[0];

  if (!sessionData?.is_active) {
    console.log("Session inactive");
    return;
  }

  const currentQuestion =
    sessionData.current_question || 0;

  // ---------------------------------
  // 3. GET QUESTIONS
  // ---------------------------------
  const questionsRes = http.get(
    `${SUPABASE_URL}/rest/v1/questions?session_id=eq.${SESSION_ID}&select=*`,
    { headers }
  );

  const questions = JSON.parse(
    questionsRes.body
  );

  const question =
    questions[currentQuestion];

  if (!question) {
    console.log("Question not found");
    return;
  }

  // ---------------------------------
  // 4. GET ANSWERS
  // ---------------------------------
  const answersRes = http.get(
    `${SUPABASE_URL}/rest/v1/answers?question_id=eq.${question.id}&select=*`,
    { headers }
  );

  const answers = JSON.parse(
    answersRes.body
  );

  if (!answers.length) {
    console.log("No answers");
    return;
  }

  // réponse random
  const randomAnswer =
    answers[
      Math.floor(
        Math.random() * answers.length
      )
    ];

  // ---------------------------------
  // 5. SEND VOTE
  // ---------------------------------
  const voteRes = http.post(
    `${SUPABASE_URL}/rest/v1/votes`,
    JSON.stringify({
      session_id: SESSION_ID,
      participant_id: participantId,
      question_id: question.id,
      answer_id: randomAnswer.id,
    }),
    { headers }
  );

  check(voteRes, {
    "vote success": (r) =>
      r.status === 201,
  });

  sleep(Math.random() * 2);
}