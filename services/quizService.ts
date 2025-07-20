import client from '@/libs/apollo-client';
import { GET_PROFILE_QUIZZES } from '@/graphql/query/getProfileQuizzes';
import { GET_QUIZ_ATTEMPT } from '@/graphql/query/getQuizAttempt';
import { GET_AI_RECOMMENDATION } from '@/graphql/query/getAIRecommendation';
import { START_QUIZ, StartQuizInput, StartQuizResponse } from '@/graphql/mutation/startQuiz';
import { SUBMIT_QUIZ, QuizResponseInput, SubmitQuizInput, SubmitQuizResponse } from '@/graphql/mutation/submitQuizAnswers';
import { 
  GetProfileQuizzesResponse, 
  ProfileQuiz, 
  GetQuizAttemptResponse, 
  QuizAttempt,
  GetAIRecommendationResponse,
  AIRecommendation
} from '@/types/api/quiz';

export class QuizService {
  static async getProfileQuizzes(): Promise<ProfileQuiz[]> {
    try {
      const { data } = await client.query<GetProfileQuizzesResponse>({
        query: GET_PROFILE_QUIZZES,
        fetchPolicy: 'network-only',
      });
      
      return data.getProfileQuizzes;
    } catch (error) {
      console.error('Error fetching profile quizzes:', error);
      throw error;
    }
  }

  static async getActiveProfileQuiz(): Promise<ProfileQuiz | null> {
    try {
      const quizzes = await this.getProfileQuizzes();
      const activeQuiz = quizzes.find(quiz => quiz.is_active);
      return activeQuiz || null;
    } catch (error) {
      console.error('Error fetching active profile quiz:', error);
      throw error;
    }
  }

  static async startQuiz(quizId: string): Promise<StartQuizResponse['startQuiz']> {
    try {
      const { data } = await client.mutate<StartQuizResponse>({
        mutation: START_QUIZ,
        variables: {
          startQuizInput: {
            quiz_id: quizId,
          },
        },
      });
      
      return data!.startQuiz;
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }

  static async submitQuiz(attemptId: string, responses: QuizResponseInput[]): Promise<SubmitQuizResponse['submitQuiz']> {
    try {
      const { data } = await client.mutate<SubmitQuizResponse>({
        mutation: SUBMIT_QUIZ,
        variables: {
          input: {
            attempt_id: attemptId,
            responses,
          },
        },
      });
      
      return data!.submitQuiz;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  static async getQuizAttempt(): Promise<QuizAttempt | null> {
    try {
      const { data } = await client.query<GetQuizAttemptResponse>({
        query: GET_QUIZ_ATTEMPT,
        fetchPolicy: 'network-only',
      });
      
      return data.getQuizAttemptOnCurrentUser;
    } catch (error) {
      console.error('Error fetching quiz attempt:', error);
      throw error;
    }
  }

  static async getAIRecommendation(): Promise<AIRecommendation> {
    try {
      const { data } = await client.query<GetAIRecommendationResponse>({
        query: GET_AI_RECOMMENDATION,
        fetchPolicy: 'network-only',
      });
      
      return data.getAIRecommendation;
    } catch (error) {
      console.error('Error fetching AI recommendation:', error);
      throw error;
    }
  }
} 