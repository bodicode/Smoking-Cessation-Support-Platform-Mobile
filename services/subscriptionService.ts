import client from '@/libs/apollo-client';
import { GET_USER_SUBSCRIPTION, GetUserSubscriptionResponse, UserSubscription } from '@/graphql/query/getUserSubscription';

export class SubscriptionService {
  static async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const { data } = await client.query<GetUserSubscriptionResponse>({
        query: GET_USER_SUBSCRIPTION,
        fetchPolicy: 'network-only',
      });

      return data.getUserSubscription;
    } catch (error: any) {
      if (error.graphQLErrors?.some((err: any) =>
        err.extensions?.status === 404 ||
        err.message?.includes('Subscription not found')
      )) {
        return null;
      }

      throw error;
    }
  }

  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription();

      if (!subscription) {
        return false;
      }

      // Kiểm tra status và end_date
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      const isActive = subscription.status === 'ACTIVE' && endDate > now;

      return isActive;
    } catch (error) {
      return false;
    }
  }
} 