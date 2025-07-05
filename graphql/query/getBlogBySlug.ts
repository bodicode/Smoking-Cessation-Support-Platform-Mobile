import { gql } from "@apollo/client";

export const GET_BLOG_BY_SLUG = gql`
  query getBlogBySlug($slug: String!) {
    blogBySlug(slug: $slug) {
      id
      title
      content
      cover_image
      created_at
      author {
        name
        avatar_url
      }
    }
  }
`;
