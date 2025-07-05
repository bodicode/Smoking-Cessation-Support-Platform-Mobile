import { gql } from "@apollo/client";

export const GET_FEEDBACKS_QUERY = gql`
  query getFeedbacks(
    # Định nghĩa các biến là Input Object, khớp với tài liệu
    $params: PaginationParamsInput
    $filters: FeedbackFiltersInput
  ) {
    feedbacks(params: $params, filters: $filters) {
      data {
        id
        rating
        content
        is_anonymous
        created_at
        updated_at
        is_deleted
        user {
          id
          name
          role
        }
        template {
          id
          name
          coach {
            id
            name
          }
        }
      }
    }
  }
`;
