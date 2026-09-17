import React, { useState } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import {
  Settings,
  Users,
  Timer,
  Lock,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Check,
  Award,
} from 'lucide-react';

interface GameSettingsModalProps {
  teams: Team[];
  activeTeamCount: number;
  onUpdateTeams: (newTeams: Team[], count: number) => void;
  defaultTimer: number;
  onUpdateTimer: (sec: number) => void;
  adminPassword: string;
  onUpdatePassword: (newPass: string) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onResetScores: () => void;
  onResetAllBoards: () => void;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  teams,
  activeTeamCount,
  onUpdateTeams,
  defaultTimer,
  onUpdateTimer,
  adminPassword,
  onUpdatePassword,
  soundEnabled,
  onToggleSound,
  onResetScores,
  onResetAllBoards,
  onClose,
}) => {
  const [teamCount, setTeamCount] = useState<number>(activeTeamCount);
  const [localTeams, setLocalTeams] = useState<Team[]>(teams);
  const [timerVal, setTimerVal] = useState<number>(defaultTimer);
  const [newPassword, setNewPassword] = useState<string>(adminPassword);
  const [passSaved, setPassSaved] = useState<boolean>(false);

  const handleSaveAll = () => {
    sound.playClick();
    onUpdateTeams(localTeams, teamCount);
    onUpdateTimer(timerVal);
    if (newPassword.trim()) {
      onUpdatePassword(newPassword.trim());
    }
    onClose();
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    const updated = [...localTeams];
    updated[index] = { ...updated[index], name: newName };
    setLocalTeams(updated);
  };

  const handleTeamAvatarChange = (index: number, newAvatar: string) => {
    const updated = [...localTeams];
    updated[index] = { ...updated[index], avatar: newAvatar };
    setLocalTeams(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-cyan-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg">
                Pengaturan Permainan & Admin COC
              </h2>
              <p className="text-xs text-slate-400">
                Atur jumlah tim (maks. 10 tim), durasi waktu timer, dan keamanan password.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. JUMLAH TIM: MAKSIMAL 10 TIM */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jumlah Tim dalam Permainan (Maksimal 10 Tim):
              </label>
              <span className="font-mono text-cyan-300 font-bold text-sm bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                {teamCount} Tim Aktif
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTeamCount(num);
                  }}
                  className={`flex-1 min-w-[50px] py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    teamCount === num
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 border-amber-300 text-slate-950 shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {num} Tim
                </button>
              ))}
            </div>

            {/* Team Names and Avatars Customization */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Nama dan Ikon {teamCount} Tim yang Berkompetisi:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {localTeams.slice(0, teamCount).map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-850 border border-slate-700"
                  >
                    <span className="text-xs font-mono font-bold text-amber-400 w-6">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      maxLength={2}
                      value={t.avatar}
                      onChange={(e) => handleTeamAvatarChange(idx, e.target.value)}
                      title="Ubah Emoji Avatar"
                      className="w-9 h-9 text-center rounded-lg bg-slate-800 border border-slate-600 text-base"
                    />
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                      placeholder={`Nama Tim ${idx + 1}`}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-medium"
                    />
                    <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      {t.score} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. TIMER SETTING: Bebas atur durasi dalam menit & detik */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Durasi Waktu Menjawab Default:
              </label>
              <div className="font-mono text-cyan-300 font-bold text-xs sm:text-sm bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40 flex items-center gap-2">
                <span>
                  {Math.floor(timerVal / 60)} Menit {timerVal % 60} Detik
                </span>
                <span className="text-slate-400 text-xs font-normal">({timerVal}s)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400">Pilihan Cepat:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '15 Detik', sec: 15 },
                  { label: '30 Detik', sec: 30 },
                  { label: '45 Detik', sec: 45 },
                  { label: '1 Menit', sec: 60 },
                  { label: '2 Menit', sec: 120 },
                  { label: '3 Menit', sec: 180 },
                  { label: '5 Menit', sec: 300 },
                  { label: '10 Menit', sec: 600 },
                ].map((preset) => (
                  <button
                    key={preset.sec}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setTimerVal(preset.sec);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      timerVal === preset.sec
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Free custom input in Minutes and Seconds */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold">Atur Bebas (Menit & Detik):</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-850 px-2.5 py-1.5 rounded-xl border border-slate-700">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={Math.floor(timerVal / 60)}
                    onChange={(e) => {
                      const mins = Math.max(0, Number(e.target.value) || 0);
                      const secs = timerVal % 60;
                      setTimerVal(Math.max(5, mins * 60 + secs));
                    }}
                    className="w-14 px-1 py-0.5 rounded bg-slate-800 border border-slate-600 text-white text-sm font-mono text-center focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-300 font-medium">Menit</span>
                </div>

                <span className="text-slate-500 font-bold">+</span>

                <div className="flex items-center gap-1 bg-slate-850 px-2.5 py-1.5 rounded-xl border border-slate-700">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={timerVal % 60}
                    onChange={(e) => {
                      const mins = Math.floor(timerVal / 60);
                      const secs = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                      setTimerVal(Math.max(5, mins * 60 + secs));
                    }}
                    className="w-14 px-1 py-0.5 rounded bg-slate-800 border border-slate-600 text-white text-sm font-mono text-center focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-300 font-medium">Detik</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                *Admin bebas mengatur waktu sampai berapa menit pun sesuai jalannya game.
              </span>
            </div>
          </div>

          {/* 3. PASSWORD KEAMANAN BANK SOAL */}
          <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password Akses Kelola Soal:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => {
                  setPassSaved(false);
                  setNewPassword(e.target.value);
                }}
                placeholder="Masukkan password admin baru..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onUpdatePassword(newPassword.trim());
                  setPassSaved(true);
                  setTimeout(() => setPassSaved(false), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1"
              >
                {passSaved ? <Check className="w-4 h-4" /> : null}
                <span>{passSaved ? 'Tersimpan' : 'Update Password'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              *Hanya orang yang mengetahui password ini yang dapat membuka menu manajemen soal dan AI.
            </p>
          </div>

          {/* 4. SUARA & RESET */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => onToggleSound(!soundEnabled)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Efek Suara: AKTIF</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Efek Suara: NONAKTIF</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin mereset skor semua tim menjadi 0?')) {
                    sound.playClick();
                    onResetScores();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Skor Tim</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Yakin ingin membuka kembali semua papan soal yang telah terjawab?')) {
                    sound.playClick();
                    onResetAllBoards();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Papan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 text-slate-950 font-black text-sm border border-cyan-300 shadow-lg cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
