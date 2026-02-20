export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AnswerOption {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  question_text: string;
  explanation: string | null;
  answers: AnswerOption[];
}

export interface Quiz {
  id: number;
  title: string;
  source_type: 'manual' | 'ai_generated';
  question_count: number;
  created_at: string;
}

export interface QuizDetail {
  id: number;
  title: string;
  source_type: string;
  image_filename: string | null;
  created_at: string;
  questions: Question[];
}

export interface AttemptResponse {
  id: number;
  quiz_id: number;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

export interface StatsResponse {
  total_quizzes_created: number;
  total_quizzes_taken: number;
  average_score: number;
  best_score: number;
  recent_attempts: AttemptResponse[];
}

export interface AnswerCreate {
  answer_text: string;
  is_correct: boolean;
}

export interface QuestionCreate {
  question_text: string;
  explanation?: string;
  answers: AnswerCreate[];
}

export interface QuizCreate {
  title: string;
  questions: QuestionCreate[];
}
