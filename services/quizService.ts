import client from '@/libs/apollo-client';
import { GET_PROFILE_QUIZZES } from '@/graphql/query/getProfileQuizzes';
import { GET_QUIZ_ATTEMPT } from '@/graphql/query/getQuizAttempt';
import { GET_AI_RECOMMENDATION } from '@/graphql/query/getAIRecommendation';
import { GET_MY_TEMPLATE_MATCHING_RESULTS } from '@/graphql/query/getMyTemplateMatchingResults';
import { GET_TEMPLATE_MATCHING_RESULT_DETAILS } from '@/graphql/query/getTemplateMatchingResultDetails';
import { START_QUIZ, StartQuizInput, StartQuizResponse } from '@/graphql/mutation/startQuiz';
import { SUBMIT_QUIZ, QuizResponseInput, SubmitQuizInput, SubmitQuizResponse } from '@/graphql/mutation/submitQuizAnswers';
import { 
  GetProfileQuizzesResponse, 
  ProfileQuiz, 
  GetQuizAttemptResponse, 
  QuizAttempt,
  GetAIRecommendationResponse,
  AIRecommendation,
  TemplateMatchingResult
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

  static async getMyTemplateMatchingResults(): Promise<TemplateMatchingResult[]> {
    try {
      const { data } = await client.query<{ getMyTemplateMatchingResults: TemplateMatchingResult[] }>({
        query: GET_MY_TEMPLATE_MATCHING_RESULTS,
        fetchPolicy: 'network-only',
      });
      
      return data.getMyTemplateMatchingResults;
    } catch (error) {
      console.error('Error fetching template matching results:', error);
      throw error;
    }
  }

  static async getTemplateMatchingResultDetails(id: string): Promise<TemplateMatchingResult> {
    try {
      const { data } = await client.query<{ getTemplateMatchingResultDetails: TemplateMatchingResult }>({
        query: GET_TEMPLATE_MATCHING_RESULT_DETAILS,
        variables: { getTemplateMatchingResultDetailsId: id },
        fetchPolicy: 'network-only',
      });
      return data.getTemplateMatchingResultDetails;
    } catch (error) {
      console.error('Error fetching template matching result details:', error);
      throw error;
    }
  }
} 