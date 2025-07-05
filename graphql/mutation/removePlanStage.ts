import { gql } from "@apollo/client";

export const REMOVE_PLAN_STAGE = gql`
  mutation removePlanStage($removePlanStageId: ID!) {
    removePlanStage(id: $removePlanStageId) {
      id
      actions
      is_deleted
    }
  }
`;
