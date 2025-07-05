import { gql } from "@apollo/client";

export const GET_LIKERS_FOR_POST_QUERY = gql`
  query GetLikersForPost($postId: ID!, $params: PaginationParamsInput) {
    postLikes(sharedPostId: $postId, params: $params) {
      data {
        id
        user {
          id
          name
          avatar_url
        }
        created_at
      }
      total
      page
      limit
      hasNext
    }
  }
`;
