import { GET_BLOG_BY_SLUG } from "@/graphql/query/getBlogBySlug";
import { GET_BLOGS } from "@/graphql/query/getBlogs";
import client from "@/libs/apollo-client";

export const BlogService = {
  async getBlogs(
    {
      page = 1,
      limit = 5,
      search = "",
      orderBy = "created_at",
      sortOrder = "asc",
    } = {},
    filters = {}
  ) {
    const { data } = await client.query({
      query: GET_BLOGS,
      variables: {
        params: { page, limit, search, orderBy, sortOrder },
        filters,
      },
      fetchPolicy: "no-cache",
    });

    const blogs = data.blogs;
    const totalPages = Math.ceil(blogs.total / blogs.limit);

    return {
      data: blogs.data,
      page: blogs.page,
      totalPages,
      hasNext: blogs.hasNext,
    };
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
