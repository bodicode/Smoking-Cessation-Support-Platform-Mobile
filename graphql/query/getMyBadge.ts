import { gql } from "@apollo/client";

export const GET_MY_AWARDED_BADGES = gql`
  query GetMyAwardedBadges(
    $params: PaginationParamsInput
    $filters: UserBadgeFiltersInput
  ) {
    myBadges(params: $params, filters: $filters) {
      data {
        id
        awarded_at
        badge {
          id
          name
          description
          icon_url
          requirements
          badge_type {
            id
            name
          }
        }
      }
      total
      page
      limit
      hasNext
    }
  }
`;
