import { gql } from '@apollo/client';

export const GET_AI_RECOMMENDATION = gql`
  query GetAIRecommendation {
    getAIRecommendation {
      alternativeTemplates
      confidence
      reasoning {
        considerations
        matchingFactors
        risks
        suggestions
      }
      recommendedTemplate
    }
  }
`; 