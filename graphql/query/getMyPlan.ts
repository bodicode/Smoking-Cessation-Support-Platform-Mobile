import { gql } from "@apollo/client";

export const GET_CESSATION_PLANS_QUERY = gql`
  query getCessationPlans(
    $params: PaginationParamsInput # Tham số phân trang (đã định nghĩa trước đó)
    $filters: CessationPlanFiltersInput # Tham số lọc kế hoạch bỏ thuốc (sẽ định nghĩa mới)
  ) {
    cessationPlans(params: $params, filters: $filters) {
      data {
        id
        template {
          id
          name
        }
        reason
        status
        start_date
        target_date
        days_since_start
        completion_percentage
        is_custom
        user {
          id
          name
        }
        stages {
          id
          title
          stage_order
          description
          actions
          start_date
          end_date
          status
        }
      }
      # Có thể thêm các trường phân trang khác nếu API trả về
      # total
      # limit
      # page
      # hasNext
    }
  }
`;
