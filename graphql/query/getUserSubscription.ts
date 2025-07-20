import { gql } from '@apollo/client';

export const GET_USER_SUBSCRIPTION = gql`
  query GetUserSubscription {
    getUserSubscription {
      id
      package_id
      status
      user_id
      start_date
      end_date
      created_at
      updated_at
    }
  }
`;

export interface UserSubscription {
  id: string;
  package_id: string;
  status: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface GetUserSubscriptionResponse {
  getUserSubscription: UserSubscription | null;
} 