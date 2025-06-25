export type User = {
  id: string;
  email: string;
  points?: number;
  avatarUrl?: string;
  user_metadata?: {
    name?: string;
  };
};
