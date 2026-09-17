import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface AdminAuthModalProps {
  correctPassword: string;
  onSuccess: () => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  correctPassword,
  onSuccess,
  onClose,
  title = 'Akses Terbatas: Kelola Soal',
  description = 'Hanya pembuat kuis / guru / admin yang berwenang mengakses bank soal ini.',
}) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      sound.playCorrect();
      onSuccess();
    } else {
      sound.playWrong();
      setError(true);
      setPasswordInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Masukkan Password Akses:
            </label>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => {
                setError(false);
                setPasswordInput(e.target.value);
              }}
              placeholder="Ketik password admin..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-center tracking-widest text-lg focus:border-amber-400 focus:outline-none"
            />
            <div className="text-[11px] text-slate-500 text-center">
              (Password bawaan: <span className="font-mono text-amber-300">1234</span>, dapat diubah di Pengaturan)
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Password salah! Hanya pembuat soal yang dapat mengakses.</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-750"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm border border-amber-300 shadow-lg cursor-pointer"
            >
              Buka Akses Soal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
