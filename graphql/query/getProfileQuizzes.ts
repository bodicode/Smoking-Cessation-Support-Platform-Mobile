import { gql } from '@apollo/client';

export const GET_PROFILE_QUIZZES = gql`
  query GetProfileQuizzes {
    getProfileQuizzes {
      id
      description
      title
      is_active
      questions {
        id
        created_at
        description
        is_required
        options
        order
        question_text
        question_type
        quiz_id
        updated_at
        validation_rule
      }
      updated_at
      created_at
    }
  }
`; 