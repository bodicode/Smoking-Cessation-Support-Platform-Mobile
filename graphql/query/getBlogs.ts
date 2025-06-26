import { gql } from "@apollo/client";

export const GET_BLOGS = gql`
  query GetBlogs($params: PaginationParamsInput, $filters: BlogFilterInput) {
    blogs(params: $params, filters: $filters) {
      data {
        id
        title
        content
        cover_image
        slug
        created_at
        author {
          name
        }
      }
      total
      page
      limit
      hasNext
    }
  }
`;
