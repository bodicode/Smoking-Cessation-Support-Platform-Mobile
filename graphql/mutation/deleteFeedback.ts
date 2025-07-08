import { gql } from "@apollo/client";

export const REMOVE_FEEDBACK_MUTATION = gql`
  mutation removeFeedback($removeFeedbackId: ID!) {
    removeFeedback(id: $removeFeedbackId) {
      id
      content
      is_deleted
    }
  }
`;
