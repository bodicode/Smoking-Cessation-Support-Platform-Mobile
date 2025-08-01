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
import { GET_ALL_CHAT_ROOMS_BY_USER_QUERY } from "@/graphql/query/getAllChatRooms";
import { CHAT_ROOM_MESSAGES_SUBSCRIPTION } from "@/graphql/subscription/chatMessage";
import { SEND_MESSAGE_MUTATION } from "@/graphql/mutation/sendMessage";
import { GET_CHAT_MESSAGES_BY_ROOM_ID } from "@/graphql/query/getChatMessagesByRoomId";

export const ChatService = {
  createChatRoom: async (input: ICreateChatRoomInput): Promise<IChatRoom> => {
    try {
      const res = await client.mutate({
        mutation: CREATE_CHAT_ROOM_MUTATION,
        variables: { input },
      });

      if (res.errors) {
        throw new Error(res.errors.map(e => e.message).join(", "));
      }

      if (!res.data?.createChatRoom) {
        throw new Error("No data returned from createChatRoom.");
      }

      return res.data.createChatRoom;
    } catch (error) {
      console.error("Create chat room error:", error);
      throw error;
    }
  },

  getChatMessagesByRoomId: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      console.log("👉 Fetching messages for roomId:", roomId);
      const { data, errors } = await client.query<GetChatMessagesResponse>({
        query: GET_CHAT_MESSAGES_BY_ROOM_ID, // sửa đúng query
        variables: { roomId },
        fetchPolicy: "network-only",
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error(errors.map(e => e.message).join(", "));
      }

      if (!data || !data.getChatMessagesByRoomId) {
        console.warn("⚠️ No getChatMessagesByRoomId in response:", data);
        return [];
      }

      return data.getChatMessagesByRoomId.messages;
    } catch (error: any) {
      if (error.networkError) {
        console.error("❌ Network error:", error.networkError);
      }
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach((err: any) =>
          console.error("GraphQL Error:", err.message)
        );
      }
      console.error("Unexpected error fetching chat messages:", error);
      throw new Error("Không thể lấy tin nhắn chat.");
    }
  },

  getAllChatRoomsByUser: async (): Promise<IChatRoom[]> => {
    try {
      const { data, errors } = await client.query({
        query: GET_ALL_CHAT_ROOMS_BY_USER_QUERY,
        fetchPolicy: "network-only",
      });

      if (errors) {
        throw new Error(errors.map(e => e.message).join(", "));
      }

      return data?.getAllChatRoomsByUser || [];
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      throw new Error("Không thể lấy danh sách phòng chat.");
    }
  },

  subscribeToChatMessages: (
    roomId: string,
    onMessageReceived: (msg: ChatMessage) => void
  ) => {
    const observable = client.subscribe({
      query: CHAT_ROOM_MESSAGES_SUBSCRIPTION,
      variables: { roomId },
    });

    const subscription = observable.subscribe({
      next: ({ data }) => {
        if (data?.chatRoomMessages) {
          onMessageReceived(data.chatRoomMessages);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    return () => subscription.unsubscribe();
  },

  sendMessage: async (input: CreateChatMessageInput): Promise<ChatMessage> => {
    try {
      const res = await client.mutate<SendMessageResponse>({
        mutation: SEND_MESSAGE_MUTATION,
        variables: { input },
      });

      if (res.errors) {
        throw new Error(res.errors.map(e => e.message).join(", "));
      }

      if (!res.data?.sendMessage) {
        throw new Error("No message returned after sending.");
      }

      return res.data.sendMessage;
    } catch (error) {
      console.error("Send message error:", error);
      throw new Error("Không thể gửi tin nhắn.");
    }
  },

  getAllChatRoomsWithHistory: async (): Promise<IChatRoom[]> => {
    try {
      console.log("🔍 Loading all chat rooms with messages...");
      const allRooms = await ChatService.getAllChatRoomsByUser();

      const roomsWithHistory = await Promise.all(
        allRooms.map(async (room) => {
          try {
            const messages = await ChatService.getChatMessagesByRoomId(room.id);
            return {
              ...room,
              messages,
              total_messages: messages.length,
              last_message: messages.at(-1),
            };
          } catch (error) {
            console.warn(`⚠️ Could not fetch messages for room ${room.id}`);
            return { ...room, messages: [], total_messages: 0 };
          }
        })
      );

      return roomsWithHistory;
    } catch (error) {
      console.error("Error loading chat history:", error);
      throw new Error("Không thể lấy lịch sử chat.");
    }
  },

  getChatRoomWithHistory: async (roomId: string): Promise<IChatRoom | null> => {
    try {
      const allRooms = await ChatService.getAllChatRoomsByUser();
      const targetRoom = allRooms.find((room) => room.id === roomId);

      if (!targetRoom) return null;

      const messages = await ChatService.getChatMessagesByRoomId(roomId);

      return {
        ...targetRoom,
        messages,
        total_messages: messages.length,
        last_message: messages.at(-1),
      };
    } catch (error) {
      console.error("Error loading specific chat room:", error);
      throw new Error("Không thể lấy lịch sử phòng chat.");
    }
  },
};
