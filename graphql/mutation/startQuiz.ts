import { gql } from '@apollo/client';

export const START_QUIZ = gql`
  mutation StartQuiz($startQuizInput: StartQuizInput!) {
    startQuiz(input: $startQuizInput) {
      id
      member_profile_id
      quiz_id
      created_at
      completed_at
      responses {
        answer
        attempt_id
        created_at
        id
        question_id
        updated_at
      }
      started_at
      status
      updated_at
      user_id
    }
  }
`;

export interface StartQuizInput {
  quiz_id: string;
}

export interface QuizResponse {
  answer: any;
  attempt_id: string;
  created_at: string;
  id: string;
  question_id: string;
  updated_at: string;
}

export interface StartQuizResponse {
  startQuiz: {
    id: string;
    member_profile_id: string;
    quiz_id: string;
    created_at: string;
    completed_at: string | null;
    responses: QuizResponse[];
    started_at: string;
    status: string;
    updated_at: string;
    user_id: string;
  };
} 