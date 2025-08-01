// Một tin nhắn trong phòng chat
export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id?: string;
    name: string;
  };
  chat_room: {
    id: string;
    creator: {
      name: string;
    };
  };
  is_read: boolean;
  session_id: string;
  created_at: string;
  updated_at: string;
}

// Một phòng chat giữa 2 người
export interface IChatRoom {
  id: string;
  creator: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  hasUnread: boolean;
  messages?: ChatMessage[];
  last_message?: ChatMessage;
  unread_count?: number;
  total_messages?: number;
}

// Input khi gửi tin nhắn
export interface CreateChatMessageInput {
  chat_room_id: string;
  content: string;
}

// Input khi tạo phòng chat mới
export interface ICreateChatRoomInput {
  receiver_id: string;
}

// Dữ liệu trả về từ API lấy tất cả messages của 1 room
export interface GetChatMessagesResponse {
  getChatMessagesByRoomId: {
    messages: ChatMessage[];
    total: number;
  };
}

// Dữ liệu trả về từ API sau khi gửi message
export interface SendMessageResponse {
  sendMessage: ChatMessage;
}

// Dữ liệu trả về từ API lấy danh sách người dùng (để tạo chat)
export interface User {
  id: string;
  name: string;
}

export interface GetAllUsersResponse {
  getAllUsers: User[];
}
