import React, { useState } from 'react';
import { Delete, CornerDownLeft, RotateCcw, ArrowBigUp } from 'lucide-react';
import { sound } from '../utils/sound';

interface VirtualKeyboardProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const [isUppercase, setIsUppercase] = useState(true);

  const handleKeyPress = (char: string) => {
    if (disabled) return;
    sound.playClick();
    const toAdd = isUppercase ? char.toUpperCase() : char.toLowerCase();
    onChange(value + toAdd);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    sound.playClick();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    sound.playClick();
    onChange('');
  };

  const handleSpace = () => {
    if (disabled) return;
    sound.playClick();
    onChange(value + ' ');
  };

  const numbersRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '='];
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.'];

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/95 border border-amber-500/30 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-amber-300/80 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Papan Ketik Virtual COC (Klik / Sentuh Tombol atau Ketik di Keyboard)
        </span>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsUppercase(!isUppercase);
          }}
          className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 text-[11px] ${
            isUppercase
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <ArrowBigUp className="w-3.5 h-3.5" />
          {isUppercase ? 'CAPS: ON' : 'CAPS: OFF'}
        </button>
      </div>

      {/* Row 1: Numbers */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {numbersRow.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[24px] max-w-[48px] h-9 sm:h-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-slate-100 font-mono text-sm sm:text-base font-semibold border border-slate-700 shadow transition-transform active:scale-95 disabled:opacity-40"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Row 2: QWERTY */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {row1.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[26px] max-w-[54px] h-10 sm:h-12 rounded-lg bg-slate-800 hover:bg-cyan-950/70 hover:border-cyan-500/60 active:bg-cyan-600 text-slate-100 font-mono text-sm sm:text-lg font-bold border border-slate-700/80 shadow transition-transform active:scale-95 disabled:opacity-40"
          >
            {isUppercase ? char.toUpperCase() : char.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Row 3: ASDFGHJKL */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5 px-2 sm:px-4">
        {row2.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[26px] max-w-[54px] h-10 sm:h-12 rounded-lg bg-slate-800 hover:bg-cyan-950/70 hover:border-cyan-500/60 active:bg-cyan-600 text-slate-100 font-mono text-sm sm:text-lg font-bold border border-slate-700/80 shadow transition-transform active:scale-95 disabled:opacity-40"
          >
            {isUppercase ? char.toUpperCase() : char.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Row 4: ZXCVBNM */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-2">
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleClear}
          title="Bersihkan Semua"
          className="px-2.5 sm:px-3 h-10 sm:h-12 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-800 text-rose-300 font-medium text-xs border border-rose-500/40 shadow flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {row3.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyPress(char)}
            className="flex-1 min-w-[26px] max-w-[54px] h-10 sm:h-12 rounded-lg bg-slate-800 hover:bg-cyan-950/70 hover:border-cyan-500/60 active:bg-cyan-600 text-slate-100 font-mono text-sm sm:text-lg font-bold border border-slate-700/80 shadow transition-transform active:scale-95 disabled:opacity-40"
          >
            {isUppercase ? char.toUpperCase() : char.toLowerCase()}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={handleBackspace}
          title="Hapus Karakter Terakhir"
          className="px-3 sm:px-4 h-10 sm:h-12 rounded-lg bg-slate-800 hover:bg-amber-950/50 hover:border-amber-500/60 active:bg-amber-700 text-amber-300 font-semibold text-xs sm:text-sm border border-slate-700 shadow flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-30"
        >
          <Delete className="w-4 h-4" />
          <span className="hidden sm:inline">Hapus</span>
        </button>
      </div>

      {/* Row 5: Space and Enter/Kirim */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          disabled={disabled}
          onClick={handleSpace}
          className="flex-1 max-w-lg h-11 sm:h-12 rounded-lg bg-slate-850 hover:bg-slate-750 active:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm tracking-wider uppercase border border-slate-700 shadow flex items-center justify-center transition-transform active:scale-98 disabled:opacity-40"
        >
          Spasi (Spacebar)
        </button>

        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={() => {
            sound.playClick();
            onSubmit();
          }}
          className="px-5 sm:px-8 h-11 sm:h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:from-emerald-700 text-white font-bold text-sm sm:text-base border border-emerald-400/50 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Kirim Jawaban</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
