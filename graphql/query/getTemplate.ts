import { gql } from "@apollo/client";

export const GET_PLAN_TEMPLATES = gql`
  query getPlanTemplates(
    $page: Int!
    $limit: Int!
    $search: String
    $orderBy: String
    $sortOrder: String
  ) {
    cessationPlanTemplates(
      params: {
        page: $page
        limit: $limit
        search: $search
        orderBy: $orderBy
        sortOrder: $sortOrder
      }
    ) {
      data {
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
  }
`;
