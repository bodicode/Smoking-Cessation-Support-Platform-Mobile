import { gql } from "@apollo/client";

export const UPDATE_PLAN_STAGE = gql`
  mutation updatePlanStage($input: UpdatePlanStageInput!) {
    updatePlanStage(input: $input) {
      id
      title
      description
      actions
      days_since_start
      days_to_end
      stage_order
      is_overdue
      status
    }
  }
`;
