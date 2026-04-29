import { supabase } from "./supabase";

/* ---------------------------------- */
/* CREATE SESSION */
/* ---------------------------------- */
export async function createSession({ title, pin, questions }) {
  const sessionId = Math.random().toString(36).substring(2, 10);

  // create session
  const { error: sessionError } = await supabase.from("sessions").insert({
    id: sessionId,
    title,
    pin,
    is_active: false,
  });

  if (sessionError) throw sessionError;

  // create questions + answers
  for (let qIndex = 0; qIndex < questions.length; qIndex++) {
    const q = questions[qIndex];

    const { data: questionRow, error: questionError } = await supabase
      .from("questions")
      .insert({
        session_id: sessionId,
        position: qIndex,
        text: q.text,
      })
      .select()
      .single();

    if (questionError) throw questionError;

    const answersToInsert = q.answers.map((answerText, aIndex) => ({
      question_id: questionRow.id,
      position: aIndex,
      text: answerText,
    }));

    const { error: answersError } = await supabase
      .from("answers")
      .insert(answersToInsert);

    if (answersError) throw answersError;
  }

  return {
    id: sessionId,
    title,
    pin,
  };
}

/* ---------------------------------- */
/* GET SESSION */
/* ---------------------------------- */
export async function getSession(sessionId) {
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !session) return null;

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("position");

  const formattedQuestions = [];

  for (const q of questions || []) {
    const { data: answers } = await supabase
      .from("answers")
      .select("*")
      .eq("question_id", q.id)
      .order("position");

    formattedQuestions.push({
      id: q.id,
      text: q.text,
      answers: (answers || []).map((a) => ({
        id: a.id,
        text: a.text,
      })),
    });
  }

  return {
    ...session,
    questions: formattedQuestions,
  };
}

/* ---------------------------------- */
/* START / STOP */
/* ---------------------------------- */
export async function startSession(sessionId) {
  const { error } = await supabase
    .from("sessions")
    .update({ is_active: true })
    .eq("id", sessionId);

  return !error;
}

export async function stopSession(sessionId) {
  const { error } = await supabase
    .from("sessions")
    .update({ is_active: false })
    .eq("id", sessionId);

  return !error;
}

/* ---------------------------------- */
/* JOIN SESSION */
/* ---------------------------------- */
export async function joinSession(sessionId) {
  const { data, error } = await supabase
    .from("participants")
    .insert({
      session_id: sessionId,
    })
    .select()
    .single();

  if (error) return null;

  return data;
}

/* ---------------------------------- */
/* ADD VOTE */
/* questionIndex = index page.js
/* answerIndex = selected answer
/* participantId = participant UUID
/* ---------------------------------- */
export async function addVote(
  sessionId,
  questionIndex,
  answerIndex,
  participantId
) {
  const session = await getSession(sessionId);
  if (!session) return false;
  if (!session.is_active) return false;

  const question = session.questions[questionIndex];
  if (!question) return false;

  const answer = question.answers[answerIndex];
  if (!answer) return false;

  const { error } = await supabase.from("votes").insert({
    session_id: sessionId,
    participant_id: participantId,
    question_id: question.id,
    answer_id: answer.id,
  });

  if (error) return false;

  return true;
}

/* ---------------------------------- */
/* RESULTS */
/* ---------------------------------- */
export async function getResults(sessionId) {
  const session = await getSession(sessionId);
  if (!session) return null;

  const { count: totalParticipants } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const results = [];

  let totalVotes = 0;

  for (const question of session.questions) {
    const answers = [];
    const votes = [];

    let questionTotal = 0;

    for (const answer of question.answers) {
      const { count } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", question.id)
        .eq("answer_id", answer.id);

      const c = count || 0;

      answers.push(answer.text);
      votes.push(c);

      questionTotal += c;
      totalVotes += c;
    }

    results.push({
      question: question.text,
      answers,
      votes,
      totalVotes: questionTotal,
    });
  }

  return {
    id: session.id,
    title: session.title,
    isActive: session.is_active,
    totalVotes,
    totalParticipants,
    results,
  };
}

/* ---------------------------------- */
/* ALL SESSIONS */
/* ---------------------------------- */
export async function getAllSessions() {
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
}

/* ---------------------------------- */
/* DELETE */
/* ---------------------------------- */
export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  return !error;
}