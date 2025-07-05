import { gql } from "@apollo/client";

export const REMOVE_SHARED_POST_MUTATION = gql`
  mutation DeleteMySharedPost($postId: ID!) {
    removeSharedPost(id: $postId) {
      id
      is_deleted
      caption
    }
  }
`;
