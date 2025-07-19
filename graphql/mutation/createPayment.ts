import { gql } from "@apollo/client";

export const CREATE_PAYMENT_MUTATION = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      id
      content
      price
      status
      subscription_id
      user_id
      payment_transaction {
        id
        accountNumber
        accumulated
        amountIn
        amountOut
        body
        code
        createdAt
        gateway
        payment
        payment_id
        referenceNumber
        subAccount
        transactionContent
        transactionDate
      }
    }
  }
`;
