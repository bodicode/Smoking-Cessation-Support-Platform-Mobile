import { gql } from "@apollo/client";

export const GET_MEMBER_PAYMENTS_WITH_TRANSACTIONS = gql`
  query {
    getMemberPaymentsWithTransactions {
      content
      id
      payment_transaction {
        accountNumber
        accumulated
        amountIn
        amountOut
        body
        code
        gateway
        id
        referenceNumber
        sepay_id
        subAccount
        transactionContent
        transactionDate
      }
      payment_transaction_id
      price
      status
      subscription {
        id
        package {
          description
          duration_days
          name
          price
        }
      }
      subscription_id
      user {
        avatar_url
        id
        name
        user_name
      }
      user_id
    }
  }
`;
