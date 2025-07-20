import {
  ChatMessage,
  IChatRoom,
  ICreateChatRoomInput,
  CreateChatMessageInput,
  GetChatMessagesResponse,
  SendMessageResponse,
} from "@/types/api/chat";
import client from "@/libs/apollo-client";
import { CREATE_CHAT_ROOM_MUTATION } from "@/graphql/mutation/createChatRoom";
import { GET_CHAT_MESSAGES_QUERY } from "@/graphql/query/getChatMessage";
import { GET_ALL_CHAT_ROOMS_BY_USER_QUERY } from "@/graphql/query/getAllChatRooms";
import { CHAT_ROOM_MESSAGES_SUBSCRIPTION } from "@/graphql/subscription/chatMessage";
import { SEND_MESSAGE_MUTATION } from "@/graphql/mutation/sendMessage";

export const ChatService = {
  createChatRoom: async (input: ICreateChatRoomInput): Promise<IChatRoom> => {
    try {
      const { data, errors } = await client.mutate({
        mutation: CREATE_CHAT_ROOM_MUTATION,
        variables: { input },
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to create chat room due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.createChatRoom) {
        throw new Error("No data returned when creating chat room.");
      }

      return data.createChatRoom as IChatRoom;
    } catch (error) {
      throw error;
    }
  },

  getChatMessagesByRoomId: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const { data, errors } = await client.query<GetChatMessagesResponse>({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { roomId },
        fetchPolicy: "network-only",
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to get chat messages due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.getChatMessagesByRoomId) {
        return [];
      }

      return data.getChatMessagesByRoomId;
    } catch (error) {
      throw new Error("Không thể lấy tin nhắn chat.");
    }
  },

  getAllChatRoomsByUser: async (): Promise<IChatRoom[]> => {
    try {
      const { data, errors } = await client.query<{
        getAllChatRoomsByUser: IChatRoom[];
      }>({
        query: GET_ALL_CHAT_ROOMS_BY_USER_QUERY,
        fetchPolicy: "network-only",
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to get all chat rooms due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.getAllChatRoomsByUser) {
        return [];
      }

      return data.getAllChatRoomsByUser;
    } catch (error) {
      throw new Error("Không thể lấy danh sách phòng chat.");
    }
  },

  subscribeToChatMessages: (
    roomId: string,
    onMessageReceived: (message: ChatMessage) => void
  ): (() => void) => {
    const observable = client.subscribe({
      query: CHAT_ROOM_MESSAGES_SUBSCRIPTION,
      variables: { roomId },
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        if (data && data.chatRoomMessages) {
          onMessageReceived(data.chatRoomMessages);
        }
      },
      error: (err) => {
        console.error("Subscription error:", err);
      },
      complete: () => {
        console.log("Subscription completed.");
      },
    });

    return () => subscription.unsubscribe();
  },

  sendMessage: async (input: CreateChatMessageInput): Promise<ChatMessage> => {
    try {
      const { data, errors } = await client.mutate<SendMessageResponse>({
        mutation: SEND_MESSAGE_MUTATION,
        variables: { input },
      });

      if (errors) {
        const errorMessage = errors.map((err) => err.message).join(", ");
        throw new Error(
          `Failed to send message due to GraphQL errors: ${errorMessage}`
        );
      }

      if (!data || !data.sendMessage) {
        throw new Error("No data returned when sending message.");
      }

      return data.sendMessage;
    } catch (error) {
      throw new Error("Không thể gửi tin nhắn.");
    }
  },

  // Lấy tất cả chat rooms với lịch sử đầy đủ
  getAllChatRoomsWithHistory: async (): Promise<IChatRoom[]> => {
    try {
      // Lấy tất cả chat rooms
      const allRooms = await ChatService.getAllChatRoomsByUser();
      
      // Lấy messages cho từng room
      const roomsWithHistory = await Promise.all(
        allRooms.map(async (room) => {
          try {
            const messages = await ChatService.getChatMessagesByRoomId(room.id);
            return {
              ...room,
              messages: messages,
              total_messages: messages.length,
              last_message: messages.length > 0 ? messages[messages.length - 1] : undefined,
            };
          } catch (error) {
            console.error(`Error fetching messages for room ${room.id}:`, error);
            return {
              ...room,
              messages: [],
              total_messages: 0,
              last_message: undefined,
            };
          }
        })
      );

      return roomsWithHistory;
    } catch (error) {
      console.error('Error in getAllChatRoomsWithHistory:', error);
      throw new Error("Không thể lấy lịch sử chat.");
    }
  },

  // Lấy chat room cụ thể với toàn bộ lịch sử
  getChatRoomWithHistory: async (roomId: string): Promise<IChatRoom | null> => {
    try {
      const allRooms = await ChatService.getAllChatRoomsByUser();
      const targetRoom = allRooms.find(room => room.id === roomId);
      
      if (!targetRoom) {
        return null;
      }

      const messages = await ChatService.getChatMessagesByRoomId(roomId);
      
      return {
        ...targetRoom,
        messages: messages,
        total_messages: messages.length,
        last_message: messages.length > 0 ? messages[messages.length - 1] : undefined,
      };
    } catch (error) {
      throw new Error("Không thể lấy lịch sử chat room.");
    }
  },
};
