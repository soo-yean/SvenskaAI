export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  QUIZ = 'QUIZ',
  TRANSLATE = 'TRANSLATE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAudioPlaying?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  isFinished: boolean;
  isLoading: boolean;
  selectedAnswer: number | null;
}

export interface DailyWord {
  swedish: string;
  english: string;
  exampleSentence: string;
}

export enum TtsVoice {
  Kore = 'Kore',
  Puck = 'Puck',
  Fenrir = 'Fenrir',
  Charon = 'Charon',
  Zephyr = 'Zephyr'
}