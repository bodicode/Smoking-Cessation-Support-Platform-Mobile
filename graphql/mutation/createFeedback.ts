import { gql } from "@apollo/client";

export const CREATE_FEEDBACK_MUTATION = gql`
  mutation createFeedback($createFeedbackInput2: CreateFeedbackInput!) {
    createFeedback(input: $createFeedbackInput2) {
      id
      rating
      content
      is_anonymous
      template {
        id
        name
      }
      user {
        id
        name
        avatar_url
      }
    }
  }
`;