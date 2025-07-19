import { useAuth } from "@/contexts/AuthContext";
import { ChatService } from "@/services/chatService";
import { ChatMessage } from "@/types/api/chat";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useLocalSearchParams, useNavigation } from "expo-router";

function ChatScreen() {
  const { chatRoomId, otherParticipantName } = useLocalSearchParams<{
    chatRoomId?: string;
    otherParticipantName?: string;
  }>();
  const navigation = useNavigation();

  const { user, loading: userLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({
      title: "Đoạn chat",
      headerShown: true,
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: "#007AFF",
      },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    });
  }, [navigation]);

  useEffect(() => {
    const loadMessagesAndSubscribe = async () => {
      if (!chatRoomId) {
        setLoadingMessages(false);
        return;
      }

      setLoadingMessages(true);
      try {
        const fetchedMessages = await ChatService.getChatMessagesByRoomId(
          chatRoomId
        );
        const mutableFetchedMessages = JSON.parse(
          JSON.stringify(fetchedMessages)
        );
        setMessages(
          mutableFetchedMessages.sort(
            (a: ChatMessage, b: ChatMessage) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
        );
      } catch (error) {
      } finally {
        setLoadingMessages(false);
      }

      const unsubscribe = ChatService.subscribeToChatMessages(
        chatRoomId,
        (msg) => {
          setMessages((prev) => {
            const mutableMsg = JSON.parse(JSON.stringify(msg));
            const isSentByMe =
              String(mutableMsg.sender?.id) === String(user?.id);
            let updatedMessages = [...prev];

            if (isSentByMe) {
              let tempMessageIndex = updatedMessages.findIndex(
                (m) =>
                  m.id.startsWith("temp-") && m.content === mutableMsg.content
              );

              if (tempMessageIndex !== -1) {
                updatedMessages[tempMessageIndex] = mutableMsg;
              } else {
                if (!updatedMessages.some((m) => m.id === mutableMsg.id)) {
                  updatedMessages.push(mutableMsg);
                }
              }
            } else {
              if (!updatedMessages.some((m) => m.id === mutableMsg.id)) {
                updatedMessages.push(mutableMsg);
              }
            }

            return updatedMessages.sort(
              (a: ChatMessage, b: ChatMessage) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });
        }
      );

      return () => {
        unsubscribe();
      };
    };

    loadMessagesAndSubscribe();
  }, [chatRoomId, user]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || !chatRoomId) {
      return;
    }

    setSendingMessage(true);
    const tempSessionId = `temp-session-${Date.now()}`;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      sender: { id: user.id, name: user.name || "Bạn" },
      chat_room: {
        id: chatRoomId,
        creator: { name: otherParticipantName || "Người nhận" },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: true,
      session_id: tempSessionId,
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage("");

    try {
      await ChatService.sendMessage({
        chat_room_id: chatRoomId,
        content: tempMessage.content,
      });
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== tempMessage.id)
      );
    } finally {
      setSendingMessage(false);
    }
  };

  if (userLoading || loadingMessages) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Vui lòng đăng nhập để xem chat.</Text>
      </View>
    );
  }

  if (!chatRoomId && !loadingMessages) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Không tìm thấy phòng chat. Vui lòng thử lại.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderText}>
            {otherParticipantName || "Trò chuyện"}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isCurrentUser =
              user && String(item.sender?.id) === String(user.id);

            return (
              <View
                style={[
                  styles.messageBubble,
                  isCurrentUser ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageContent,
                    isCurrentUser
                      ? styles.myMessageText
                      : styles.otherMessageText,
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isCurrentUser
                      ? styles.myMessageTime
                      : styles.otherMessageTime,
                  ]}
                >
                  {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.messageListContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Nhập tin nhắn của bạn..."
            placeholderTextColor="#999"
            editable={!sendingMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  chatHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 5,
  },
  myMessageText: {
    color: "white",
    fontSize: 15,
  },
  otherMessageText: {
    color: "#333",
    fontSize: 15,
  },
  messageContent: {
    fontSize: 15,
    marginBottom: 3,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 2,
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
  },
  otherMessageTime: {
    color: "#666",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "white",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});
