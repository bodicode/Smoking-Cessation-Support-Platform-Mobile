export type User = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type Comment = {
  id: string;
  content: string;
  user: User;
  created_at: string;
  replies: Comment[];
  parent_comment_id: string | null;
};

export type PostCommentsResponse = {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
};

export interface CreatePostCommentInput {
  shared_post_id: string;
  content: string;
  parent_comment_id?: string | null;
}

export interface AddCommentResponse {
  createPostComment: {
    id: string;
    content: string;
    parent_comment_id: string | null;
    user: {
      id: string;
      name: string;
    };
    created_at: string;
  };
}
