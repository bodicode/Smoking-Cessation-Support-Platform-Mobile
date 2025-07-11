import { gql } from "@apollo/client";

export const CREATE_CHAT_ROOM_MUTATION = gql`
  mutation CreateChatRoom($input: CreateChatRoomInput!) {
    createChatRoom(input: $input) {
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