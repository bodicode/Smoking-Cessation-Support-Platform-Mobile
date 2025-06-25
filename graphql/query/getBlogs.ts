import { gql } from "@apollo/client";

export const GET_BLOGS = gql`
  query GetBlogs {
    blogs(
      params: {
        page: 1
        limit: 5
        search: ""
        orderBy: "created_at"
        sortOrder: "asc"
      }
    ) {
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
