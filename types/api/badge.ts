export interface BadgeType {
  id: string;
  name: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirements: string;
  badge_type: BadgeType;
}

export interface UserBadge {
  id: string;
  awarded_at: string;
  badge: Badge;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface GetMyAwardedBadgesResponse {
  myBadges: PaginationResponse<UserBadge>;
}
