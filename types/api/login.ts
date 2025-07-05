export interface LoginResult {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: { name: string };
  };
}
