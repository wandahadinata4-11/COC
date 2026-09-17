import React from 'react';
import { Question, Team } from '../types';
import { QuestionBoardCard } from './QuestionBoardCard';
import { sound } from '../utils/sound';
import {
  Trophy,
  Settings,
  Bot,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface ArenaViewProps {
  questions: Question[];
  teams: Team[];
  activeTeamCount: number;
  onSelectQuestion: (question: Question) => void;
  onOpenQuestionManager: () => void;
  onOpenSettings: () => void;
  onOpenPodium: () => void;
  onOpenResetModal: () => void;
  onBackToStart: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  imageUrl?: string;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  questions,
  teams,
  activeTeamCount,
  onSelectQuestion,
  onOpenQuestionManager,
  onOpenSettings,
  onOpenPodium,
  onOpenResetModal,
  onBackToStart,
  isFullscreen,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  imageUrl = '/coc_champion.jpg',
}) => {
  const activeTeams = teams.slice(0, activeTeamCount);
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const remainingCount = questions.length - answeredCount;

  // Sorted teams for leaderboard preview
  const rankedTeams = [...activeTeams].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Main Navigation */}
      <header className="sticky top-0 z-30 bg-slate-950/95 border-b border-amber-500/30 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand and back */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStart}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Kembali ke Layar Pembuka"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel'] font-black text-base sm:text-lg bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
                  ARENA CLASS OF CHAMPIONS
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  {remainingCount} Tersisa
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih papan bergambar sesuai bidang soal di bawah untuk membuka kuis!
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenPodium}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Lihat Peringkat & Juara"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Podium Juara</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuestionManager}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Kelola & Buat Soal (AI & Manual Bebas Tanpa Batas)"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Kelola & Buat Soal</span>
            </button>

            {/* Reset Game Menu */}
            <button
              type="button"
              onClick={onOpenResetModal}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-200 border border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Reset Permainan / Ulangi Pertandingan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset Game</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Pengaturan Tim & Game"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onToggleSound(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 shadow-sm"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* TEAM SCOREBOARD BAR (UP TO 10 TEAMS) */}
      <section className="bg-slate-900/90 border-b border-slate-800 py-3 px-3 sm:px-6 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Papan Skor Tim ({activeTeamCount} Tim Bertanding):
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Terjawab: {answeredCount}/{questions.length} Papan
            </span>
          </div>

          {/* Teams Grid / Scroll */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {rankedTeams.map((team, rank) => {
              return (
                <div
                  key={team.id}
                  className="relative p-2 rounded-xl border transition-all hover:scale-102 flex flex-col items-center text-center shadow-md bg-slate-950/70"
                  style={{
                    borderColor: `${team.color}70`,
                    boxShadow: `0 4px 12px ${team.color}15`,
                  }}
                >
                  {/* Rank badge */}
                  <span
                    className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] font-mono shadow ${
                      rank === 0
                        ? 'bg-amber-400 text-slate-950'
                        : rank === 1
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rank + 1}
                  </span>

                  <span className="text-lg">{team.avatar}</span>
                  <div className="text-xs font-bold text-white truncate max-w-full mt-0.5">
                    {team.name}
                  </div>
                  <div className="text-xs font-mono font-extrabold text-amber-400 mt-0.5">
                    {team.score} PTS
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* QUESTION BOARDS GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-['Rajdhani'] font-black text-lg sm:text-xl uppercase tracking-wider text-slate-100">
              Daftar Papan Soal Gambar ({questions.length} Papan)
            </h2>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            *Klik papan bidang soal untuk membuka kuis
          </div>
        </div>

        {/* The Grid of Secret Image Boards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {questions.map((q) => (
            <QuestionBoardCard
              key={q.id}
              question={q}
              teams={activeTeams}
              onSelect={onSelectQuestion}
              imageUrl={imageUrl}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 text-center text-xs text-slate-500">
        Class of Champions Arena • Klik papan bergambar untuk memulai tantangan!
      </footer>
    </div>
  );
};
