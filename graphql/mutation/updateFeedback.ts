import { gql } from "@apollo/client";

export const UPDATE_FEEDBACK_MUTATION = gql`
  mutation updateFeedback(
    $updateFeedbackId: ID!
    $updateFeedbackInput2: UpdateFeedbackInput!
  ) {
    updateFeedback(id: $updateFeedbackId, input: $updateFeedbackInput2) {
      id
      rating
      content
      is_anonymous
      user {
        id
        name
      }
    }
  }
`;
