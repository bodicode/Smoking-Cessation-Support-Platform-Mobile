import { gql } from "@apollo/client";

export const GET_PAYMENT_BY_ID = gql`
  query GetPaymentById($id: String!) {
    getPaymentById(id: $id) {
      id
      content
      price
      status
      subscription_id
      user_id
    }
  }
`;
