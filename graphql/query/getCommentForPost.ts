import { gql } from "@apollo/client";

export const GET_COMMENTS_FOR_SPECIFIC_POST = gql`
  query GetCommentsForSpecificPost(
    $postId: ID!
    $params: PaginationParamsInput
  ) {
    postComments(sharedPostId: $postId, params: $params) {
      data {
        id
        content
        user {
          id
          name
          avatar_url
        }
        created_at
        replies {
          id
          content
          user {
            id
            name
          }
          created_at
          replies {
            id
            content
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
