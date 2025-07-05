import { gql } from "@apollo/client";

export const SHARE_BADGE_MUTATION = gql`
  mutation ShareMyBadge($input: CreateSharedPostInput!) {
    createSharedPost(input: $input) {
      id
      caption
      user_badge {
        id
        user_id
        user {
          name
        }
        badge {
          id
          name
          icon_url
        }
      }
      likes_count
      comments_count
      created_at
    }
  }
`;
