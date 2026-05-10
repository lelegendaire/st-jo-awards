"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, getResults, advanceQuestion } from "../../lib/voting";

function SpotlightBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-1/2 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
          transform: "translateX(-50%)",
          animation: "spotlight-sweep 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function PinInput({ value, onChange, onSubmit, error }) {
  return (
    <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
      <SpotlightBg />
      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-spotlight/10 border border-spotlight/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-spotlight" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Accès administrateur</h1>
          <p className="text-dim-light mt-2">Entrez votre PIN pour voir les résultats</p>
        </div>

        <form onSubmit={onSubmit} className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-6 space-y-5">
          <div>
            <input
              type="password"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={4}
              className="w-full px-4 py-4 bg-wings/50 border border-spotlight/20 rounded-xl text-center text-2xl tracking-widest text-foreground placeholder-dim-light/30 focus:outline-none focus:border-spotlight/60 focus:ring-1 focus:ring-spotlight/30 transition-all"
              placeholder="0000"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-spotlight text-stage rounded-xl font-semibold hover:bg-center-stage transition-colors active:scale-95"
          >
            Voir les résultats
          </button>
        </form>
      </div>
    </div>
  );
}

function ResultBar({ answer, count, percentage, barWidth, index, isMax }) {
  const letter = String.fromCharCode(65 + index);

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">
          <span className="text-spotlight font-bold mr-1">{letter}.</span>
          {answer}
        </span>
        <span className={`text-sm font-bold ${isMax ? "text-center-stage" : "text-dim-light"}`}>
          {count}
          {percentage > 0 && (
            <span className="text-dim-light/60 font-normal ml-1">({percentage}%)</span>
          )}
        </span>
      </div>
      <div className="w-full bg-wings/50 rounded-full h-10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isMax
              ? "bg-linear-to-r from-spotlight to-center-stage"
              : "bg-spotlight/40"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [results, setResults] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setActualiserKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const loadedSession = await getSession(params.sessionId);
      if (!loadedSession) {
        setError("Session non trouvée ou expirée");
        setIsLoading(false);
        return;
      }
      setSession(loadedSession);
      setIsLoading(false);
    };
    loadSession();
  }, [params.sessionId, refreshKey]);

  const loadResults = async () => {
    const data = await getResults(params.sessionId);
    setResults(data);
  };

  useEffect(() => {
    if (!isAuthenticated || !session) return;

    let cancelled = false;
    const fetchAndUpdate = async () => {
      const data = await getResults(params.sessionId);
      if (!cancelled) setResults(data);
    };

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, session, params.sessionId]);

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!session) return;
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
      setActualiserKey(refreshKey + 1);
    } else {
      setError(result.message || "Failed to advance question");
    }
    setAdvancing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center relative">
        <SpotlightBg />
        <div className="animate-fade-in text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-spotlight/30 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-spotlight/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-center-stage animate-pulse" />
            </div>
          </div>
          <p className="text-dim-light text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <div className="relative text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-dim-light mb-8">{error || "Session non trouvée ou expirée"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-spotlight text-stage rounded-xl font-semibold hover:bg-center-stage transition-colors active:scale-95"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PinInput
        value={pinInput}
        onChange={setPinInput}
        onSubmit={handleVerifyPin}
        error={error}
      />
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center relative">
        <SpotlightBg />
        <div className="animate-fade-in">
          <p className="text-dim-light text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  const maxVotes = results.results.length > 0
    ? Math.max(...results.results.map((r) => Math.max(...r.votes, 1)))
    : 1;

  return (
    <div className="min-h-screen bg-stage py-8 px-4 relative">
      <SpotlightBg />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-6 mb-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{results.title}</h1>
              <p className="text-dim-light mt-1">
                {results.totalVotes} votes from {results.totalParticipants || 0} participants
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActualiserKey(refreshKey + 1)}
                className="px-4 py-2 bg-spotlight/10 text-spotlight border border-spotlight/20 rounded-xl hover:bg-spotlight/20 transition-all text-sm font-medium active:scale-95"
              >
                Actualiser
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={advancing}
                className="px-4 py-2 bg-spotlight text-stage rounded-xl hover:bg-center-stage transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium active:scale-95"
              >
                {advancing ? "..." : "Question suivante"}
              </button>
            </div>
          </div>

          {/* Current status */}
          <div className="bg-wings/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-dim-light">Question actuelle</p>
              <p className="text-sm text-spotlight font-medium">
                {results.votesOnCurrentQuestion} / {results.totalParticipants || 0} voted
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-center-stage">
                Question {session.current_question + 1}
              </span>
              <span className="text-dim-light/50">
                of {session.questions.length}
              </span>
            </div>
            <div className="w-full bg-wings rounded-full h-1.5 mt-3">
              <div
                className="bg-linear-to-r from-spotlight to-center-stage h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((session.current_question + 1) / session.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {results.results.map((result, qIndex) => {
          const isCurrentQuestion = qIndex === session.current_question;

          return (
            <div
              key={qIndex}
              className={`bg-backstage/80 backdrop-blur-sm rounded-2xl p-6 mb-4 animate-fade-up transition-all ${
                isCurrentQuestion
                  ? "border border-spotlight/30 shadow-lg shadow-spotlight/5"
                  : "border border-spotlight/10"
              }`}
              style={{ animationDelay: `${qIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isCurrentQuestion
                    ? "bg-center-stage text-stage"
                    : "bg-spotlight/10 text-spotlight"
                  }
                `}>
                  {qIndex + 1}
                </span>
                <h2 className="text-lg font-semibold text-foreground flex-1">
                  {result.question}
                </h2>
                {isCurrentQuestion && (
                  <span className="text-xs text-center-stage bg-center-stage/10 px-2 py-1 rounded-full font-medium">
                    Live
                  </span>
                )}
              </div>

              <p className="text-xs text-dim-light mb-4">
                {result.totalVotes} response{result.totalVotes !== 1 ? "s" : ""}
              </p>

              <div className="space-y-4">
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
                  const isMax = count === Math.max(...result.votes) && result.totalVotes > 0;

                  return (
                    <ResultBar
                      key={aIndex}
                      answer={answer}
                      count={count}
                      percentage={percentage}
                      barWidth={barWidth}
                      index={aIndex}
                      isMax={isMax}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => router.push("/")}
          className="w-full py-4 bg-backstage/80 border border-spotlight/20 text-spotlight rounded-xl font-semibold hover:bg-spotlight/10 hover:border-spotlight/40 transition-all active:scale-95 mt-4"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
