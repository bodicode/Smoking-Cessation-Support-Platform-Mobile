import { gql } from "@apollo/client";

export const GET_CHAT_MESSAGES_QUERY = gql`
  query GetChatMessagesByRoomId($roomId: String!) {
    getChatMessagesByRoomId(roomId: $roomId) {
      id
      content
      chat_room {
        id
        creator {
          name
        }
      }
      id
      sender {
        name
        id
      }
      session_id
      updated_at
      created_at
      is_read
    }
  }
`;
