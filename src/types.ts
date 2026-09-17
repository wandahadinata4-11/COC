export type QuestionType = 'multiple_choice' | 'short_answer' | 'matching' | 'true_false';

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sukar' | 'Campuran';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  number: number;
  question: string;
  category?: string; // Bidang Soal / Mata Pelajaran (contoh: Matematika, Fisika, Biologi, Sejarah, Geografi)
  type: QuestionType;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  points: number;
  timeLimit: number; // in seconds
  options?: string[]; // for multiple_choice & true_false
  correctAnswer?: string; // string or choice
  acceptedAnswers?: string[]; // for short_answer
  pairs?: MatchingPair[]; // for matching
  explanation?: string;
  isAnswered?: boolean;
  answeredByTeamId?: string | null;
  isCorrect?: boolean;
}

export interface QuestionPackage {
  id: string;
  name: string;
  topic: string;
  date: string;
  count: number;
  source: 'ai' | 'manual' | 'preset';
  questions: Question[];
}

export interface Team {
  id: string;
  number: number;
  name: string;
  color: string;
  badgeBg: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  avatar: string;
}

export type GameStage = 
  | 'ready'            // Starting splash screen with uploaded image & "Mulai Permainan" button
  | 'arena'            // Main game board arena with secret image question cards
  | 'question_modal'   // Active secret question opened
  | 'question_manager' // Admin question creator & editor with Gemini AI
  | 'settings'         // Team count, timer, points & password settings
  | 'podium';          // Winner announcement podium

export interface GameConfig {
  adminPassword: string;
  defaultTimerSeconds: number;
  teamCount: number;
  soundEnabled: boolean;
  topic: string;
}
