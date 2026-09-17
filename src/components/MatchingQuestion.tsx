import React, { useState, useEffect } from 'react';
import { MatchingPair } from '../types';
import { sound } from '../utils/sound';
import { CheckCircle2, RotateCcw, Link2, Sparkles } from 'lucide-react';

interface MatchingQuestionProps {
  pairs: MatchingPair[];
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const PAIR_COLORS = [
  'bg-emerald-500/20 border-emerald-500 text-emerald-300',
  'bg-cyan-500/20 border-cyan-500 text-cyan-300',
  'bg-amber-500/20 border-amber-500 text-amber-300',
  'bg-purple-500/20 border-purple-500 text-purple-300',
  'bg-rose-500/20 border-rose-500 text-rose-300',
];

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  pairs,
  onComplete,
  disabled = false,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  // matches maps left string -> right string
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Shuffle right side on mount
  useEffect(() => {
    const rights = pairs.map((p) => p.right);
    // Fisher-Yates shuffle
    const shuffled = [...rights];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledRights(shuffled);
    setMatches({});
    setSelectedLeft(null);
    setSubmitted(false);
  }, [pairs]);

  const handleSelectLeft = (leftItem: string) => {
    if (disabled || submitted) return;
    sound.playClick();
    if (selectedLeft === leftItem) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftItem);
    }
  };

  const handleSelectRight = (rightItem: string) => {
    if (disabled || submitted) return;
    if (!selectedLeft) {
      sound.playWrong();
      return;
    }
    sound.playClick();

    // If another left already matched this right, unpair it
    const newMatches = { ...matches };
    for (const l in newMatches) {
      if (newMatches[l] === rightItem) {
        delete newMatches[l];
      }
    }

    newMatches[selectedLeft] = rightItem;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleResetPairs = () => {
    if (disabled || submitted) return;
    sound.playClick();
    setMatches({});
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    if (disabled || submitted) return;
    setSubmitted(true);

    // Check correctness: every pair left must match its original right
    let correctCount = 0;
    pairs.forEach((p) => {
      if (matches[p.left] === p.right) {
        correctCount++;
      }
    });

    const isAllCorrect = correctCount === pairs.length;
    onComplete(isAllCorrect);
  };

  const getMatchIndexForLeft = (leftItem: string) => {
    const idx = pairs.findIndex((p) => p.left === leftItem);
    return idx >= 0 ? idx % PAIR_COLORS.length : 0;
  };

  const getMatchColorForRight = (rightItem: string) => {
    for (const l in matches) {
      if (matches[l] === rightItem) {
        return PAIR_COLORS[getMatchIndexForLeft(l)];
      }
    }
    return null;
  };

  const allMatched = pairs.length > 0 && Object.keys(matches).length === pairs.length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-300/90 font-medium bg-slate-900/60 p-2.5 rounded-xl border border-cyan-500/20">
        <span className="flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-cyan-400" />
          Klik item kolom kiri (Kategori), lalu klik pasangannya di kolom kanan!
        </span>
        <button
          type="button"
          disabled={disabled || submitted || Object.keys(matches).length === 0}
          onClick={handleResetPairs}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 disabled:opacity-40"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Pasangan
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-2.5">
          <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold px-1">
            Kolom Kiri (Pernyataan / Istilah)
          </h4>
          {pairs.map((p, idx) => {
            const isSelected = selectedLeft === p.left;
            const isMatched = Boolean(matches[p.left]);
            const pairColor = PAIR_COLORS[idx % PAIR_COLORS.length];

            return (
              <button
                key={p.left}
                type="button"
                disabled={disabled || submitted}
                onClick={() => handleSelectLeft(p.left)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between shadow-md active:scale-98 ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 bg-cyan-950/80 border-cyan-400 text-cyan-100 font-semibold scale-[1.02]'
                    : isMatched
                    ? `${pairColor} font-medium`
                    : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900/80 border border-slate-700 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base">{p.left}</span>
                </div>
                {isMatched && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 border border-current font-mono">
                    Tersambung
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5">
          <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold px-1">
            Kolom Kanan (Pasangan Jawaban)
          </h4>
          {shuffledRights.map((rightItem) => {
            const matchedColor = getMatchColorForRight(rightItem);
            const isMatched = Boolean(matchedColor);

            return (
              <button
                key={rightItem}
                type="button"
                disabled={disabled || submitted}
                onClick={() => handleSelectRight(rightItem)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between shadow-md active:scale-98 ${
                  isMatched
                    ? `${matchedColor} font-medium`
                    : selectedLeft
                    ? 'bg-slate-800/95 border-cyan-500/50 hover:bg-cyan-950/60 hover:border-cyan-400 text-slate-200 cursor-pointer animate-pulse'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <span className="text-sm sm:text-base">{rightItem}</span>
                {isMatched && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matching confirmation and submission button */}
      {!submitted && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            disabled={disabled || !allMatched}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base border border-amber-300 shadow-xl shadow-amber-950/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Kunci & Kirim Pasangan Jawaban ({Object.keys(matches).length}/{pairs.length})</span>
          </button>
        </div>
      )}
    </div>
  );
};
