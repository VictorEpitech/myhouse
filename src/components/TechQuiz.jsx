import React, { useState } from 'react';
import questionsData from '../data/questions.json';
import housesData from '../data/houses.json';
import { useAuth } from '../auth/AuthContext';
import { sounds } from '../utils/soundEffects';
import { saveUserResult, getStoredResults, removeUserResult, syncStudentResultFromDB } from '../utils/storage';
import { Sparkles, RotateCcw, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TechQuiz({ onComplete, existingResult: propResult, onReset }) {
  const { currentUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [scores, setScores] = useState({
    timelords: 0,
    gatekeepers: 0,
    codecrafters: 0,
    oracles: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAdminReset, setIsAdminReset] = useState(false);

  // Authoritative result state (from App or local sync)
  const [activeResult, setActiveResult] = useState(propResult !== undefined ? propResult : null);

  React.useEffect(() => {
    setActiveResult(propResult !== undefined ? propResult : null);
  }, [propResult]);

  // Synchronize local result with authoritative currentUser assigned house
  React.useEffect(() => {
    if (currentUser?.email && activeResult) {
      const expectedTeam = currentUser.teamName || currentUser.house?.name;
      if (expectedTeam && expectedTeam !== 'Non assigné' && activeResult.officialTeam !== expectedTeam) {
        saveUserResult(currentUser.email, {
          ...activeResult,
          officialTeam: expectedTeam
        });
      }
    }
  }, [currentUser, activeResult]);

  // STRICT SINGLE-ATTEMPT RULE: if already completed and not admin reset, show locked view
  if (activeResult && !isAdminReset) {
    const assignedHouse = currentUser?.house || 
      housesData.find(h => h.id === currentUser?.teamId || h.name === currentUser?.teamName) ||
      housesData.find(h => h.name === activeResult.officialTeam) ||
      housesData[0];
    const totalTechCount = activeResult.totalTechnicalQuestions || questionsData.filter(q => q.correctOption).length;

    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-mono text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Rituel Unique Scellé par le Codex
        </div>

        <h2 className="text-2xl sm:text-3xl font-cyber font-bold text-white">
          Rituel d'Attribution Déjà Accompli
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Bonjour <strong className="text-white">{currentUser?.fullName}</strong>. Vos réponses et votre profil d'ingénieur ont déjà été définitivement enregistrés et validés.
          <br /><br />
          <span className="text-slate-400 text-xs font-mono">
            Conformément aux règles d'Epitech Moulins pour préserver l'équité des promotions, le test ne peut être passé qu'une seule fois.
          </span>
        </p>

        {/* Recap card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left max-w-md mx-auto space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400 font-mono">Promotion :</span>
            <span className="text-white font-mono font-semibold">{currentUser?.classe}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400 font-mono">Date de validation :</span>
            <span className="text-slate-300 font-mono">
              {activeResult.completedAt ? new Date(activeResult.completedAt).toLocaleString('fr-FR') : 'Scellé'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2.5">
            <span className="text-slate-400 font-mono">Score de Logique & Culture :</span>
            <span className="text-emerald-400 font-mono font-bold">
              {activeResult.correctCount} / {totalTechCount}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono">Affectation officielle :</span>
            <span className="font-mono font-bold" style={{ color: assignedHouse.color }}>
              {assignedHouse.name}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sounds.playSelect();
              onComplete({
                officialHouse: assignedHouse,
                scores: activeResult.scores,
                correctCount: activeResult.correctCount,
                totalTechnicalQuestions: totalTechCount
              });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-cyber font-bold text-xs shadow-lg shadow-cyan-500/20 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Consulter ma Proclamation de Maison
          </button>

          {currentUser?.isAdmin && (
            <button
              onClick={async () => {
                sounds.playSelect();
                await removeUserResult(currentUser.email);
                setActiveResult(null);
                setIsAdminReset(true);
                onReset?.();
              }}
              className="text-xs text-red-400 hover:text-red-300 font-mono underline p-2"
            >
              [Admin Victor Granger] Re-tester le rituel
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questionsData[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questionsData.length) * 100);

  const handleSelectOption = (option) => {
    sounds.playSelect();
    
    // Check correctness if question has a right answer
    const isCorrect = currentQ.correctOption ? option.id === currentQ.correctOption : null;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrectCount);

    const newAnswers = [...answers, { 
      questionId: currentQ.id, 
      category: currentQ.category,
      optionId: option.id,
      optionLabel: option.label,
      isCorrect,
      house: option.house
    }];

    const newScores = {
      ...scores,
      [option.house]: scores[option.house] + 1
    };

    setAnswers(newAnswers);
    setScores(newScores);

    if (currentIndex + 1 < questionsData.length) {
      sounds.playStep();
      setCurrentIndex(currentIndex + 1);
    } else {
      runAnalysisSequence(newScores, newAnswers, newCorrectCount);
    }
  };

  const runAnalysisSequence = async (finalScores, finalAnswers, finalCorrect) => {
    setIsAnalyzing(true);
    sounds.playStep();

    let highestHouseSlug = 'timelords';
    let maxScore = -1;
    Object.entries(finalScores).forEach(([h, s]) => {
      if (s > maxScore) {
        maxScore = s;
        highestHouseSlug = h;
      }
    });

    const calculatedHouse = housesData.find(h => h.slug === highestHouseSlug) || housesData[0];

    // Authoritative assigned baseline house: check currentUser or query DB
    let assignedHouse = currentUser?.house;
    if (!assignedHouse && currentUser?.email) {
      try {
        const res = await fetch(`/api/students/${encodeURIComponent(currentUser.email.trim().toLowerCase())}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.teamId) {
            assignedHouse = housesData.find(h => h.id === json.data.teamId || h.name === json.data.teamName);
          }
        }
      } catch (err) {
        console.warn('Could not fetch student assigned house from DB in quiz:', err);
      }
    }

    // The official house MUST strictly be the baseline house assigned to the student.
    // The quiz answers ONLY compute the affinity profile (calculatedHouse).
    const targetHouse = assignedHouse || currentUser?.house || calculatedHouse;

    if (currentUser?.email) {
      await saveUserResult(currentUser.email, {
        studentName: currentUser.fullName,
        classe: currentUser.classe,
        scores: finalScores,
        correctCount: finalCorrect,
        totalTechnicalQuestions: questionsData.filter(q => q.correctOption).length,
        officialTeam: targetHouse?.name,
        totalQuestions: questionsData.length,
        answers: finalAnswers
      });
    }

    const steps = [
      `Vérification des ${questionsData.length} réponses d'énigmes et de culture informatique...`,
      "Calcul de votre score de logique et de raisonnement...",
      "Analyse de vos réflexes face aux bugs et projets...",
      "Consultation de l'équilibre des promotions d'Epitech Moulins...",
      "Affectation officielle validée par le Codex !"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAnalysisStep(currentStep);
        sounds.playHover();
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          sounds.playHouseReveal();
          onComplete({
            officialHouse: targetHouse,
            scores: finalScores,
            correctCount: finalCorrect
          });
        }, 800);
      }
    }, 700);
  };

  const restartQuiz = () => {
    sounds.playSelect();
    setCurrentIndex(0);
    setAnswers([]);
    setCorrectCount(0);
    setScores({ timelords: 0, gatekeepers: 0, codecrafters: 0, oracles: 0 });
    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    const steps = [
      `Vérification des ${questionsData.length} réponses d'énigmes et de culture informatique...`,
      "Calcul de votre score de logique et de raisonnement...",
      "Analyse de vos réflexes face aux bugs et projets...",
      "Consultation de l'équilibre des promotions d'Epitech Moulins...",
      "Affectation officielle validée par le Codex !"
    ];

    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-8 animate-fadeIn">
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          <Sparkles className="w-10 h-10 text-cyan-300 animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="text-xs font-mono tracking-widest uppercase text-cyan-400">
            [ ALGORITHME DE POSITIONNEMENT DU CODEX ]
          </div>
          <h2 className="text-2xl font-cyber font-bold text-white">
            {steps[analysisStep]}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Analyse complète de vos {questionsData.length} réponses et attribution de votre Maison...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 h-full transition-all duration-500"
            style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 animate-fadeIn">
      
      {/* Top Header & Progress */}
      <div className="mb-8 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/80 uppercase">
              Question {currentIndex + 1} / {questionsData.length}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {currentQ.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {currentQ.difficulty}
            </span>

            {currentUser?.isAdmin && (
              <button
                onClick={restartQuiz}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition font-mono"
                title="Mode Administrateur uniquement"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>[Admin] Recommencer</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

      </div>

      {/* Main Question Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0e1626] to-[#080d17] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40">
        
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"></div>

        {/* Scenario Header */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            <span>Épreuve #{currentIndex + 1}</span>
            <span>•</span>
            <span>{currentQ.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-cyber font-bold text-white leading-snug">
            {currentQ.scenario}
          </h2>
        </div>

        {/* Optional Code Snippet or Riddle Board */}
        {currentQ.codeSnippet && (
          <div className="mb-6 rounded-xl bg-[#060a12] border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/80 pb-2 mb-2 font-sans">
              <span>Énigme / Données à observer</span>
              <span>Terminal Epitech</span>
            </div>
            <pre className="text-slate-200 leading-relaxed">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Natural Options List without any house clues */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const letters = ['A', 'B', 'C', 'D'];
            const letter = letters[idx] || option.id.toUpperCase();

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className="w-full text-left p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 group flex items-start gap-3.5 hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Clean Letter Badge A, B, C, D */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs bg-slate-800 text-slate-300 border border-slate-700 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-colors">
                  {letter}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {option.label}
                  </div>
                  {option.text && option.text !== option.label && (
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      {option.text}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Question {currentIndex + 1} sur {questionsData.length}</span>
          <span>Codex Epitech Moulins</span>
        </div>

      </div>

    </div>
  );
}
