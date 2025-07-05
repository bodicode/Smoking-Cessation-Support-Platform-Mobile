import { gql } from "@apollo/client";

export const DELETE_COMMENT_MUTATION = gql`
  mutation RemoveComment($commentIdToDelete: ID!) {
    deletePostComment(commentId: $commentIdToDelete) {
      id
      is_deleted
      content
    }
  }
`;
