export type User = {
  id: string;
  email: string;
  points?: number;
  avatarUrl?: string;
  name?: string;
  user_metadata?: {
    name?: string;
  };
};
