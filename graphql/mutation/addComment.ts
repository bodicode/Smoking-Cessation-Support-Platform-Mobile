import { gql } from "@apollo/client";

export const ADD_COMMENT_TO_POST_MUTATION = gql`
  mutation AddCommentToPost($input: CreatePostCommentInput!) {
    createPostComment(input: $input) {
      id
      content
      parent_comment_id
      user {
        id
        name
      }
      created_at
    }
  }
`;
