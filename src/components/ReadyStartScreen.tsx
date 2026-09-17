import React from 'react';
import { Team, Question } from '../types';
import { sound } from '../utils/sound';
import {
  Play,
  Settings,
  Sparkles,
  Maximize2,
  Minimize2,
  Users,
  Grid,
  Bot,
  Lock,
} from 'lucide-react';

interface ReadyStartScreenProps {
  questions: Question[];
  teams: Team[];
  activeTeamCount: number;
  defaultTimerSeconds: number;
  onStartGame: () => void;
  onOpenQuestionManager: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  imageUrl?: string;
  onOpenResetModal?: () => void;
}

export const ReadyStartScreen: React.FC<ReadyStartScreenProps> = ({
  questions,
  teams,
  activeTeamCount,
  defaultTimerSeconds,
  onStartGame,
  onOpenQuestionManager,
  onOpenSettings,
  isFullscreen,
  onToggleFullscreen,
  imageUrl = '/coc_champion.jpg',
  onOpenResetModal,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950 overflow-x-hidden text-slate-100">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-cyan-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-amber-500/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 font-['Cinzel'] text-lg shadow-lg">
            COC
          </div>
          <div>
            <h1 className="font-['Cinzel'] font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              CLASS OF CHAMPIONS
            </h1>
            <p className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
              Arena Cerdas Cermat & Kuis Interaktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuestionManager}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/40 backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            title="Kelola & Buat Soal (AI & Manual Bebas)"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Kelola & Buat Soal</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all"
            title="Pengaturan Game & Tim"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 backdrop-blur-md transition-all"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Showcase: Uploaded Image and Action */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center my-auto py-4 z-10 space-y-6">
        {/* The Uploaded Image Showcase Container */}
        <div className="relative w-full max-w-xl group">
          {/* Glowing Esports Border & Frame */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500 opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-slate-950 shadow-2xl">
            <img
              src={imageUrl}
              alt="Class of Champions Battle for Glory"
              className="w-full h-auto object-cover max-h-[460px] transform group-hover:scale-102 transition-transform duration-700"
            />
            {/* Gradient shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

            {/* Overlay Badges */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs backdrop-blur-md bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-1.5 font-mono text-cyan-300">
                <Grid className="w-3.5 h-3.5 text-cyan-400" />
                <span>{questions.length} Papan Bidang Soal</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-amber-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeTeamCount} Tim Bertanding</span>
              </div>
              <div className="font-mono text-slate-300 hidden sm:block">
                Timer: {defaultTimerSeconds}s
              </div>
            </div>
          </div>
        </div>

        {/* Participating Teams Preview Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl px-2">
          {teams.slice(0, activeTeamCount).map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border text-xs font-semibold shadow"
              style={{ borderColor: `${team.color}60`, color: team.color }}
            >
              <span>{team.avatar}</span>
              <span>{team.name}</span>
            </div>
          ))}
        </div>

        {/* "MULAI PERMAINAN" Prominent Button */}
        <div className="w-full flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sound.playCorrect();
              onStartGame();
            }}
            className="relative group px-10 sm:px-16 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:via-amber-300 hover:to-amber-500 text-slate-950 font-['Rajdhani'] font-black text-xl sm:text-2xl uppercase tracking-widest border-2 border-amber-200 shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-98 flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950 text-slate-950 animate-pulse" />
            <span>Mulai Permainan</span>
            <Sparkles className="w-5 h-5 text-slate-950" />
          </button>

          <p className="text-xs text-slate-400 text-center max-w-md">
            Klik tombol di atas untuk masuk ke arena papan soal. Setiap tim akan memilih papan bergambar untuk membuka pertanyaan rahasia.
          </p>
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full text-center text-[11px] text-slate-500 py-2 z-10">
        Class of Champions (COC) Educational Game Platform • Powered by Google Gemini AI
      </footer>
    </div>
  );
};
