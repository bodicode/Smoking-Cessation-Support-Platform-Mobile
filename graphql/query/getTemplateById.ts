import { gql } from "@apollo/client";

export const GET_PLAN_TEMPLATE_BY_ID = gql`
  query getPlanTemplateById($cessationPlanTemplateId: String!) {
    cessationPlanTemplate(id: $cessationPlanTemplateId) {
      id
      name
      estimated_duration_days
      difficulty_level
      description
      total_reviews
      success_rate
      average_rating
      created_at
      coach {
        id
        name
      }
      stages {
        id
        stage_order
        title
        description
        recommended_actions
        duration_days
      }
    }
  }
`;
