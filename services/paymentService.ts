import { CREATE_PAYMENT_MUTATION } from "@/graphql/mutation/createPayment";
import client from "@/libs/apollo-client";
import { GET_PAYMENT_BY_ID } from "@/graphql/query/getPaymentById";
import { GET_MEMBER_PAYMENTS_WITH_TRANSACTIONS } from "@/graphql/query/getMemberPaymentsWithTransactions";

// Update the interface to only include fields accepted by the GraphQL schema
interface CreatePaymentInput {
  user_id: string;
  membership_package_id: string;
  // Remove payment_method as it's not defined in the API
}

export const PaymentService = {
  /**
   * Create a new payment for a membership subscription
   */
  async createPayment(input: CreatePaymentInput) {
    try {
      
      const { data } = await client.mutate({
        mutation: CREATE_PAYMENT_MUTATION,
        variables: { input },
      });
      
      
      // Return paymentId along with other data
      return {
        success: true,
        data: data.createPayment,
        paymentId: data.createPayment?.id,
      };
    } catch (error: any) { // Add type assertion to error
      console.error('Error creating payment:', error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', error.networkError);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
  
  /**
   * Get payment status by ID (mock function for now)
   */
  async getPaymentStatus(paymentId: string) {
    try {
      // This would be replaced with an actual query to get payment status
      // For now it's just a mock
      return {
        success: true,
        status: 'pending',
        id: paymentId
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Get payment details by ID
   */
  async getPaymentById(paymentId: string) {
    try {
      
      const { data } = await client.query({
        query: GET_PAYMENT_BY_ID,
        variables: { id: paymentId },
        fetchPolicy: "network-only",
      });
      
      // Updated to use getPaymentById instead of getPayment
      
      // Return empty data object if payment is null or undefined
      return {
        success: true,
        data: data?.getPaymentById || { price: 0, id: paymentId },
      };
    } catch (error: any) { // Add type assertion here as well
      console.error(`Error getting payment by id ${paymentId}:`, error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', error.networkError);
      }
      
      // Return default data to prevent UI errors
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: { price: 0, id: paymentId } // Provide fallback data
      };
    }
  },

  /**
   * Get member payments with transactions
   */
  async getMemberPaymentsWithTransactions() {
    try {
      const { data } = await client.query({
        query: GET_MEMBER_PAYMENTS_WITH_TRANSACTIONS,
        fetchPolicy: "network-only",
      });
      return {
        success: true,
        data: data?.getMemberPaymentsWithTransactions || [],
      };
    } catch (error: any) {
      console.error('Error getting member payments with transactions:', error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', error.networkError);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: [],
      };
    }
  },
};
