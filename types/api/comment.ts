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
};

export type PostCommentsResponse = {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
};
