import { gql } from "@apollo/client";

export const GET_MEMBERSHIP_BY_ID = gql`
  query GetMembershipById($id: ID!) {
    membership(id: $id) {
      id
      name
      price
      description
      duration_days
      features
      is_popular
      created_at
      updated_at
    }
  }
`;
