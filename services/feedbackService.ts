import { CREATE_FEEDBACK_MUTATION } from "@/graphql/mutation/createFeedback";
import { REMOVE_FEEDBACK_MUTATION } from "@/graphql/mutation/deleteFeedback";
import { UPDATE_FEEDBACK_MUTATION } from "@/graphql/mutation/updateFeedback";
import { GET_FEEDBACKS_QUERY } from "@/graphql/query/getFeedbacks";

import client from "@/libs/apollo-client";
import {
  IFeedback,
  IGetFeedbacksVariables,
  ICreateFeedbackInput,
  IUpdateFeedbackInput,
} from "@/types/api/feedback";

export const FeedbackService = {
  getFeedbacks: async (
    variables: IGetFeedbacksVariables
  ): Promise<IFeedback[]> => {
    try {
      const { data, errors } = await client.query({
        query: GET_FEEDBACKS_QUERY,
        variables,
        fetchPolicy: "network-only",
      });

      if (errors) {
        console.error("GraphQL Errors (getFeedbacks):", errors);
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to fetch feedbacks due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.feedbacks || !data.feedbacks.data) {
        return [];
      }

      return data.feedbacks.data as IFeedback[];
    } catch (error) {
      console.error("Error in getFeedbacks service:", error);
      throw error;
    }
  },

  createFeedback: async (input: ICreateFeedbackInput): Promise<IFeedback> => {
    try {
      const { data, errors } = await client.mutate({
        mutation: CREATE_FEEDBACK_MUTATION,
        variables: { createFeedbackInput2: input },
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to create feedback due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.createFeedback) {
        throw new Error(
          "Invalid data structure received after creating feedback."
        );
      }

      return data.createFeedback as IFeedback;
    } catch (error) {
      throw error;
    }
  },

  updateFeedback: async (
    id: string,
    input: IUpdateFeedbackInput
  ): Promise<IFeedback> => {
    try {
      const { data, errors } = await client.mutate({
        mutation: UPDATE_FEEDBACK_MUTATION,
        variables: { updateFeedbackId: id, updateFeedbackInput2: input },
      });

      if (errors) {
        console.error("GraphQL Errors (updateFeedback):", errors);
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to update feedback due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.updateFeedback) {
        throw new Error(
          "Invalid data structure received after updating feedback."
        );
      }

      return data.updateFeedback as IFeedback;
    } catch (error) {
      console.error("Error in updateFeedback service:", error);
      throw error;
    }
  },

  deleteFeedback: async (
    id: string
  ): Promise<{ id: string; content: string; is_deleted: boolean }> => {
    try {
      const { data, errors } = await client.mutate({
        mutation: REMOVE_FEEDBACK_MUTATION,
        variables: { removeFeedbackId: id },
      });

      if (errors) {
        console.error("GraphQL Errors (removeFeedback):", errors);
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to remove feedback due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.removeFeedback) {
        throw new Error(
          "Invalid data structure received after removing feedback."
        );
      }

      return data.removeFeedback as {
        id: string;
        content: string;
        is_deleted: boolean;
      };
    } catch (error) {
      console.error("Error in deleteFeedback service:", error);
      throw error;
    }
  },
};
