"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import {
  createSession,
  getAllSessions,
  startSession
} from "./lib/voting";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState("setup"); // setup, questions, preview, active
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [answersPerQuestion, setAnswersPerQuestion] = useState(4);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionPin, setSessionPin] = useState("");
  const [sessions, setSessions] = useState([]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    const newQuestions = Array.from({ length: numQuestions }, (_, i) => ({
      text: `Question ${i + 1}`,
      answers: Array.from(
        { length: answersPerQuestion },
        (_, j) => `Answer ${j + 1}`
      ),
    }));
    setQuestions(newQuestions);
    setStep("questions");
  };

  const updateQuestion = (index, text) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex, aIndex, text) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = text;
    setQuestions(updated);
  };

  const handleSaveQuestions = async () => {
  const session = await createSession({ title, pin, questions });

  setSessionId(session.id);
  setSessionPin(pin);
  setStep("preview");
};

  const handleStartVoting = async () => {
    await startSession(sessionId);
    setStep("active");
  };

  const handleViewResults = () => {
    router.push(`/results/${sessionId}`);
  };


useEffect(() => {
  const load = async () => {
    const data = await getAllSessions();
    setSessions(data);
  };

  load();
}, []);

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            QR Code Voting
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Create an interactive voting session
          </p>

          <form onSubmit={handleCreateSession} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Voting Session"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin PIN (4 digits)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                maxLength={4}
                pattern="\d{4}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answers per Question
              </label>
              <input
                type="number"
                value={answersPerQuestion}
                onChange={(e) => setAnswersPerQuestion(Math.max(2, parseInt(e.target.value) || 4))}
                min={2}
                max={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Next: Write Questions
            </button>
          </form>

          {sessions.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Recent Sessions
              </h3>
              <div className="space-y-2">
                {sessions.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/results/${s.id}`)}
                    className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{s.title}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(s.created_at).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "questions") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Write Your Questions
          </h1>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Question {qIndex + 1}
                </h2>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your question here"
                />

                <div className="grid grid-cols-2 gap-3">
                  {question.answers.map((answer, aIndex) => (
                    <input
                      key={aIndex}
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        updateAnswer(qIndex, aIndex, e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Answer ${aIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep("setup")}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveQuestions}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Generate QR Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    const voteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${sessionId}`;

    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">{title}</h1>
          <p className="text-gray-500 mb-6">Session created successfully!</p>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 inline-block">
            <QRCode value={voteUrl} size={200} />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Scan this QR code to vote
          </p>
          <p className="text-xs text-gray-400 mb-6 break-all">{voteUrl}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Admin PIN: <span className="font-bold">{sessionPin}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Save this PIN to view results
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartVoting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Voting
            </button>
            <button
              onClick={handleViewResults}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "active") {
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
            Voting is Active!
          </h1>
          <p className="text-gray-500 mb-6">
            Participants can now scan the QR code and vote
          </p>

          <button
            onClick={handleViewResults}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Live Results
          </button>
        </div>
      </div>
    );
  }
}
