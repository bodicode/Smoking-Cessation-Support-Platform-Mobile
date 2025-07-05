import { CREATE_CESSATION_PLAN } from "@/graphql/mutation/createPlan";
import { CREATE_PLAN_STAGE } from "@/graphql/mutation/createPlanStage";
import { REMOVE_PLAN_STAGE } from "@/graphql/mutation/removePlanStage";
import { UPDATE_CESSATION_PLAN } from "@/graphql/mutation/updatePlan";
import { UPDATE_PLAN_STAGE } from "@/graphql/mutation/updatePlanStage";
import { GET_CESSATION_PLANS_QUERY } from "@/graphql/query/getMyPlan";
import client from "@/libs/apollo-client";
import { IPaginationParamsInput } from "@/types/api/feedback";
import {
  ICessationPlan,
  ICreateCessationPlanInput,
  IGetCessationPlansVariables,
  UpdatePlanStageInput,
} from "@/types/api/myPlan";

export const CessationPlanService = {
  async getCessationPlans({
    params,
    filters,
  }: IGetCessationPlansVariables): Promise<ICessationPlan[]> {
    try {
      const defaultParams: IPaginationParamsInput = {
        page: 1,
        limit: 10,
        search: "",
        orderBy: "created_at",
        sortOrder: "desc",
        ...params,
      };

      const queryVariables = {
        params: defaultParams,
        filters: filters || {},
      };

      const { data, errors } = await client.query({
        query: GET_CESSATION_PLANS_QUERY,
        variables: queryVariables,
        fetchPolicy: "network-only",
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to fetch cessation plans due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.cessationPlans || !data.cessationPlans.data) {
        throw new Error("Invalid data structure received for cessation plans.");
      }

      return data.cessationPlans.data as ICessationPlan[];
    } catch (error) {
      throw error;
    }
  },

  async createCessationPlan(
    input: ICreateCessationPlanInput
  ): Promise<ICessationPlan> {
    try {
      const { data, errors } = await client.mutate({
        mutation: CREATE_CESSATION_PLAN,
        variables: {
          createCessationPlanInput: input,
        },
      });

      if (errors) {
        console.error("GraphQL Errors (createCessationPlan):", errors);
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to create cessation plan due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.createCessationPlan) {
        throw new Error("No data returned when creating cessation plan.");
      }

      return data.createCessationPlan as ICessationPlan;
    } catch (error) {
      console.error("Error creating cessation plan:", error);
      throw error;
    }
  },

  updateCessationPlan: async ({
    id,
    status,
  }: {
    id: string;
    status:
      | "PLANNING"
      | "ACTIVE"
      | "PAUSED"
      | "COMPLETED"
      | "ABANDONED"
      | "CANCELLED";
  }) => {
    const { data } = await client.mutate({
      mutation: UPDATE_CESSATION_PLAN,
      variables: {
        updateCessationPlanInput: {
          id,
          status,
        },
      },
    });

    return data.updateCessationPlan;
  },

  createPlanStage: async (input: {
    title: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    actions: string;
    description: string;
    stage_order: number;
  }) => {
    try {
      const response = await client.mutate({
        mutation: CREATE_PLAN_STAGE,
        variables: { input },
      });
      return response.data.createPlanStage;
    } catch (err: any) {
      console.error("Lỗi:", err.graphQLErrors, err.networkError);
      throw err;
    }
  },

  async updateStage(input: UpdatePlanStageInput): Promise<any> {
    try {
      const response = await client.mutate({
        mutation: UPDATE_PLAN_STAGE,
        variables: { input },
      });

      return response.data.updatePlanStage;
    } catch (error) {
      throw error;
    }
  },

  async removePlanStage(id: string) {
    const { data } = await client.mutate({
      mutation: REMOVE_PLAN_STAGE,
      variables: {
        removePlanStageId: id,
      },
    });
    return data.removePlanStage;
  },
};
