import { gql } from '@apollo/client';

export const GET_MY_TEMPLATE_MATCHING_RESULTS = gql`
  query GetMyTemplateMatchingResults {
    getMyTemplateMatchingResults {
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