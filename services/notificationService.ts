import client from "@/libs/apollo-client";
import { NotificationListResponse } from "@/types/api/notification";
import { GET_USER_NOTIFICATIONS } from '@/graphql/query/getUserNotifications';
import { MARK_MULTIPLE_NOTIFICATIONS_AS_READ } from '@/graphql/mutation/markMultipleNotificationsAsRead';

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