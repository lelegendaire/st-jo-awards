"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, addVote, joinSession } from "../../lib/voting";

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Create participant record for this voter
      const participant = await joinSession(params.sessionId);
      if (!participant) {
        setError("Session not found or has expired");
        setIsLoading(false);
        return;
      }
      setParticipantId(participant.id);

      const loadedSession = await getSession(params.sessionId);
      if (!loadedSession) {
        setError("Session not found or has expired");
        setIsLoading(false);
        return;
      }
      setSession(loadedSession);
      setIsLoading(false);
    };

    init();
  }, [params.sessionId]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitVote = async () => {
    if (selectedAnswer === null) return;

    const success = await addVote(
      params.sessionId,
      currentQuestion,
      selectedAnswer,
      participantId
    );
    if (!success) {
      setError("Failed to submit vote");
      return;
    }

    if (currentQuestion < session.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setHasVoted(true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2 text-gray-800">Error</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Vote Submitted!
          </h1>
          <p className="text-gray-500 mb-6">
            Thank you for participating in {session.title}
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const question = session.questions[currentQuestion];
  const colors = [
    "bg-red-500 hover:bg-red-600",
    "bg-green-500 hover:bg-green-600",
    "bg-blue-500 hover:bg-blue-600",
    "bg-yellow-500 hover:bg-yellow-600",
    "bg-purple-500 hover:bg-purple-600",
    "bg-pink-500 hover:bg-pink-600",
  ];
  const shapeIcons = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {session.questions.length}
            </span>
            <span className="text-sm text-gray-500">{session.title}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestion + 1) / session.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {question.text}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {question.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 rounded-xl font-semibold text-white transition-all transform ${
                colors[index % colors.length]
              } ${
                selectedAnswer === index
                  ? "ring-4 ring-offset-2 ring-gray-400 scale-105"
                  : ""
              }`}
            >
              <span className="text-2xl font-bold mr-2">
                {shapeIcons[index]}
              </span>
              {answer.text}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmitVote}
          disabled={selectedAnswer === null}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-colors ${
            selectedAnswer === null
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-900"
          }`}
        >
          {currentQuestion < session.questions.length - 1
            ? "Next Question"
            : "Submit Vote"}
        </button>
      </div>
    </div>
  );
}
