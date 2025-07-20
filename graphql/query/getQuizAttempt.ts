import { gql } from '@apollo/client';

export const GET_QUIZ_ATTEMPT = gql`
  query GetQuizAttemptOnCurrentUser {
    getQuizAttemptOnCurrentUser {
      completed_at
      created_at
      id
      member_profile_id
      quiz_id
      responses {
        answer
        attempt_id
        created_at
        id
        order
        question_id
        updated_at
      }
      started_at
      status
      updated_at
      user_id
    }
  }
`; 