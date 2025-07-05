import { gql } from "@apollo/client";

export const UNLIKE_POST_MUTATION = gql`
  mutation UnlikePost($input: ManagePostLikeInput!) {
    unlikeSharedPost(input: $input) {
      id
      shared_post {
        id
        likes_count
      }
    }
  }
`;
