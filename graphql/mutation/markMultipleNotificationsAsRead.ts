import { gql } from "@apollo/client";

export const MARK_MULTIPLE_NOTIFICATIONS_AS_READ = gql`
  mutation MarkMultipleNotificationsAsRead($ids: [ID!]!) {
    markMultipleNotificationsAsRead(ids: $ids)
  }
`; 