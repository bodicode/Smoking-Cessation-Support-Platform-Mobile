import { gql } from "@apollo/client";

export const GET_MEMBERSHIPS = gql`
  query GetMembershipPackages {
    getMembershipPackages {
      id
      name
      price
      description
      duration_days
      created_at
      updated_at
    }
  }
`;
