"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, addVote, joinSession } from "../../lib/voting";

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
      <div
        className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)",
          animation: "spotlight-sweep 12s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          animation: "spotlight-sweep 10s ease-in-out infinite",
        }}
      />
    </div>
  );
}

const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 50 + ((i * 37 + 13) % 60) - 30,
  y: 50 + ((i * 53 + 7) % 60) - 30,
  size: 2 + (i % 4),
  delay: (i * 0.15) % 0.3,
  duration: 0.5 + (i % 5) * 0.1,
}));

function Particles({ active }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {PARTICLE_DATA.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-center-stage animate-particle-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressRing({ current, total }) {
  const progress = current / total;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(212,175,55,0.15)"
          strokeWidth="2.5"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-spotlight">{current}</span>
      </div>
    </div>
  );
}

function AnswerButton({ answer, index, selected, onClick, disabled }) {
  const letter = String.fromCharCode(65 + index);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full p-4 rounded-xl border transition-all duration-200 active:scale-95
        ${selected
          ? "bg-center-stage border-center-stage text-stage shadow-lg shadow-center-stage/20"
          : "bg-backstage/80 border-spotlight/20 text-foreground hover:border-spotlight/50 hover:bg-spotlight/5"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <span className={`
          w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all
          ${selected
            ? "bg-stage text-center-stage"
            : "bg-spotlight/10 text-spotlight group-hover:bg-spotlight/20"
          }
        `}>
          {letter}
        </span>
        <span className="text-left font-medium flex-1">{answer.text}</span>
        {selected && (
          <svg className="w-5 h-5 text-stage" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

function WaitingPulse() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 150, 300].map((delay, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-spotlight"
          style={{
            animation: "float 1.5s ease-in-out infinite",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverQuestion, setServerQuestion] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const init = async () => {
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
      setServerQuestion(loadedSession.current_question);
      setIsLoading(false);
    };
    init();
  }, [params.sessionId]);

  useEffect(() => {
    if (!session) return;

    const checkForUpdates = async () => {
      const updatedSession = await getSession(params.sessionId);
      if (!updatedSession) return;

      if (updatedSession.is_active && !session.is_active) {
        setSession(updatedSession);
        return;
      }

      if (updatedSession.is_active && updatedSession.current_question !== serverQuestion) {
        if (updatedSession.current_question >= session.questions.length) {
          setServerQuestion(updatedSession.current_question);
          setHasVoted(true);
        } else if (updatedSession.current_question !== serverQuestion) {
          setTransitioning(true);
          setTimeout(() => {
            setSession(updatedSession);
            setServerQuestion(updatedSession.current_question);
            setSelectedAnswer(null);
            setHasVoted(false);
            setTransitioning(false);
          }, 300);
        }
      }
    };

    const interval = setInterval(checkForUpdates, 4000);
    return () => clearInterval(interval);
  }, [session, params.sessionId, serverQuestion]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitVote = async () => {
    if (selectedAnswer === null) return;

    const updatedSession = await getSession(params.sessionId);
    if (!updatedSession || updatedSession.current_question !== serverQuestion) {
      setError("Question modifiée, veuillez patienter...");
      setSelectedAnswer(null);
      return;
    }

    const success = await addVote(
      params.sessionId,
      serverQuestion,
      selectedAnswer,
      participantId
    );
    if (!success) {
      setError("Échec de soumission du vote");
      return;
    }

    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1500);
    setHasVoted(true);
  };

  if (error) {
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
          <p className="text-dim-light mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-spotlight text-stage rounded-xl font-semibold hover:bg-center-stage transition-colors active:scale-95"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center relative">
        <SpotlightBg />
        <div className="animate-fade-in">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-spotlight/30 animate-ping" />
              <div className="relative w-12 h-12 rounded-full bg-spotlight/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-center-stage animate-pulse" />
              </div>
            </div>
            <p className="text-dim-light text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session.is_active) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <Particles active={showParticles} />
        <div className="relative text-center animate-scale-in max-w-sm w-full">
          <div className="mb-10 animate-curtain-reveal">
            <h1 className="text-5xl font-extrabold animate-text-shimmer tracking-tight mb-2">
              PRIX SAINT-JO
            </h1>
            <p className="text-xl text-dim-light tracking-widest uppercase ">Prix</p>
          </div>

          <div className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-spotlight/20 animate-glow-ring" style={{ animationIterationCount: "infinite" }} />
              <div className="relative w-20 h-20 bg-spotlight/10 border border-spotlight/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-spotlight" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">En attente du spectacle</h2>
            <p className="text-dim-light mb-6">{session.title}</p>

            <WaitingPulse />
            <p className="text-xs text-dim-light/60 mt-4">L'hôte commencera le vote bientôt</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    const isLastQuestion = serverQuestion >= session.questions.length - 1;

    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <Particles active={showParticles} />
        <div className="relative text-center animate-scale-in max-w-sm w-full">
          <div className="bg-backstage/80 backdrop-blur-sm border border-spotlight/20 rounded-2xl p-8">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-center-stage/30 animate-glow-ring" />
              <div className="relative w-20 h-20 bg-center-stage/10 border border-center-stage/40 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-center-stage" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">Vote enregistré</h2>
            <p className="text-dim-light mb-6">Votre réponse a été soumise</p>

            <div className="bg-wings/50 rounded-xl p-4 mb-6">
              <p className="text-xs text-dim-light mb-1">Question</p>
              <p className="text-lg font-semibold text-spotlight">
                {serverQuestion + 1} <span className="text-dim-light/50">/ {session.questions.length}</span>
              </p>
            </div>

            {!isLastQuestion ? (
              <>
                <WaitingPulse />
                <p className="text-xs text-dim-light/60 mt-4">Next question coming soon</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-center-stage">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-medium">Final question — results coming soon</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (serverQuestion >= session.questions.length) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <div className="relative text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-center-stage/10 border border-center-stage/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-center-stage" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Vote terminé</h1>
          <p className="text-dim-light">Merci d'avoir participé à {session.title}</p>
        </div>
      </div>
    );
  }

  const question = session.questions[serverQuestion];

  return (
    <div className="min-h-screen bg-stage flex flex-col relative">
      <SpotlightBg />
      <Particles active={showParticles} />

      {/* Header */}
      <div className={`relative px-4 pt-6 pb-4 transition-opacity duration-300 ${transitioning ? "opacity-0" : "opacity-100"}`}>
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <ProgressRing current={serverQuestion + 1} total={session.questions.length} />
            <div>
              <p className="text-xs text-dim-light">Question</p>
              <p className="text-sm font-semibold text-spotlight">
                {serverQuestion + 1} / {session.questions.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-dim-light">{session.title}</p>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className={`flex-1 flex flex-col justify-center px-4 transition-all duration-300 ${transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
        <div className="max-w-lg mx-auto w-full">
          <h2 className="text-xl font-bold text-foreground mb-8 text-center leading-snug">
            {question.text}
          </h2>

          <div className="space-y-3 mb-8">
            {question.answers.map((answer, index) => (
              <AnswerButton
                key={index}
                answer={answer}
                index={index}
                selected={selectedAnswer === index}
                onClick={() => handleAnswerSelect(index)}
                disabled={hasVoted}
              />
            ))}
          </div>

          <button
            onClick={handleSubmitVote}
            disabled={selectedAnswer === null || hasVoted}
            className={`
              w-full py-4 rounded-xl font-semibold transition-all duration-200 active:scale-95
              ${selectedAnswer === null || hasVoted
                ? "bg-wings/50 text-dim-light/40 cursor-not-allowed"
                : "bg-linear-to-r from-spotlight to-center-stage text-stage shadow-lg shadow-spotlight/20 hover:shadow-xl hover:shadow-spotlight/30"
              }
            `}
          >
            {hasVoted ? "Vote Submitted" : "Confirmer le vote"}
          </button>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="relative px-4 py-6 text-center">
        <p className="text-xs text-dim-light/30 tracking-widest uppercase">Prix Saint-Jo</p>
      </div>
    </div>
  );
}
