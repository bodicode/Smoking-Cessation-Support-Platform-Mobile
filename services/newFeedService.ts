import { ADD_COMMENT_TO_POST_MUTATION } from "@/graphql/mutation/addComment";
import { DELETE_COMMENT_MUTATION } from "@/graphql/mutation/deleteComment";
import { REMOVE_SHARED_POST_MUTATION } from "@/graphql/mutation/deleteNewFeed";
import { EDIT_COMMENT_MUTATION } from "@/graphql/mutation/editComment";
import { EDIT_MY_SHARED_POST } from "@/graphql/mutation/editNewFeed";
import { LIKE_POST_MUTATION } from "@/graphql/mutation/likeNewFeed";
import { SHARE_BADGE_MUTATION } from "@/graphql/mutation/shareBadgeMutation";
import { UNLIKE_POST_MUTATION } from "@/graphql/mutation/unlikeNewFeed";
import { GET_COMMENTS_FOR_SPECIFIC_POST } from "@/graphql/query/getCommentForPost";
import { GET_LIKERS_FOR_POST_QUERY } from "@/graphql/query/getLikersForPost";
import { GET_FEED } from "@/graphql/query/getNewFeed";
import client from "@/libs/apollo-client";
import {
  AddCommentResponse,
  CreatePostCommentInput,
} from "@/types/api/comment";
import {
  FeedItem,
  FeedResponse,
  LikePostResponse,
  ManagePostLikeInput,
  UnlikePostResponse,
} from "@/types/api/newFeed";

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

  async shareBadge(userBadgeId: string, caption: string) {
    try {
      const { data, errors } = await client.mutate({
        mutation: SHARE_BADGE_MUTATION,
        variables: {
          input: {
            user_badge_id: userBadgeId,
            caption: caption,
          },
        },
        errorPolicy: "all",
      });
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }
      return data?.createSharedPost;
    } catch (error) {
      throw error;
    }
  },
  async removeSharedPost(postId: string) {
    try {
      const { data, errors } = await client.mutate({
        mutation: REMOVE_SHARED_POST_MUTATION,
        variables: {
          postId: postId,
        },
        errorPolicy: "all",
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      return data?.removeSharedPost;
    } catch (error) {
      console.error("Error removing shared post:", error);
      throw error;
    }
  },

  async updateSharedPostCaption(
    postId: string,
    caption: string
  ): Promise<FeedItem> {
    try {
      const { data } = await client.mutate({
        mutation: EDIT_MY_SHARED_POST,
        variables: {
          postId: postId,
          input: {
            caption: caption,
          },
        },
      });

      if (!data?.updateSharedPost) {
        throw new Error("Không thể cập nhật bài viết.");
      }

      return data.updateSharedPost;
    } catch (error) {
      console.error("Error updating shared post:", error);
      throw error;
    }
  },

  async getPostLikers(postId: string) {
    const variables = {
      postId: postId,
      params: { page: 1, limit: 10 },
    };

    try {
      const { data } = await client.query({
        query: GET_LIKERS_FOR_POST_QUERY,
        variables: variables,
        fetchPolicy: "network-only",
      });

      return data.postLikes.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async likePost(
    sharedPostId: string
  ): Promise<LikePostResponse["likeSharedPost"]> {
    const { data } = await client.mutate<
      LikePostResponse,
      { input: ManagePostLikeInput }
    >({
      mutation: LIKE_POST_MUTATION,
      variables: {
        input: {
          shared_post_id: sharedPostId,
        },
      },
    });
    return data!.likeSharedPost;
  },

  async unlikePost(
    sharedPostId: string
  ): Promise<UnlikePostResponse["unlikeSharedPost"]> {
    const { data } = await client.mutate<
      UnlikePostResponse,
      { input: ManagePostLikeInput }
    >({
      mutation: UNLIKE_POST_MUTATION,
      variables: {
        input: {
          shared_post_id: sharedPostId,
        },
      },
    });
    return data!.unlikeSharedPost;
  },

  async addComment(input: CreatePostCommentInput) {
    try {
      const { data, errors } = await client.mutate<
        AddCommentResponse,
        { input: CreatePostCommentInput }
      >({
        mutation: ADD_COMMENT_TO_POST_MUTATION,
        variables: { input },
      });

      if (errors && errors.length > 0) {
        console.error("GraphQL Errors:", errors);
        throw new Error(errors[0].message);
      }

      if (!data?.createPostComment) {
        throw new Error(
          "Failed to create comment. No data returned from server."
        );
      }

      return {
        ...data.createPostComment,
        user: {
          ...data.createPostComment.user,
          avatar_url: null,
        },
        replies: [],
      };
    } catch (error: any) {
      throw error;
    }
  },

  async updateComment(commentId: string, newContent: string) {
    try {
      const { data } = await client.mutate({
        mutation: EDIT_COMMENT_MUTATION,
        variables: {
          commentIdToUpdate: commentId,
          input: {
            content: newContent,
          },
        },
      });

      if (!data || !data.updatePostComment) {
        throw new Error("Failed to update comment. Response is empty.");
      }

      return data.updatePostComment;
    } catch (error) {
      console.error("[CommentService] Error updating comment:", error);
      throw error;
    }
  },

  async deleteComment(commentId: string) {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_COMMENT_MUTATION,
        variables: {
          commentIdToDelete: commentId,
        },
      });

      if (!data || !data.deletePostComment) {
        throw new Error("Failed to delete comment. Response is empty.");
      }

      return data.deletePostComment;
    } catch (error) {
      console.error("[CommentService] Error deleting comment:", error);
      throw error;
    }
  },
};
