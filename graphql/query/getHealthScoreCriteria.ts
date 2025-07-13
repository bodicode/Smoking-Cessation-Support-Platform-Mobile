import { gql } from "@apollo/client";

export const GET_HEALTH_SCORE_CRITERIA_QUERY = gql`
  query GetHealthScoreCriteria($coachId: ID!) {
    healthScoreCriteriaByCoach(coachId: $coachId) {
      id
      title
      description
      coach_id
    }
  }
`;
