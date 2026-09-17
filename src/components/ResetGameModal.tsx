import React from 'react';
import { sound } from '../utils/sound';
import {
  RotateCcw,
  AlertTriangle,
  X,
  Trophy,
  Layers,
  Home,
  CheckCircle2,
} from 'lucide-react';

interface ResetGameModalProps {
  onClose: () => void;
  onResetAll: () => void;
  onResetBoardsOnly: () => void;
  onResetScoresOnly: () => void;
  onBackToStartScreen: () => void;
}

export const ResetGameModal: React.FC<ResetGameModalProps> = ({
  onClose,
  onResetAll,
  onResetBoardsOnly,
  onResetScoresOnly,
  onBackToStartScreen,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Menu Reset Permainan</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ulangi permainan jika terjadi kesalahan teknis atau ingin bertanding kembali.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-amber-200 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-semibold mb-0.5">
                Konfirmasi Pengulangan Pertandingan
              </strong>
              Pilih tindakan reset di bawah ini sesuai kebutuhan Anda.
            </div>
          </div>

          <div className="space-y-2.5">
            {/* 1. RESET TOTAL */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Yakin ingin mereset TOTAL permainan? Skor semua tim akan kembali 0 dan semua papan terbuka kembali.')) {
                  sound.playClick();
                  onResetAll();
                  onClose();
                }
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 to-rose-900/60 hover:from-rose-900 hover:to-rose-800 border-2 border-rose-500/60 text-left transition-all flex items-center justify-between group cursor-pointer shadow-lg active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">
                    Reset Total Permainan (Mulai dari Awal)
                  </h4>
                  <p className="text-xs text-rose-200/80">
                    Buka kembali seluruh papan soal dan reset skor seluruh tim menjadi 0.
                  </p>
                </div>
              </div>
            </button>

            {/* 2. RESET PAPAN SAJA */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Buka kembali semua papan soal yang telah tertutup? Skor tim tetap disimpan.')) {
                  sound.playClick();
                  onResetBoardsOnly();
                  onClose();
                }
              }}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Reset Papan Soal Saja
                  </h4>
                  <p className="text-xs text-slate-400">
                    Buka kembali semua papan tanpa menghapus skor tim yang sudah terkumpul.
                  </p>
                </div>
              </div>
            </button>

            {/* 3. RESET SKOR TIM SAJA */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan skor semua tim menjadi 0? Status papan yang terbuka tetap sama.')) {
                  sound.playClick();
                  onResetScoresOnly();
                  onClose();
                }
              }}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Reset Skor Tim Saja
                  </h4>
                  <p className="text-xs text-slate-400">
                    Kosongkan seluruh skor tim menjadi 0 poin.
                  </p>
                </div>
              </div>
            </button>

            {/* 4. KELUAR KE LAYAR PEMBUKA */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onBackToStartScreen();
                onClose();
              }}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition-all flex items-center justify-between group cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Kembali ke Layar Pembuka (Beranda)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tinggalkan arena dan kembali ke tampilan tombol Mulai Permainan.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
          >
            Batal & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
