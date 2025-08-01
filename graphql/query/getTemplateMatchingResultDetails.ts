import { gql } from '@apollo/client';

export const GET_TEMPLATE_MATCHING_RESULT_DETAILS = gql`
  query GetTemplateMatchingResultDetails($getTemplateMatchingResultDetailsId: String!) {
    getTemplateMatchingResultDetails(id: $getTemplateMatchingResultDetailsId) {
      createdAt
      id
      matchingFactors
      matchingScore
      recommendationLevel
      template {
        description
        id
        is_active
        name
      }
    }
  }
`; 