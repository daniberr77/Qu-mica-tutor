export interface Subtopic {
  id: string;
  title: string;
  summary: string;
  content: string; // rich markdown / html formatted text
  keyPoints: string[];
  formulas?: string[];
  examples?: {
    problem: string;
    solution: string;
    explanation: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface ModuleData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
  subtopics: Subtopic[];
  quiz: QuizQuestion[];
  flashcardIds: string[];
}

export interface Flashcard {
  id: string;
  moduleId: number;
  front: string;
  back: string;
  category: string;
  formula?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  relatedModuleId?: number;
  calculationDetails?: {
    title: string;
    steps: string[];
    result: string;
  };
}

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: 'alkali' | 'alkaline' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';
  group: number;
  period: number;
  electronConfiguration: string;
  electronegativity?: number;
  summary: string;
  discoveredBy?: string;
}

export type StudyLevel = 'Secundaria' | 'Preuniversitario' | 'Universidad';
export type TutorModeType = 'didactic' | 'stepbystep' | 'quiz';
export type ChatExportFormat = 'markdown' | 'json' | 'text';

export interface QuizAttempt {
  moduleId: number;
  score: number;
  total: number;
  percentage: number;
  timestamp: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  level: StudyLevel;
  avatar: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedModules: number[];
  completedSubtopics: string[];
  quizScores: Record<string, QuizAttempt>;
  masteredFlashcards: string[];
  favoriteElements: number[];
  notes: Record<string, string>;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: TutorModeType;
  messages: ChatMessage[];
  pinned?: boolean;
  tags?: string[];
  summary?: string;
}

