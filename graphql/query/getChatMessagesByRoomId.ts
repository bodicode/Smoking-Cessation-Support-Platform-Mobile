import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES_BY_ROOM_ID = gql`
  query GetChatMessagesByRoomId($roomId: String!) {
    getChatMessagesByRoomId(roomId: $roomId) {
      activeCessationPlan {
        id
        template_id
        is_custom
        start_date
        target_date
        status
        template {
          id
          name
          average_rating    
          description
          difficulty_level
          estimated_duration_days
          success_rate
          total_reviews
          is_active
        }
      }
      messages {
        id
        content
        created_at
        is_read
        sender {
            id
            name
        }
        session_id
        updated_at
      }
      chatRoom {
        id
        creator {
          id
          name
        }
      }
    }
  }
`; 