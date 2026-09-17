import React, { useEffect } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Trophy, Medal, Award, Crown, Sparkles, X, RotateCcw } from 'lucide-react';

interface PodiumModalProps {
  teams: Team[];
  onClose: () => void;
  onRestartGame: () => void;
}

export const PodiumModal: React.FC<PodiumModalProps> = ({
  teams,
  onClose,
  onRestartGame,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const first = sortedTeams[0];
  const second = sortedTeams[1];
  const third = sortedTeams[2];

  useEffect(() => {
    sound.playVictory();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-500 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 text-center text-slate-950 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center mb-2">
            <Crown className="w-12 h-12 text-slate-950 animate-bounce" />
          </div>
          <h2 className="font-['Cinzel'] font-black text-2xl sm:text-4xl tracking-wider uppercase drop-shadow-md">
            Grand Champion
          </h2>
          <p className="font-['Rajdhani'] font-bold text-sm sm:text-base tracking-widest uppercase opacity-90">
            Hasil Akhir Turnamen Class of Champions
          </p>
        </div>

        {/* Podium Section */}
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-end justify-center gap-3 sm:gap-4 pt-8">
            {/* Rank 2 (Silver) */}
            {second && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-2 sm:order-1">
                <div className="mb-2 text-center">
                  <span className="text-3xl sm:text-4xl">{second.avatar}</span>
                  <h4 className="font-bold text-slate-200 text-sm sm:text-base mt-1 truncate max-w-[160px]">
                    {second.name}
                  </h4>
                  <div className="text-cyan-400 font-mono font-bold text-base">
                    {second.score} PTS
                  </div>
                </div>
                <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-4 border-slate-400 flex flex-col items-center justify-center p-3 shadow-lg">
                  <Medal className="w-10 h-10 text-slate-300 mb-1" />
                  <span className="text-2xl font-black text-slate-300 font-['Cinzel']">#2</span>
                  <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
                    Runner Up
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold / Champion) */}
            {first && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-1 sm:order-2 -translate-y-2">
                <div className="mb-2 text-center">
                  <div className="relative inline-block">
                    <Crown className="w-8 h-8 text-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-pulse" />
                    <span className="text-4xl sm:text-5xl">{first.avatar}</span>
                  </div>
                  <h4 className="font-extrabold text-amber-300 text-base sm:text-lg mt-1 truncate max-w-[180px]">
                    {first.name}
                  </h4>
                  <div className="text-amber-400 font-mono font-black text-xl sm:text-2xl">
                    {first.score} PTS
                  </div>
                </div>
                <div className="w-full h-40 sm:h-56 bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 rounded-t-2xl border-t-4 border-amber-300 flex flex-col items-center justify-center p-4 shadow-2xl shadow-amber-500/30">
                  <Trophy className="w-14 h-14 text-slate-950 mb-1 drop-shadow" />
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 font-['Cinzel']">
                    #1
                  </span>
                  <span className="text-xs text-slate-950 font-extrabold uppercase tracking-wider">
                    Juara Utama COC
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {third && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-3">
                <div className="mb-2 text-center">
                  <span className="text-3xl sm:text-4xl">{third.avatar}</span>
                  <h4 className="font-bold text-slate-200 text-sm sm:text-base mt-1 truncate max-w-[160px]">
                    {third.name}
                  </h4>
                  <div className="text-amber-600 font-mono font-bold text-base">
                    {third.score} PTS
                  </div>
                </div>
                <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-800 to-amber-950/60 rounded-t-2xl border-t-4 border-amber-700 flex flex-col items-center justify-center p-3 shadow-lg">
                  <Award className="w-8 h-8 text-amber-600 mb-1" />
                  <span className="text-xl font-black text-amber-600 font-['Cinzel']">#3</span>
                  <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider">
                    Juara 3
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4">
            <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider mb-3">
              Klasemen Lengkap Seluruh Tim:
            </h4>
            <div className="space-y-2">
              {sortedTeams.map((team, rank) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                        rank === 0
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : rank === 1
                          ? 'bg-slate-300 text-slate-950 font-bold'
                          : rank === 2
                          ? 'bg-amber-800 text-white'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {rank + 1}
                    </span>
                    <span className="text-lg">{team.avatar}</span>
                    <span className="font-semibold text-white text-sm">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">
                      Benar: <span className="text-emerald-400 font-bold">{team.correctCount}</span>
                    </span>
                    <span className="text-base font-mono font-bold text-cyan-300">
                      {team.score} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-wrap justify-between items-center gap-2">
          <button
            type="button"
            onClick={onRestartGame}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mulai Pertandingan Baru</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm border border-amber-300 shadow-lg cursor-pointer"
          >
            Kembali ke Arena
          </button>
        </div>
      </div>
    </div>
  );
};
