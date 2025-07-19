import { gql } from "@apollo/client";

export const GET_ALL_CHAT_ROOMS_BY_USER_QUERY = gql`
  query GetAllChatRoomsByUser {
    getAllChatRoomsByUser {
      id
      creator {
        id
        name
      }
      receiver {
        id
        name
      }
      created_at
      updated_at
      is_deleted
    }
  }
`;
