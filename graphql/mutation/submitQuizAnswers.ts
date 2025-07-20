import { gql } from '@apollo/client';

export const SUBMIT_QUIZ = gql`
  mutation SubmitQuiz($input: SubmitQuizInput!) {
    submitQuiz(input: $input) {
      attempt_id
      member_profile_updated
      message
      responses {
        answer
        attempt_id
        created_at
        id
        question_id
        updated_at
        order
      }
    }
  }
`;

export interface QuizResponseInput {
  question_id: string;
  answer: string | number | string[] | boolean;
}

export interface SubmitQuizInput {
  attempt_id: string;
  responses: QuizResponseInput[];
}

export interface SubmitQuizResponse {
  submitQuiz: {
    attempt_id: string;
    member_profile_updated: boolean;
    message: string;
    responses: {
      answer: any;
      attempt_id: string;
      created_at: string;
      id: string;
      question_id: string;
      updated_at: string;
      order: number;
    }[];
  };
} 