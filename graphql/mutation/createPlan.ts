import { gql } from "@apollo/client";

export const CREATE_CESSATION_PLAN = gql`
  mutation createCessationPlan(
    $createCessationPlanInput: CreateCessationPlanInput!
  ) {
    createCessationPlan(input: $createCessationPlanInput) {
      id
      reason
      start_date
      target_date
      days_to_target
      is_custom
      is_overdue
      completion_percentage
    }
  }
`;
