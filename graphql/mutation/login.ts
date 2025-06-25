import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation login($loginInput: LoginBodyDTO!) {
    login(loginInput: $loginInput) {
      data {
        session {
          access_token
          refresh_token
        }
        user {
          id
          email
          user_metadata {
            name
          }
        }
      }
    }
  }
`;
