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
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  band: number; // 0 to 7
  topicId?: string; // Optional topic association
}

export interface QuizQuestion {
  id: string;
  type: 'definition' | 'collocation' | 'example' | 'matching' | 'fill_in_blank' | 'audio' | 'image_selection' | 'typing' | 'sentence_building';
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

export interface UserStats {
  xp: number;
  streak: number;
  lastActive: string;
  unlockedBands: number[];
  unlockedTopics: string[];
  completedWords: string[];
  completedTopics?: string[];
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
