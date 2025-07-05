import { gql } from "@apollo/client";

export const GET_FEED = gql`
  query GetFeed(
    $params: PaginationParamsInput
    $filters: SharedPostFiltersInput
  ) {
    sharedPosts(params: $params, filters: $filters) {
      data {
        id
        caption
        user_badge {
          user {
            id
            name
            avatar_url
          }
          badge {
            name
            icon_url
          }
        }
        likes_count
        comments_count
        created_at
      }
      total
      page
      limit
      hasNext
    }
  }
`;
