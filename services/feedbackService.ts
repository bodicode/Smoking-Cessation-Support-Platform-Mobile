import { GET_FEEDBACKS_QUERY } from "@/graphql/query/getFeedbacks";
import client from "@/libs/apollo-client";
import { IFeedback, IGetFeedbacksVariables } from "@/types/api/feedback";

export const getFeedbacks = async (
  variables: IGetFeedbacksVariables
): Promise<IFeedback[]> => {
  try {
    const { data, errors } = await client.query({
      query: GET_FEEDBACKS_QUERY,
      variables,
    });

    if (errors) {
      console.error("GraphQL Errors:", errors);
      const errorMessage = errors.map((err) => err.message).join(", ");
      throw new Error(
        `Failed to fetch feedbacks due to GraphQL errors: ${errorMessage}`
      );
    }

    if (!data || !data.feedbacks || !data.feedbacks.data) {
      throw new Error("Invalid data structure received from GraphQL API.");
    }

    return data.feedbacks.data as IFeedback[];
  } catch (error) {
    throw error;
  }
};
