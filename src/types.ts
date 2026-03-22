export interface Word {
  id: string;
  word: string;
  ipa?: string;
  image?: string;
  definition: string;
  vietnameseDefinition: string;
  collocations: string[];
  example: string;
  vietnameseExample: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  band: number; // 0 to 7
  topicId?: string; // Optional topic association
}

export interface QuizQuestion {
  id: string;
  type: 'definition' | 'collocation' | 'example' | 'matching' | 'fill_in_blank' | 'audio' | 'image_selection' | 'typing' | 'sentence_building' | 'speaking';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  wordId: string;
  // For matching pairs
  pairs?: { en: string; vi: string }[];
  // For sentence building
  scrambledWords?: string[];
}

export interface DailyTask {
  id: string;
  type: 'vocabulary' | 'grammar' | 'review';
  targetId: string;
  isDone: boolean;
  title: string;
  description: string;
}

export interface DailyPlan {
  date: string;
  tasks: DailyTask[];
  isCompleted: boolean;
}

export interface UserStats {
  xp: number;
  streak: number;
  lastActive: string;
  unlockedBands: number[];
  unlockedTopics: string[];
  completedWords: string[];
  completedTopics?: string[];
  completedGrammar?: string[];
  completedMicroSkills?: string[];
  // SRS fields
  wordProgress?: Record<string, { srsLevel: number; nextReview: string }>;
  wordsToReview?: string[];
  // Daily Plan
  dailyPlan?: DailyPlan;
}

export interface MicroSkill {
  id: string;
  type: 'reading' | 'listening';
  title: string;
  passage?: string; // For reading
  audioText?: string; // For listening (TTS)
  question: string;
  options?: string[]; // For multiple choice (TFNG)
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  userAnswers: string[];
  isFinished: boolean;
  band: number;
  topicId: string;
}
