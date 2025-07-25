import { gql } from "@apollo/client";

export const GET_PROGRESS_RECORDS_QUERY = gql`
  query getRecords(
    $params: PaginationParamsInput
    $filters: ProgressRecordFiltersInput
  ) {
    progressRecords(params: $params, filters: $filters) {
      data {
        id
        cigarettes_smoked
        health_score
        notes
        record_date
      }
      total_money_saved
    }
  }
`;
