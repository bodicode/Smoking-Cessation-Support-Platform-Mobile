import { GET_COMMENTS_FOR_SPECIFIC_POST } from "@/graphql/query/getCommentForPost";
import { GET_FEED } from "@/graphql/query/getNewFeed";
import client from "@/libs/apollo-client";
import { FeedResponse } from "@/types/api/newFeed";

export const FeedService = {
  async getFeed(params = {}, filters = {}): Promise<FeedResponse> {
    const res = await client.query({
      query: GET_FEED,
      variables: { params, filters },
      fetchPolicy: "network-only",
    });
    return res.data.sharedPosts;
  },

  async getPostComments(postId: string, params = { page: 1, limit: 10 }) {
    const { data } = await client.query({
      query: GET_COMMENTS_FOR_SPECIFIC_POST,
      variables: { postId, params },
      fetchPolicy: "network-only",
    });
    return data?.postComments;
  },
};
