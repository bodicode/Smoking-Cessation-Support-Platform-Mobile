import { gql } from "@apollo/client";
import client from "@/libs/apollo-client";
import { NotificationListResponse } from "@/types/api/notification";

const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($params: PaginationParamsInput!, $filters: NotificationFiltersInput) {
    userNotifications(params: $params, filters: $filters) {
      data {
        id
        title
        content
        status
        created_at
      }
      total
      page
      limit
    }
  }
`;

const MARK_MULTIPLE_NOTIFICATIONS_AS_READ = gql`
  mutation MarkMultipleNotificationsAsRead($ids: [ID!]!) {
    markMultipleNotificationsAsRead(ids: $ids)
  }
`;

export const notificationService = {
  async getUserNotifications(params: any, filters?: any): Promise<NotificationListResponse> {
    const { data } = await client.query({
      query: GET_USER_NOTIFICATIONS,
      variables: { params, filters },
      fetchPolicy: "network-only",
    });
    return data.userNotifications;
  },

  async markMultipleAsRead(ids: string[]): Promise<boolean> {
    const { data } = await client.mutate({
      mutation: MARK_MULTIPLE_NOTIFICATIONS_AS_READ,
      variables: { ids },
    });
    return data.markMultipleNotificationsAsRead;
  },
}; 