import React, { useState, useEffect } from 'react';
import { Question, Team, GameStage } from './types';
import { DEFAULT_QUESTIONS, INITIAL_TEAMS } from './utils/initialQuestions';
import { sound } from './utils/sound';
import { ReadyStartScreen } from './components/ReadyStartScreen';
import { ArenaView } from './components/ArenaView';
import { QuestionModal } from './components/QuestionModal';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PodiumModal } from './components/PodiumModal';
import { ResetGameModal } from './components/ResetGameModal';

export default function App() {
  // Game stage: 'ready' (splash screen) or 'arena' (board grid)
  const [stage, setStage] = useState<GameStage>('ready');

  // Questions state
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const stored = localStorage.getItem('coc_active_questions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q: Question) => {
            if (q.category) return q;
            const defMatch = DEFAULT_QUESTIONS.find(
              (dq) => dq.id === q.id || dq.number === q.number
            );
            return {
              ...q,
              category: defMatch?.category || 'Umum',
            };
          });
        }
      }
    } catch {}
    return DEFAULT_QUESTIONS;
  });

  // Teams state (up to 10 teams)
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const stored = localStorage.getItem('coc_active_teams');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TEAMS;
  });

  const [activeTeamCount, setActiveTeamCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('coc_active_team_count');
      if (stored) return Number(stored) || 4;
    } catch {}
    return 4; // default 4 teams, max 10
  });

  // Settings
  const [defaultTimerSeconds, setDefaultTimerSeconds] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('coc_default_timer');
      if (stored) return Number(stored) || 30;
    } catch {}
    return 30;
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('coc_admin_password');
      if (stored) return stored;
    } catch {}
    return '1234';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPodiumOpen, setIsPodiumOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('coc_active_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('coc_active_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('coc_active_team_count', String(activeTeamCount));
  }, [activeTeamCount]);

  useEffect(() => {
    localStorage.setItem('coc_default_timer', String(defaultTimerSeconds));
  }, [defaultTimerSeconds]);

  useEffect(() => {
    localStorage.setItem('coc_admin_password', adminPassword);
  }, [adminPassword]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    sound.enabled = enabled;
  };

  // Start game action
  const handleStartGame = () => {
    setStage('arena');
  };

  // Select board question
  const handleSelectQuestion = (q: Question) => {
    setActiveQuestion(q);
  };

  // Award score to responding team
  const handleAwardScore = (teamId: string, points: number, isCorrect: boolean) => {
    // 1. Update teams score
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            score: team.score + points,
            correctCount: isCorrect ? team.correctCount + 1 : team.correctCount,
            wrongCount: !isCorrect ? team.wrongCount + 1 : team.wrongCount,
          };
        }
        return team;
      })
    );

    // 2. Mark question as answered
    if (activeQuestion) {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          if (q.id === activeQuestion.id) {
            return {
              ...q,
              isAnswered: true,
              answeredByTeamId: isCorrect ? teamId : null,
              isCorrect,
            };
          }
          return q;
        })
      );
    }
  };

  // Save updated questions from manager/Gemini
  const handleSaveQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
  };

  // Update teams configuration
  const handleUpdateTeams = (newTeams: Team[], count: number) => {
    setTeams(newTeams);
    setActiveTeamCount(count);
  };

  // Reset scores
  const handleResetScores = () => {
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
      }))
    );
  };

  // Reset all question boards
  const handleResetAllBoards = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        isAnswered: false,
        answeredByTeamId: null,
        isCorrect: undefined,
      }))
    );
  };

  // Comprehensive reset handlers for ResetGameModal
  const handleResetAll = () => {
    handleResetScores();
    handleResetAllBoards();
    sound.playReset();
  };

  const handleResetScoresOnly = () => {
    handleResetScores();
    sound.playReset();
  };

  const handleResetBoardsOnly = () => {
    handleResetAllBoards();
    sound.playReset();
  };

  const handleResetAndBackToStart = () => {
    handleResetScores();
    handleResetAllBoards();
    setStage('ready');
    sound.playReset();
  };

  return (
    <div className="min-h-screen bg-slate-950 font-['Outfit'] selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. START / READY SCREEN */}
      {stage === 'ready' && (
        <ReadyStartScreen
          questions={questions}
          teams={teams}
          activeTeamCount={activeTeamCount}
          defaultTimerSeconds={defaultTimerSeconds}
          onStartGame={handleStartGame}
          onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          imageUrl="/coc_champion.jpg"
        />
      )}

      {/* 2. ARENA VIEW */}
      {stage === 'arena' && (
        <ArenaView
          questions={questions}
          teams={teams}
          activeTeamCount={activeTeamCount}
          onSelectQuestion={handleSelectQuestion}
          onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPodium={() => setIsPodiumOpen(true)}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onBackToStart={() => setStage('ready')}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          imageUrl="/coc_champion.jpg"
        />
      )}

      {/* 3. ACTIVE QUESTION MODAL */}
      {activeQuestion && (
        <QuestionModal
          question={activeQuestion}
          teams={teams.slice(0, activeTeamCount)}
          onClose={() => setActiveQuestion(null)}
          onAwardScore={handleAwardScore}
          defaultTimerSeconds={defaultTimerSeconds}
        />
      )}

      {/* 4. ADMIN AUTH PASSWORD MODAL (Optional fallback) */}
      {isAuthModalOpen && (
        <AdminAuthModal
          correctPassword={adminPassword}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setIsQuestionManagerOpen(true);
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* 5. QUESTION MANAGER & GEMINI AI MODAL */}
      {isQuestionManagerOpen && (
        <QuestionManagerModal
          questions={questions}
          onSaveQuestions={handleSaveQuestions}
          onClose={() => setIsQuestionManagerOpen(false)}
        />
      )}

      {/* 6. RESET GAME MODAL */}
      {isResetModalOpen && (
        <ResetGameModal
          onClose={() => setIsResetModalOpen(false)}
          onResetAll={handleResetAll}
          onResetScoresOnly={handleResetScoresOnly}
          onResetBoardsOnly={handleResetBoardsOnly}
          onBackToStartScreen={handleResetAndBackToStart}
        />
      )}

      {/* 6. GAME SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <GameSettingsModal
          teams={teams}
          activeTeamCount={activeTeamCount}
          onUpdateTeams={handleUpdateTeams}
          defaultTimer={defaultTimerSeconds}
          onUpdateTimer={setDefaultTimerSeconds}
          adminPassword={adminPassword}
          onUpdatePassword={setAdminPassword}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onResetScores={handleResetScores}
          onResetAllBoards={handleResetAllBoards}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* 7. PODIUM MODAL */}
      {isPodiumOpen && (
        <PodiumModal
          teams={teams.slice(0, activeTeamCount)}
          onClose={() => setIsPodiumOpen(false)}
          onRestartGame={() => {
            handleResetScores();
            handleResetAllBoards();
            setIsPodiumOpen(false);
          }}
        />
      )}
    </div>
  );
}
