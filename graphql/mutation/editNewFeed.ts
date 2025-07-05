import { gql } from "@apollo/client";

export const EDIT_MY_SHARED_POST = gql`
  mutation EditMySharedPost($postId: ID!, $input: UpdateSharedPostInput!) {
    updateSharedPost(id: $postId, input: $input) {
      id
      caption
      updated_at
      user_badge {
        user {
          id
          name
          avatar_url
        }
        badge {
          id
          name
          icon_url
        }
      }
      likes_count
      comments_count
    }
  }
`;
