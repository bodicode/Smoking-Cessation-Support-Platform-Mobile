import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { ChatService } from "@/services/chatService";
import { SubscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { IChatRoom } from "@/types/api/chat";
import { Alert } from "react-native";

interface ChatBubbleRNProps {}

const ChatBubbleRN: React.FC<ChatBubbleRNProps> = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [loadingChatRoom, setLoadingChatRoom] = useState(true);
  const [chatRoomFound, setChatRoomFound] = useState<IChatRoom | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    const fetchUserChatRoom = async () => {
      if (!user || userLoading) {
        setLoadingChatRoom(true);
        return;
      }

      setLoadingChatRoom(true);
      try {
        // Lấy tất cả chat rooms với lịch sử
        const rooms = await ChatService.getAllChatRoomsWithHistory();

        if (rooms && rooms.length > 0) {
          setChatRoomFound(rooms[0]);
        } else {
          setChatRoomFound(null);
        }
      } catch (error) {
        setChatRoomFound(null);
      } finally {
        setLoadingChatRoom(false);
      }
    };

    fetchUserChatRoom();
  }, [user, userLoading]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || userLoading) {
        setSubscriptionLoading(true);
        return;
      }

      try {
        setSubscriptionLoading(true);
        const hasActiveSub = await SubscriptionService.hasActiveSubscription();
        setHasSubscription(hasActiveSub);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user, userLoading]);

  const handlePress = () => {
    if (loadingChatRoom || userLoading) {
      Alert.alert(
        "Thông báo",
        "Đang tải dữ liệu phòng chat, vui lòng đợi một chút."
      );
      return;
    }

    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để sử dụng tính năng chat."
      );
      router.push("/(auth)/login");
      return;
    }

    // Luôn navigate đến màn hình chat rooms list
    router.push("/chat");
  };

  if (userLoading || loadingChatRoom || subscriptionLoading) {
    return (
      <View style={styles.chatBubble}>
        <ActivityIndicator size="small" color={COLORS.light.WHITE} />
      </View>
    );
  }

  if (!user) {
    return null;
  }



  // Chỉ hiển thị ChatBubble khi user đã đăng nhập
  if (!user) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.chatBubble}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chatbubbles" size={30} color={COLORS.light.WHITE} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatBubble: {
    position: "absolute",
    bottom: 30,
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
});

export default ChatBubbleRN;
