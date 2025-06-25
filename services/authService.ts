import { LOGIN_MUTATION } from "@/graphql/mutation/login";
import { REGISTER_MUTATION } from "@/graphql/mutation/register";
import client from "@/libs/apollo-client";
import { LoginResult } from "@/types/api/login";

export const AuthService = {
  login: async (
    email: string,
    password: string
  ): Promise<LoginResult | null> => {
    const { data } = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        loginInput: { email, password },
      },
    });
    if (!data?.login?.data) return null;
    const session = data.login.data.session;
    const user = data.login.data.user;
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user,
    };
  },

  async register(input: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    username: string;
  }) {
    const res = await client.mutate({
      mutation: REGISTER_MUTATION,
      variables: {
        signupInput: {
          email: input.email,
          password: input.password,
          confirmPassword: input.confirmPassword,
          name: input.name,
          username: input.username,
        },
      },
    });

    const data = res.data?.register?.data || res.data?.signup?.data;
    if (!data) return null;
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  },
};
