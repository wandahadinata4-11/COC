import React, { useState, useEffect, useRef } from 'react';
import { Question, Team } from '../types';
import { sound } from '../utils/sound';
import { VirtualKeyboard } from './VirtualKeyboard';
import { MatchingQuestion } from './MatchingQuestion';
import {
  Timer,
  Award,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Keyboard as KeyboardIcon,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface QuestionModalProps {
  question: Question;
  teams: Team[];
  onClose: () => void;
  onAwardScore: (teamId: string, points: number, isCorrect: boolean) => void;
  defaultTimerSeconds: number;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  teams,
  onClose,
  onAwardScore,
  defaultTimerSeconds,
}) => {
  const initialTime = question.timeLimit || defaultTimerSeconds || 30;
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  // Timer is NOT running until a team has been chosen by the referee/players
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Answering states
  const [shortAnswerInput, setShortAnswerInput] = useState<string>('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound and timer countdown
  useEffect(() => {
    sound.playCardOpen();
  }, []);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0 && !evaluated) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            sound.playBuzzer();
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 6) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, evaluated]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Handle Team Selection: Starts timer when a team is selected
  const handleSelectTeam = (teamId: string) => {
    if (evaluated) return;
    sound.playClick();
    setSelectedTeamId(teamId);
    // User requested: "ketika belum memilih tim yang menjawab maka waktu timer belum di mulai"
    // So when a team is selected, we automatically start the countdown if time remains!
    if (timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  // Helper to format seconds to mm:ss or s
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) {
      return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${s}s`;
  };

  // Evaluate Multiple Choice
  const handleAnswerMultipleChoice = (option: string) => {
    if (evaluated) return;
    if (!selectedTeamId) {
      sound.playWrong();
      alert('Pilih terlebih dahulu tim mana yang menjawab!');
      return;
    }

    const isCorrect =
      option.trim().toLowerCase() === (question.correctAnswer || '').trim().toLowerCase();

    setIsTimerRunning(false);
    setEvaluated(true);
    setEvaluationResult(isCorrect ? 'correct' : 'wrong');
    setShowExplanation(true);

    if (isCorrect) {
      sound.playCorrect(question.points);
      onAwardScore(selectedTeamId, question.points, true);
    } else {
      sound.playWrong();
      onAwardScore(selectedTeamId, 0, false);
    }
  };

  // Evaluate Short Answer
  const handleAnswerShortAnswer = () => {
    if (evaluated || !shortAnswerInput.trim()) return;
    if (!selectedTeamId) {
      sound.playWrong();
      alert('Pilih terlebih dahulu tim mana yang menjawab!');
      return;
    }

    const cleanInput = shortAnswerInput.trim().toLowerCase();
    const acceptedList = (question.acceptedAnswers || [question.correctAnswer || '']).map((a) =>
      a.trim().toLowerCase()
    );

    const isCorrect = acceptedList.includes(cleanInput);

    setIsTimerRunning(false);
    setEvaluated(true);
    setEvaluationResult(isCorrect ? 'correct' : 'wrong');
    setShowExplanation(true);

    if (isCorrect) {
      sound.playCorrect(question.points);
      onAwardScore(selectedTeamId, question.points, true);
    } else {
      sound.playWrong();
      onAwardScore(selectedTeamId, 0, false);
    }
  };

  // Evaluate Matching Pairs
  const handleAnswerMatching = (isAllCorrect: boolean) => {
    if (evaluated) return;
    if (!selectedTeamId) {
      sound.playWrong();
      alert('Pilih terlebih dahulu tim mana yang menjawab!');
      return;
    }

    setIsTimerRunning(false);
    setEvaluated(true);
    setEvaluationResult(isAllCorrect ? 'correct' : 'wrong');
    setShowExplanation(true);

    if (isAllCorrect) {
      sound.playCorrect(question.points);
      onAwardScore(selectedTeamId, question.points, true);
    } else {
      sound.playWrong();
      onAwardScore(selectedTeamId, 0, false);
    }
  };

  // Manual adjudication overrides by admin
  const handleManualJudge = (isCorrect: boolean) => {
    if (!selectedTeamId) {
      sound.playWrong();
      alert('Pilih tim terlebih dahulu untuk memberikan poin!');
      return;
    }
    setIsTimerRunning(false);
    setEvaluated(true);
    setEvaluationResult(isCorrect ? 'correct' : 'wrong');
    setShowExplanation(true);

    if (isCorrect) {
      sound.playCorrect(question.points);
      onAwardScore(selectedTeamId, question.points, true);
    } else {
      sound.playWrong();
      onAwardScore(selectedTeamId, 0, false);
    }
  };

  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / initialTime) * 100));

  // Child-friendly team selector block
  const renderTeamSelector = () => (
    <div
      className={`p-3 sm:p-4 rounded-2xl border-2 transition-all shadow-md ${
        !selectedTeamId && !evaluated
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
          : 'bg-slate-950/90 border-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
            Pilih Tim yang Menjawab:
          </span>
          {!selectedTeamId && !evaluated && (
            <span className="text-[11px] font-bold text-amber-300 animate-pulse bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              👈 Klik Tim untuk Menjawab & Menjalankan Waktu!
            </span>
          )}
        </div>

        {selectedTeam && (
          <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 flex items-center gap-1.5 animate-pulse shadow-sm">
            <span>{selectedTeam.avatar}</span>
            <span>Giliran: {selectedTeam.name}</span>
          </span>
        )}
      </div>

      {/* Grid tombol tim yang ramah sentuhan anak SD (posisi rendah & mudah dijangkau) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
        {teams.map((t) => {
          const isSelected = t.id === selectedTeamId;
          return (
            <button
              key={t.id}
              type="button"
              disabled={evaluated}
              onClick={() => handleSelectTeam(t.id)}
              className={`min-h-[58px] sm:min-h-[64px] p-2 rounded-2xl border-2 text-center transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer select-none ${
                isSelected
                  ? 'ring-4 ring-amber-400 bg-gradient-to-b from-amber-500/40 via-amber-600/30 to-amber-700/40 border-amber-300 text-white font-black scale-105 shadow-xl shadow-amber-500/20'
                  : 'bg-slate-800/90 border-slate-700 hover:border-amber-400/60 text-slate-200 hover:bg-slate-750 hover:text-white'
              }`}
            >
              <span className="text-xl sm:text-2xl leading-none mb-0.5">{t.avatar}</span>
              <span className="text-xs font-bold truncate max-w-full leading-tight">
                Tim {t.number}
              </span>
              <span className="text-[10px] font-mono font-semibold text-amber-300/90">
                {t.score} pts
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-['Cinzel'] font-black text-amber-300 text-lg sm:text-xl shadow-lg">
              #{question.number}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 uppercase tracking-wider">
                  📖 {question.category || 'Umum'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  +{question.points} Poin
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Kesulitan: {question.difficulty}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base">
                Mode: {question.type === 'multiple_choice' ? 'Pilihan Ganda' : question.type === 'short_answer' ? 'Isian Singkat' : question.type === 'matching' ? 'Menjodohkan' : 'Benar / Salah'}
              </h3>
            </div>
          </div>

          {/* Close modal button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Bar */}
        <div className="bg-slate-950 px-3 sm:px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 shrink-0">
              <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-cyan-400 animate-spin' : 'text-amber-400'}`} />
              <span className="text-sm font-black">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className={`h-full transition-all duration-300 ${
                  timeLeft <= 5
                    ? 'bg-rose-500 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>

            {!selectedTeamId && !evaluated && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-full whitespace-nowrap animate-pulse hidden sm:inline">
                ⏸️ Menunggu Tim Dipilih
              </span>
            )}
          </div>

          {/* Timer Controls & Quick Modifiers */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick time additions */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTimeLeft((prev) => prev + 30);
              }}
              className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-[11px] font-mono font-bold cursor-pointer"
              title="Tambah 30 Detik"
            >
              +30s
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTimeLeft((prev) => prev + 60);
              }}
              className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-[11px] font-mono font-bold cursor-pointer"
              title="Tambah 1 Menit"
            >
              +1m
            </button>

            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
              }`}
              title={isTimerRunning ? 'Jeda Timer' : 'Jalankan Timer'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTimeLeft(initialTime);
                setIsTimerRunning(Boolean(selectedTeamId));
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
              title="Reset Waktu Semula"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Question Text & Answering Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Question Text Card */}
          <div className="bg-slate-850/80 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-inner">
            <div className="text-xs text-amber-400 font-semibold mb-1 uppercase tracking-wide">
              Pertanyaan:
            </div>
            <p className="text-white text-base sm:text-lg md:text-xl font-medium leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* POSISI PILIH TIM DI BAWAH SOAL (Untuk Pilihan Ganda, Benar/Salah, & Menjodohkan) */}
          {question.type !== 'short_answer' && renderTeamSelector()}

          {/* Answering Controls based on Type */}
          {/* 1. Multiple Choice */}
          {question.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(question.options || []).map((opt, idx) => {
                const labelLetter = String.fromCharCode(65 + idx);
                const isThisAnswer =
                  (question.correctAnswer || '').trim().toLowerCase() === opt.trim().toLowerCase();

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={evaluated}
                    onClick={() => handleAnswerMultipleChoice(opt)}
                    className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 shadow-md active:scale-98 cursor-pointer ${
                      evaluated && isThisAnswer
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 font-bold'
                        : evaluated && !isThisAnswer
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                        : 'bg-slate-800/90 border-slate-700 hover:border-cyan-400 hover:bg-slate-750 text-slate-100'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold flex items-center justify-center shrink-0 font-mono">
                      {labelLetter}
                    </span>
                    <span className="text-sm sm:text-base font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. True / False */}
          {question.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              {['Benar', 'Salah'].map((opt) => {
                const isThisAnswer =
                  (question.correctAnswer || '').trim().toLowerCase() === opt.trim().toLowerCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={evaluated}
                    onClick={() => handleAnswerMultipleChoice(opt)}
                    className={`py-6 rounded-2xl border-2 text-center transition-all font-bold text-lg sm:text-xl shadow-lg active:scale-98 cursor-pointer ${
                      evaluated && isThisAnswer
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                        : evaluated && !isThisAnswer
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50'
                        : opt === 'Benar'
                        ? 'bg-emerald-900/40 border-emerald-500/60 hover:bg-emerald-800/60 text-emerald-200'
                        : 'bg-rose-900/40 border-rose-500/60 hover:bg-rose-800/60 text-rose-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Short Answer with Kolom Jawaban, Pilih Tim di Bawah Kolom Jawaban di Atas Keyboard */}
          {question.type === 'short_answer' && (
            <div className="space-y-4 pt-1">
              {/* Kolom Jawaban */}
              <div className="space-y-1.5">
                <div className="text-xs text-cyan-300 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span>Kolom Jawaban:</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    (Ketik lewat keyboard fisik atau gunakan papan ketik virtual di bawah)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={shortAnswerInput}
                      disabled={evaluated}
                      onChange={(e) => setShortAnswerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerShortAnswer();
                      }}
                      placeholder="Ketik jawaban di sini..."
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border-2 border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white text-base sm:text-lg font-mono outline-none shadow-inner"
                    />
                    {shortAnswerInput && !evaluated && (
                      <button
                        type="button"
                        onClick={() => setShortAnswerInput('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-700 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={evaluated || !shortAnswerInput.trim()}
                    onClick={handleAnswerShortAnswer}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-base border border-emerald-400 shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              </div>

              {/* POSISI PILIH TIM DI BAWAH KOLOM JAWABAN & DI ATAS KEYBOARD */}
              {renderTeamSelector()}

              {/* Toggle Virtual Keyboard */}
              {!evaluated && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                    className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    <KeyboardIcon className="w-3.5 h-3.5" />
                    <span>{showVirtualKeyboard ? 'Sembunyikan Papan Ketik Virtual' : 'Tampilkan Papan Ketik Virtual'}</span>
                  </button>
                </div>
              )}

              {/* Virtual Keyboard Component */}
              {!evaluated && showVirtualKeyboard && (
                <VirtualKeyboard
                  value={shortAnswerInput}
                  onChange={setShortAnswerInput}
                  onSubmit={handleAnswerShortAnswer}
                  disabled={evaluated}
                />
              )}
            </div>
          )}

          {/* 4. Matching Question */}
          {question.type === 'matching' && question.pairs && (
            <div className="pt-2">
              <MatchingQuestion
                pairs={question.pairs}
                onComplete={handleAnswerMatching}
                disabled={evaluated}
              />
            </div>
          )}

          {/* Evaluation Result Alert */}
          {evaluated && (
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                evaluationResult === 'correct'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {evaluationResult === 'correct' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-base sm:text-lg">
                    {evaluationResult === 'correct'
                      ? 'LUAR BIASA! JAWABAN BENAR!'
                      : 'JAWABAN SALAH ATAU BELUM TEPAT!'}
                  </h4>
                  <p className="text-xs sm:text-sm opacity-90">
                    {evaluationResult === 'correct'
                      ? `Tim ${selectedTeam?.name || ''} berhasil memperoleh +${question.points} poin!`
                      : `Tidak ada poin yang ditambahkan ke tim.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-current text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showExplanation ? 'Sembunyikan Kunci' : 'Lihat Kunci & Bahasan'}</span>
              </button>
            </div>
          )}

          {/* Explanation / Answer Key Reveal */}
          {showExplanation && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 text-slate-200 text-sm space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                Kunci Jawaban & Penjelasan Resmi:
              </div>
              <div className="font-semibold text-emerald-300">
                Jawaban Benar:{' '}
                {question.type === 'matching'
                  ? question.pairs?.map((p) => `[${p.left} -> ${p.right}]`).join(', ')
                  : question.correctAnswer || question.acceptedAnswers?.join(' / ')}
              </div>
              {question.explanation && (
                <p className="text-slate-300 text-xs sm:text-sm italic">
                  {question.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar: Admin Manual Adjudication & Finish Button */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Penilaian Manual Wasit:
            </span>
            <button
              type="button"
              onClick={() => handleManualJudge(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Berikan poin ke tim terpilih"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Benar (+{question.points} Pts)</span>
            </button>
            <button
              type="button"
              onClick={() => handleManualJudge(false)}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-300 border border-rose-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Tandai salah"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Salah (0 Pts)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold text-sm border border-amber-300 shadow-lg cursor-pointer"
          >
            Tutup & Kembali ke Arena
          </button>
        </div>
      </div>
    </div>
  );
};
