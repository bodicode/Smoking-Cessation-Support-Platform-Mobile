import { gql } from "@apollo/client";

export const REMOVE_PROGRESS_RECORD_MUTATION = gql`
  mutation removeProgressRecord($removeProgressRecordId: ID!) {
    removeProgressRecord(id: $removeProgressRecordId) {
      id
      is_deleted
      cigarettes_smoked
    }
  }
`;
