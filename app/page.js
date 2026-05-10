"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import {
  createSession,
  getAllSessions,
  startSession,
  getTemplates,
  createTemplate,
  deleteTemplate,
} from "./lib/voting";

function SpotlightBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-1/2 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          transform: "translateX(-50%)",
          animation: "spotlight-sweep 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)",
          animation: "spotlight-sweep 10s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

const STAR_DATA = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i * 0.3) % 3}s`,
  duration: `${2 + (i % 4) * 0.5}s`,
}));

function StarsBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {STAR_DATA.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 rounded-full bg-spotlight/30 animate-star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dim-light mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-backstage border border-spotlight/20 rounded-xl text-foreground placeholder-dim-light/50 focus:outline-none focus:border-spotlight/60 focus:ring-1 focus:ring-spotlight/30 transition-all duration-200"
      />
    </div>
  );
}

function PrimaryButton({ children, variant = "gold", ...props }) {
  const baseStyle = "w-full py-3.5 rounded-xl font-semibold transition-all duration-200 active:scale-95";
  const variants = {
    gold: "bg-spotlight text-stage hover:bg-center-stage disabled:opacity-40 disabled:cursor-not-allowed",
    outline: "border border-spotlight/40 text-spotlight hover:bg-spotlight/10 hover:border-spotlight/60",
    ghost: "text-dim-light hover:text-foreground",
  };
  return (
    <button
      {...props}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState("setup");
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [answersPerQuestion, setAnswersPerQuestion] = useState(4);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionPin, setSessionPin] = useState("");
  const [sessions, setSessions] = useState([]);
  const [templates, setModèles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModèles, setAfficherModèles] = useState(false);
  const [showCreateTemplate, setAfficherCreateTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getAllSessions();
      setSessions(data);
      const templatesData = await getTemplates();
      setModèles(templatesData);
    };
    load();
  }, []);

  const handleUseTemplate = (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      const newQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        text: `Question ${i + 1}`,
        answers: Array.from(
          { length: answersPerQuestion },
          (_, j) => `Answer ${j + 1}`
        ),
      }));
      setQuestions(newQuestions);
    }
    setStep("questions");
  };

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

  const handleSelectTemplate = (template) => {
    const parsedQuestions = typeof template.questions === "string"
      ? JSON.parse(template.questions)
      : template.questions;
    if (!parsedQuestions || parsedQuestions.length === 0) return;
    setQuestions(parsedQuestions);
    setNumQuestions(parsedQuestions.length);
    const allAnswers = parsedQuestions.map((q) => q.answers?.length || 0);
    setAnswersPerQuestion(Math.max(2, ...allAnswers));
    setSelectedTemplate(template.id);
    setAfficherModèles(false);
    if (!title) setTitle(template.name);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return;
    await createTemplate({ name: templateName, questions });
    const templatesData = await getModèles();
    setModèles(templatesData);
    setAfficherCreateTemplate(false);
    setTemplateName("");
  };

  const handleDeleteTemplate = async (templateId) => {
    await deleteTemplate(templateId);
    const templatesData = await getModèles();
    setModèles(templatesData);
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
    }
  };

  if (showCreateTemplate) {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <StarsBg />
        <div className="relative w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <svg className="w-12 h-12 text-spotlight mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Save as Template</h1>
            <p className="text-dim-light mt-2">Save your current questions for reuse</p>
          </div>

          <div className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-6 space-y-5">
            <InputField
              label="Template Name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              placeholder="e.g., Performance Voting"
            />

            <div className="bg-wings/50 rounded-xl p-4">
              <p className="text-sm text-dim-light mb-2">
                This will save {questions.length} question{questions.length !== 1 ? "s" : ""}:
              </p>
              <ul className="text-xs text-dim-light/70 space-y-1">
                {questions.map((q, i) => (
                  <li key={i} className="truncate">{q.text}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <PrimaryButton
                variant="outline"
                onClick={() => { setAfficherCreateTemplate(false); setTemplateName(""); }}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={handleSaveAsTemplate}
                disabled={!templateName.trim()}
              >
                Save
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <StarsBg />
        <div className="relative w-full max-w-md animate-scale-in">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold animate-text-shimmer tracking-tight">
              SAINT-JO
            </h1>
            <p className="text-dim-light mt-3 text-lg">Créer une session de vote</p>
          </div>

          <form onSubmit={handleUseTemplate} className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-6 space-y-5">
            <InputField
              label="Titre de la session"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Performance Awards 2026"
            />

            <InputField
              label="Code PIN administrateur (4 chiffres)"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength={4}
              pattern="\d{4}"
              placeholder="1234"
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10}
              />
              <InputField
                label="Réponses par question"
                type="number"
                value={answersPerQuestion}
                onChange={(e) => setAnswersPerQuestion(Math.max(2, parseInt(e.target.value) || 4))}
                min={2}
                max={6}
              />
            </div>

            <PrimaryButton type="submit">
              Écrire les questions
            </PrimaryButton>
          </form>

          {templates.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-dim-light">Modèles</h3>
                <button
                  onClick={() => setAfficherModèles(!showModèles)}
                  className="text-xs text-spotlight hover:text-center-stage transition-colors"
                >
                  {showModèles ? "Masquer" : "Afficher"}
                </button>
              </div>

              {showModèles && (
                <div className="space-y-2">
                  {templates.map((template) => {
                    const parsedQ = typeof template.questions === "string"
                      ? JSON.parse(template.questions)
                      : template.questions;
                    return (
                      <div
                        key={template.id}
                        className="flex items-center justify-between px-4 py-3 bg-backstage/60 border border-spotlight/10 rounded-xl hover:border-spotlight/30 transition-all"
                      >
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="flex-1 text-left"
                        >
                          <span className="font-medium text-foreground">{template.name}</span>
                          <span className="text-xs text-dim-light ml-2">
                            {parsedQ.length}q
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-dim-light hover:text-red-400 p-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {sessions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-spotlight/10">
              <h3 className="text-sm font-medium text-dim-light mb-3">Sessions récentes</h3>
              <div className="space-y-2">
                {sessions.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/results/${s.id}`)}
                    className="w-full text-left px-4 py-3 bg-backstage/60 border border-spotlight/10 rounded-xl hover:border-spotlight/30 transition-all"
                  >
                    <span className="font-medium text-foreground">{s.title}</span>
                    <span className="text-xs text-dim-light ml-2">
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
      <div className="min-h-screen bg-stage py-8 px-4 relative">
        <SpotlightBg />
        <StarsBg />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-2xl font-bold text-foreground">Write Your Questions</h1>
            <p className="text-dim-light mt-2">Each question is a stage moment</p>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="bg-backstage/80 backdrop-blur-sm border border-spotlight/10 rounded-2xl p-6 animate-fade-up"
                style={{ animationDelay: `${qIndex * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-spotlight/10 border border-spotlight/30 flex items-center justify-center text-spotlight text-sm font-bold">
                    {qIndex + 1}
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">Question {qIndex + 1}</h2>
                </div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  className="w-full px-4 py-3 bg-wings/50 border border-spotlight/20 rounded-xl text-foreground placeholder-dim-light/50 focus:outline-none focus:border-spotlight/60 focus:ring-1 focus:ring-spotlight/30 transition-all mb-4"
                  placeholder="Enter your question"
                />
                <div className="grid grid-cols-2 gap-3">
                  {question.answers.map((answer, aIndex) => (
                    <input
                      key={aIndex}
                      type="text"
                      value={answer}
                      onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                      className="px-4 py-3 bg-wings/50 border border-spotlight/20 rounded-xl text-foreground placeholder-dim-light/50 focus:outline-none focus:border-spotlight/60 focus:ring-1 focus:ring-spotlight/30 transition-all"
                      placeholder={`Option ${String.fromCharCode(65 + aIndex)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <PrimaryButton
              variant="outline"
              onClick={() => setStep("setup")}
              className="flex-1"
            >
              Back
            </PrimaryButton>
            <PrimaryButton
              variant="outline"
              onClick={() => setAfficherCreateTemplate(true)}
              className="flex-1"
            >
              Enregistrer le modèle
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSaveQuestions}
              className="flex-1"
            >
              Générer le QR
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    const voteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${sessionId}`;

    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <StarsBg />
        <div className="relative w-full max-w-lg text-center animate-scale-in">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-dim-light mt-2">Session prête</p>
          </div>

          <div className="bg-backstage/80 backdrop-blur-sm border border-spotlight/20 rounded-2xl p-8 mb-6 animate-gold-pulse inline-block">
            <div className="bg-white rounded-xl p-4">
              <QRCode value={voteUrl} size={200} />
            </div>
          </div>

          <p className="text-sm text-dim-light mb-2">Scannez pour voter</p>
          <p className="text-xs text-dim-light/50 mb-6 break-all">{voteUrl}</p>

          <div className="bg-spotlight/5 border border-spotlight/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-spotlight font-medium">Waiting to start</p>
            <p className="text-xs text-dim-light mt-1">
              Participants see a waiting screen until you begin
            </p>
          </div>

          <div className="bg-wings/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-dim-light">
              Code PIN administrateur:<span className="font-bold text-foreground tracking-widest">{sessionPin}</span>
            </p>
            <p className="text-xs text-dim-light/50 mt-1">Enregistrez ceci pour voir les résultats</p>
          </div>

          <div className="flex gap-3">
            <PrimaryButton onClick={handleStartVoting} className="flex-1">
              Démarrer le vote
            </PrimaryButton>
            <PrimaryButton variant="outline" onClick={handleViewResults} className="flex-1">
              Voir les résultats
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === "active") {
    return (
      <div className="min-h-screen bg-stage flex items-center justify-center p-4 relative">
        <SpotlightBg />
        <StarsBg />
        <div className="relative w-full max-w-md text-center animate-scale-in">
          <div className="mb-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-center-stage/30 animate-glow-ring" />
              <div className="relative w-20 h-20 bg-spotlight/10 border border-spotlight/40 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-center-stage" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Le vote est en cours</h1>
            <p className="text-dim-light mt-2">Les participants peuvent scanner et voter maintenant</p>
          </div>

          <PrimaryButton onClick={handleViewResults}>
            Voir les résultats en temps réel
          </PrimaryButton>
        </div>
      </div>
    );
  }
}
