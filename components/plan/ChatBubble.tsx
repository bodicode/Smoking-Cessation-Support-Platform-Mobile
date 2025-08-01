import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { ChatService } from "@/services/chatService";
import { SubscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";

const ChatBubbleRN: React.FC = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();

  const [hasUnread, setHasUnread] = useState(false);
  const [hasRoom, setHasRoom] = useState(false);
  const [loadingChatRoom, setLoadingChatRoom] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    if (!user || userLoading || !hasSubscription) return;

    const fetchChatRooms = async () => {
      try {
        const rooms = await ChatService.getAllChatRoomsByUser();
        setHasRoom(rooms.length > 0);
        const anyUnread = rooms.some((room) => room.hasUnread);
        setHasUnread(anyUnread);
      } catch (error) {
        console.error("Error loading chat rooms:", error);
        setHasRoom(false);
        setHasUnread(false);
      } finally {
        setLoadingChatRoom(false);
      }
    };

    fetchChatRooms();
  }, [user, userLoading]);

  useEffect(() => {
    if (!user || userLoading) return;

    const checkSub = async () => {
      try {
        const hasActive = await SubscriptionService.hasActiveSubscription();
        setHasSubscription(hasActive);
      } catch (error) {
        console.error("Subscription check failed:", error);
        setHasSubscription(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSub();
  }, [user, userLoading]);

  const handlePress = () => {
    if (userLoading || loadingChatRoom) {
      Alert.alert("Thông báo", "Đang tải dữ liệu phòng chat, vui lòng đợi.");
      return;
    }

    if (!user) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để chat.");
      router.push("/(auth)/login");
      return;
    }

    router.push("/chat");
  };

  if (
    !user ||
    userLoading ||
    subscriptionLoading ||
    loadingChatRoom ||
    !hasSubscription ||
    !hasRoom
  ) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.chatBubble}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubbles" size={30} color={COLORS.light.WHITE} />
      {hasUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatBubble: {
    position: "absolute",
    bottom: 70,
    right: 25,
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    borderRadius: 35,
    width: 65,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.light.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 1000,
  },
  unreadDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
  },
});

export default ChatBubbleRN;
