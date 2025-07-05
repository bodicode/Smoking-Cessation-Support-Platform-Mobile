import { gql } from "@apollo/client";

export const CREATE_PLAN_STAGE = gql`
  mutation createPlanStage($input: CreatePlanStageInput!) {
    createPlanStage(input: $input) {
      id
      actions
      days_since_start
      days_to_end
      stage_order
      is_overdue
      status
      template_stage_id
    }
  }
`;
