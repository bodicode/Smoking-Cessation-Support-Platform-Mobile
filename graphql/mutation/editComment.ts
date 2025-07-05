import { gql } from "@apollo/client";

export const EDIT_COMMENT_MUTATION = gql`
  mutation EditMyComment(
    $commentIdToUpdate: ID!
    $input: UpdatePostCommentInput!
  ) {
    updatePostComment(commentId: $commentIdToUpdate, input: $input) {
      id
      content
      updated_at
      user {
        id
        name
      }
    }
  }
`;
