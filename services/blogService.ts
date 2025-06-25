import { GET_BLOG_BY_SLUG } from "@/graphql/query/getBlogBySlug";
import { GET_BLOGS } from "@/graphql/query/getBlogs";
import client from "@/libs/apollo-client";

export const BlogService = {
  async getBlogs() {
    const { data } = await client.query({
      query: GET_BLOGS,
      variables: {
        params: {
          page: 1,
          limit: 5,
          search: "",
          orderBy: "created_at",
          sortOrder: "asc",
        },
        filters: {},
      },
      fetchPolicy: "no-cache",
    });

    return data.blogs;
  },

  async getBlogBySlug(slug: string) {
    const res = await client.query({
      query: GET_BLOG_BY_SLUG,
      variables: { slug },
      fetchPolicy: "network-only",
    });
    return res.data.blogBySlug;
  },
};
