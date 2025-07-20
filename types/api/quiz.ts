export interface QuizQuestion {
  id: string;
  created_at: string;
  description: string;
  is_required: boolean;
  options: string[] | null;
  order: number;
  question_text: string;
  question_type: 'NUMBER' | 'TEXT' | 'MULTIPLE_CHOICE' | 'SCALE' | 'BOOLEAN';
  quiz_id: string;
  updated_at: string;
  validation_rule: {
    max?: number;
    min?: number;
    step?: number;
    maxLength?: number;
    pattern?: string;
  } | number | {};
}

export interface ProfileQuiz {
  id: string;
  description: string;
  title: string;
  is_active: boolean;
  questions: QuizQuestion[];
  updated_at: string;
  created_at: string;
}

export interface GetProfileQuizzesResponse {
  getProfileQuizzes: ProfileQuiz[];
}

export interface QuizResponse {
  answer: any;
  attempt_id: string;
  created_at: string;
  id: string;
  order: number;
  question_id: string;
  updated_at: string;
}

export interface QuizAttempt {
  completed_at: string | null;
  created_at: string;
  id: string;
  member_profile_id: string;
  quiz_id: string;
  responses: QuizResponse[];
  started_at: string;
  status: string;
  updated_at: string;
  user_id: string;
}

export interface GetQuizAttemptResponse {
  getQuizAttemptOnCurrentUser: QuizAttempt | null;
}

export interface AIReasoning {
  considerations: string[];
  matchingFactors: string[];
  risks: string[];
  suggestions: string[];
}

export interface AIRecommendation {
  alternativeTemplates: string[];
  confidence: number;
  reasoning: AIReasoning;
  recommendedTemplate: string;
}

export interface GetAIRecommendationResponse {
  getAIRecommendation: AIRecommendation;
} 