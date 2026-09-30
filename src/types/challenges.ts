export type ChallengeCategory = 'gases' | 'estequiometria' | 'balanceo';

export type ChallengeDifficulty = 'facil' | 'medio' | 'avanzado';

export type ChallengeType = 'numeric' | 'coefficients' | 'multiple_choice';

export interface BaseChallenge {
  id: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  type: ChallengeType;
  title: string;
  question: string;
  chemicalEquation?: string;
  hint: string;
  explanation: string;
  formula?: string;
  points: number;
}

export interface NumericChallenge extends BaseChallenge {
  type: 'numeric';
  targetValue: number;
  tolerance: number; // absolute tolerance or fractional
  toleranceType?: 'absolute' | 'percentage';
  unit: string;
  placeholder?: string;
}

export interface BalancingSubstance {
  formula: string;
  name?: string;
}

export interface BalancingChallenge extends BaseChallenge {
  type: 'coefficients';
  reactants: BalancingSubstance[];
  products: BalancingSubstance[];
  correctCoefficients: {
    reactants: number[];
    products: number[];
  };
}

export interface MultipleChoiceChallenge extends BaseChallenge {
  type: 'multiple_choice';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export type Challenge = NumericChallenge | BalancingChallenge | MultipleChoiceChallenge;

export interface ChallengeStats {
  totalAttempted: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  totalXpEarned: number;
  byCategory: Record<ChallengeCategory, { correct: number; total: number }>;
}

export type GameMode = 'practice' | 'survival';
