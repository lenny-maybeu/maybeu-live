export type UserRole = 'HOST' | 'GUEST' | 'SCREEN';
export type Language = 'ru' | 'en';
export type GameType = 'quiz' | 'believe_not' | 'voting';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface LiveEvent {
  id: string;
  title: string;
  isActive: boolean;
  currentStage: 'waiting' | 'quiz' | 'voting' | 'results';
  gameType: GameType; // Мы добавили это поле
  questions?: QuizQuestion[];
  scores?: Record<string, number>;
  code?: string;
}