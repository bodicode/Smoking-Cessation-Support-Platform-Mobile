import { gql } from "@apollo/client";

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($input: ManagePostLikeInput!) {
    likeSharedPost(input: $input) {
      id
      user {
        id
        name
      }
    }
  }
`;
