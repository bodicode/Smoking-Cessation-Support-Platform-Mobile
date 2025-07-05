import { gql } from "@apollo/client";

export const UPDATE_CESSATION_PLAN = gql`
  mutation updateCessationPlan(
    $updateCessationPlanInput: UpdateCessationPlanInput!
  ) {
    updateCessationPlan(input: $updateCessationPlanInput) {
      id
      reason
      is_custom
      status
      target_date
    }
  }
`;
