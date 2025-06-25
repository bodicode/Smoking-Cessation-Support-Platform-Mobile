import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation register($signupInput: SignupBodyDTO!) {
    signup(signupInput: $signupInput) {
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
