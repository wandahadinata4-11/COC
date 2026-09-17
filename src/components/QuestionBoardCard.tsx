import React from 'react';
import { Question, Team } from '../types';
import { Sparkles, CheckCircle, ShieldAlert, Award, BookOpen } from 'lucide-react';

interface QuestionBoardCardProps {
  question: Question;
  teams: Team[];
  onSelect: (question: Question) => void;
  imageUrl?: string;
}

export const QuestionBoardCard: React.FC<QuestionBoardCardProps> = ({
  question,
  teams,
  onSelect,
  imageUrl = '/coc_champion.jpg',
}) => {
  const answeredTeam = question.answeredByTeamId
    ? teams.find((t) => t.id === question.answeredByTeamId)
    : null;

  const difficultyColors = {
    Mudah: 'from-emerald-600 to-teal-700 text-emerald-100 border-emerald-400/60',
    Sedang: 'from-amber-600 to-orange-700 text-amber-100 border-amber-400/60',
    Sukar: 'from-rose-600 to-red-800 text-rose-100 border-rose-400/60',
  };

  const typeLabels = {
    multiple_choice: 'Pilihan Ganda',
    short_answer: 'Isian Singkat',
    matching: 'Menjodohkan',
    true_false: 'Benar / Salah',
  };

  return (
    <div
      onClick={() => {
        if (!question.isAnswered) {
          onSelect(question);
        }
      }}
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 select-none shadow-xl ${
        question.isAnswered
          ? 'border-slate-700/60 bg-slate-950/80 opacity-75 cursor-default'
          : 'border-amber-500/50 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 cursor-pointer bg-slate-900'
      }`}
      style={{ aspectRatio: '1 / 1' }}
    >
      {/* Background Image from Uploaded COC Artwork */}
      <img
        src={imageUrl}
        alt={`Papan Soal #${question.number}`}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
          question.isAnswered
            ? 'grayscale brightness-40'
            : 'group-hover:scale-110 brightness-75 group-hover:brightness-90'
        }`}
        loading="lazy"
      />

      {/* Cinematic dark/gradient vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

      {/* Glow frame effect on hover */}
      {!question.isAnswered && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-cyan-400/70 rounded-2xl shadow-[inset_0_0_20px_rgba(6,182,212,0.4)]" />
      )}

      {/* Top Header: Difficulty & Points */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border shadow-md bg-gradient-to-r ${
            difficultyColors[question.difficulty] || difficultyColors.Sedang
          }`}
        >
          {question.points} PTS
        </span>

        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/80 text-cyan-300 font-mono border border-cyan-500/30 backdrop-blur-sm">
          {typeLabels[question.type] || 'Soal'}
        </span>
      </div>

      {/* Centerpiece: Prominent Board Number Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {!question.isAnswered ? (
          <div className="flex flex-col items-center">
            {/* Number Shield Emblem */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-2xl group-hover:from-cyan-300 group-hover:to-cyan-600 transition-colors">
              <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center backdrop-blur-sm border border-amber-400/30">
                <span className="font-['Cinzel'] font-black text-2xl sm:text-3xl bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent group-hover:from-cyan-100 group-hover:to-cyan-400">
                  {question.number}
                </span>
              </div>
            </div>

            {/* Subject/Field Badge of the Question replacing Papan Rahasia */}
            <div
              className="mt-2 max-w-[92%] flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 border border-amber-500/50 group-hover:border-cyan-400/80 backdrop-blur-md shadow-lg transition-all"
              title={`Bidang Soal: ${question.category || 'Umum'}`}
            >
              <BookOpen className="w-3 h-3 text-amber-400 group-hover:text-cyan-400 shrink-0" />
              <span className="font-extrabold text-[11px] sm:text-xs text-amber-200 group-hover:text-cyan-200 tracking-wide uppercase truncate">
                {question.category || 'Umum'}
              </span>
            </div>
          </div>
        ) : (
          /* Answered / Completed Board State */
          <div className="flex flex-col items-center px-2 text-center w-full max-w-[92%]">
            {answeredTeam ? (
              <div
                className="p-2 sm:p-2.5 rounded-2xl border flex flex-col items-center shadow-lg backdrop-blur-md w-full"
                style={{
                  backgroundColor: `${answeredTeam.color}25`,
                  borderColor: `${answeredTeam.color}80`,
                }}
              >
                <span className="text-xl sm:text-2xl mb-0.5">{answeredTeam.avatar}</span>
                <span className="text-xs font-bold text-white leading-tight truncate max-w-full">
                  {answeredTeam.name}
                </span>
                <span className="text-[10px] text-amber-300/90 font-bold uppercase truncate max-w-full mt-0.5">
                  {question.category || 'Umum'}
                </span>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  +{question.points} PTS
                </div>
              </div>
            ) : (
              <div className="p-2 sm:p-2.5 rounded-2xl border border-slate-700 bg-slate-900/85 text-slate-400 flex flex-col items-center w-full">
                <CheckCircle className="w-5 h-5 text-slate-400 mb-0.5" />
                <span className="text-xs font-semibold">Telah Terbuka</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-full mt-0.5">
                  {question.category || 'Umum'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] text-slate-400 px-1 z-10">
        <span className="font-mono">Waktu: {question.timeLimit}s</span>
        <span className="text-amber-400 font-semibold">{question.difficulty}</span>
      </div>
    </div>
  );
};
