import { gql } from '@apollo/client';

export const GET_USER_BY_ID = gql`
  query($userId: String!) {
    findUserById(userId: $userId) {
      id
      avatar_url
      name
      created_at
      coach_profile {
        approach_description
        average_rating
        certifications
        education
        created_at
        experience_years
        id
        professional_bio
        specializations
        success_rate
        total_clients
        total_sessions
        updated_at
        user_id
      }
      member_profile {
        allergies
        brand_preference
        cigarettes_per_day
        daily_routine
        health_conditions
        id
        medications
        nicotine_level
        preferred_support
        previous_attempts
        price_per_pack
        quit_motivation
        recorded_at
        sessions_per_day
        smoking_years
        social_support
        stress_level
        trigger_factors
        user_id
      }
    }
  }
`; 