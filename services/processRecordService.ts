import { CREATE_PROGRESS_RECORD_MUTATION } from "@/graphql/mutation/addProcessRecord";
import { REMOVE_PROGRESS_RECORD_MUTATION } from "@/graphql/mutation/deleteProcessRecord";
import { UPDATE_PROGRESS_RECORD_MUTATION } from "@/graphql/mutation/updateProcessRecord";
import { GET_PROGRESS_RECORDS_QUERY } from "@/graphql/query/getProcessRecord";
import client from "@/libs/apollo-client";
import {
  ICreateProgressRecordInput,
  IGetRecordsVariables,
  IPaginationParamsInput,
  IProgressRecord,
  IUpdateProgressRecordInput,
} from "@/types/api/processRecord";
import { ApolloError } from "@apollo/client";

export const ProgressRecordService = {
  async getRecords({
    params,
    filters,
  }: IGetRecordsVariables): Promise<IProgressRecord[]> {
    try {
      const defaultParams: IPaginationParamsInput = {
        limit: 10,
        page: 1,
        orderBy: "record_date",
        sortOrder: "desc",
        search: "",
        ...params,
      };

      const queryVariables = {
        params: defaultParams,
        filters: filters || {},
      };

      const { data, errors } = await client.query({
        query: GET_PROGRESS_RECORDS_QUERY,
        variables: queryVariables,
        fetchPolicy: "network-only",
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to fetch progress records due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.progressRecords || !data.progressRecords.data) {
        throw new Error(
          "Invalid data structure received for progress records."
        );
      }

      return data.progressRecords.data as IProgressRecord[];
    } catch (error) {
      throw error;
    }
  },

  async createRecord(
    input: ICreateProgressRecordInput
  ): Promise<IProgressRecord> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_PROGRESS_RECORD_MUTATION,
        variables: { createProgressRecordInput2: input },
      });
      return data.createProgressRecord;
    } catch (error) {
      if (error instanceof ApolloError) {
        const duplicateError = error.graphQLErrors?.find(
          (err) =>
            err.message ===
            "A progress record for this date already exists for this plan."
        );

        if (duplicateError) {
          throw new Error("Bạn đã thêm tiến trình cho hôm nay rồi!");
        } else {
          throw new Error(
            "An unexpected error occurred during record creation."
          );
        }
      }
      throw new Error("Network error or unknown issue.");
    }
  },

  async updateRecord(
    input: IUpdateProgressRecordInput
  ): Promise<IProgressRecord> {
    const { data } = await client.mutate({
      mutation: UPDATE_PROGRESS_RECORD_MUTATION,
      variables: { updateProgressRecordInput2: input },
    });

    return data.updateProgressRecord;
  },

  async deleteRecord(id: string): Promise<IProgressRecord> {
    const { data } = await client.mutate({
      mutation: REMOVE_PROGRESS_RECORD_MUTATION,
      variables: { removeProgressRecordId: id },
    });
    return data.removeProgressRecord;
  },
};
