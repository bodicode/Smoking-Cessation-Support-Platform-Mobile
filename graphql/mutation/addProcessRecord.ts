import { gql } from "@apollo/client";

export const CREATE_PROGRESS_RECORD_MUTATION = gql`
  mutation createProgressRecord(
    $createProgressRecordInput2: CreateProgressRecordInput!
  ) {
    createProgressRecord(input: $createProgressRecordInput2) {
      id
      cigarettes_smoked
      health_score
      notes
    }
  }
`;
