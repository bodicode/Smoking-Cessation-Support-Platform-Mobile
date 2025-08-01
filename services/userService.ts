import apolloClient from '@/libs/apollo-client';
import { GET_USER_BY_ID } from '@/graphql/query/getUserById';
import { User } from '@/types/api/user';
import { GET_STREAK_LEADERBOARD } from '@/graphql/query/getStreakLeaderboard';
import { GET_USER_SUBSCRIPTION } from '@/graphql/query/getUserSubscription'; // add import
import type { GetUserSubscriptionResponse } from '@/graphql/query/getUserSubscription'; // add import

export class UserService {
  static async getStreakLeaderboard(limit = 10, offset = 0) {
    const { data } = await apolloClient.query({
      query: GET_STREAK_LEADERBOARD,
      variables: { limit, offset },
      fetchPolicy: 'network-only',
    });
    return data.streakLeaderboard;
  }

  static async getUserById(userId: string): Promise<User> {
    try {

      const { data } = await apolloClient.query({
        query: GET_USER_BY_ID,
        variables: { userId },
        fetchPolicy: 'network-only',
      });

      const userData = data.findUserById;

      if (userData.coach_profile && !Array.isArray(userData.coach_profile)) {
        userData.coach_profile = [userData.coach_profile];
      }
      if (userData.member_profile && !Array.isArray(userData.member_profile)) {
        userData.member_profile = [userData.member_profile];
      }

      return userData;
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      console.error('Error details:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo
      });
      throw error;
    }
  }

  static async getUserSubscription(): Promise<GetUserSubscriptionResponse['getUserSubscription']> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USER_SUBSCRIPTION,
        fetchPolicy: 'network-only',
      });
      // If subscription is null, just return null (don't throw)
      return data.getUserSubscription;
    } catch (error: any) {
      // Only log and return null if error is "Subscription not found"
      if (error.message && error.message.includes("Subscription not found")) {
        console.warn('No active subscription found.');
        return null;
      }
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }
}