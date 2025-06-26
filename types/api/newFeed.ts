export type Badge = {
  name: string;
  icon_url: string;
};

export type FeedUser = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type UserBadge = {
  user: FeedUser;
  badge: Badge;
};

export type FeedItem = {
  id: string;
  caption: string;
  user_badge: UserBadge;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

export type FeedResponse = {
  data: FeedItem[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
};

export type FeedApiResult = {
  sharedPosts: FeedResponse;
};
