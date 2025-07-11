import { gql } from "@apollo/client";

export const CHAT_ROOM_MESSAGES_SUBSCRIPTION = gql`
  subscription ChatRoomMessages($roomId: String!) {
    chatRoomMessages(roomId: $roomId) {
      chat_room {
        id
      }
      content
      created_at
      id
      is_read
      sender {
        name
        id
      }
      session_id
      updated_at
    }
  }
`;