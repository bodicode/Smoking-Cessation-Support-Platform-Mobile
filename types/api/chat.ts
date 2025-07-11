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
}

export interface CreateChatMessageInput {
  chat_room_id: string;
  content: string;
}

export interface ICreateChatRoomInput {
  receiver_id: string;
}

export interface User {
  id: string;
  name: string;
}

export interface GetChatMessagesResponse {
  getChatMessagesByRoomId: ChatMessage[];
}

export interface SendMessageResponse {
  sendMessage: ChatMessage;
}

export interface GetAllUsersResponse {
  getAllUsers: User[];
}
