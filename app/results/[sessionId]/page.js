"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, getResults, advanceQuestion } from "../../lib/voting";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [results, setResults] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const loadedSession = await getSession(params.sessionId);
      if (!loadedSession) {
        setError("Session not found or has expired");
        setIsLoading(false);
        return;
      }
      setSession(loadedSession);
      setIsLoading(false);
    };

    loadSession();
  }, [params.sessionId, refreshKey]);

  useEffect(() => {
    if (isAuthenticated && session) {
      loadResults();
      const interval = setInterval(() => {
        loadResults();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, session, params.sessionId]);

  const loadResults = async () => {
    const data = await getResults(params.sessionId);
    setResults(data);
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    if (pinInput === session.pin) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError("Incorrect PIN");
    }
  };

  const handleNextQuestion = async () => {
    setAdvancing(true);
    const result = await advanceQuestion(params.sessionId);
    if (result.success) {
      setRefreshKey(refreshKey + 1);
    } else {
      setError(result.message || "Failed to advance question");
    }
    setAdvancing(false);
  };

  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !session) {
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

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Admin Access
          </h1>
          <p className="text-gray-500 text-center mb-6">{session.title}</p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Admin PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="----"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Results
            </button>
          </form>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading results...</div>
      </div>
    );
  }

  const maxVotes = Math.max(
    ...results.results.map((r) => Math.max(...r.votes, 1))
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {results.title}
              </h1>
              <p className="text-gray-500">
                Total Votes: {results.totalVotes}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRefreshKey(refreshKey + 1)}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={advancing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {advancing ? "..." : "Next Question"}
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600">Current Question</p>
              <p className="text-sm font-medium text-blue-600">
                {results.votesOnCurrentQuestion} / {results.totalParticipants || 0} voters
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                Question {session.current_question + 1}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                {session.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((session.current_question + 1) / session.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {results.results.map((result, qIndex) => (
          <div
            key={qIndex}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Question {qIndex + 1}: {result.question}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Responses: {result.totalVotes}
            </p>

            <div className="space-y-3">
              {result.answers.map((answer, aIndex) => {
                const count = result.votes[aIndex];
                const percentage =
                  result.totalVotes > 0
                    ? Math.round((count / result.totalVotes) * 100)
                    : 0;
                const barWidth =
                  result.totalVotes > 0
                    ? (count / maxVotes) * 100
                    : 0;

                return (
                  <div key={aIndex} className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {String.fromCharCode(65 + aIndex)}. {answer}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full ${colors[aIndex % colors.length]} transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={() => router.push("/")}
          className="w-full bg-gray-800 text-white py-4 rounded-xl font-semibold hover:bg-gray-900 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
