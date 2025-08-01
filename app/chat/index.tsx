import { useAuth } from "@/contexts/AuthContext";
import { ChatService } from "@/services/chatService";
import { IChatRoom } from "@/types/api/chat";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";

function ChatRoomsScreen() {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [chatRooms, setChatRooms] = useState<IChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user || userLoading) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        const rooms = await ChatService.getAllChatRoomsWithHistory();
        setChatRooms(rooms);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        setChatRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user, userLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const rooms = await ChatService.getAllChatRoomsWithHistory();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error refreshing chat rooms:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoomPress = (room: IChatRoom) => {
    // Logic đơn giản: Luôn hiển thị receiver name vì đây là chat với coach
    let displayName = room.receiver.name;

    // Nếu receiver name trống, thì dùng creator name
    if (!displayName || displayName.trim() === '') {
      displayName = room.creator.name || 'Coach';
    }

    // Nếu vẫn trống, dùng default
    if (!displayName || displayName.trim() === '') {
      displayName = 'Coach';
    }

    router.push({
      pathname: `/chat/${room.id}` as any,
      params: {
        otherParticipantName: displayName,
      },
    });
  };

  const formatLastMessage = (room: IChatRoom) => {
    if (!room.last_message) {
      return "Chưa có tin nhắn";
    }

    const content = room.last_message.content;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const renderChatRoom = ({ item: room }: { item: IChatRoom }) => {
    // Logic đơn giản: Luôn hiển thị receiver name vì đây là chat với coach
    let displayName = room.receiver.name;

    // Nếu receiver name trống, thì dùng creator name
    if (!displayName || displayName.trim() === '') {
      displayName = room.creator.name || 'Coach';
    }

    // Nếu vẫn trống, dùng default
    if (!displayName || displayName.trim() === '') {
      displayName = 'Coach';
    }



    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => handleRoomPress(room)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={50} color={COLORS.light.PRIMARY_BLUE} />
          {room.unread_count && room.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {room.unread_count > 99 ? "99+" : room.unread_count}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{displayName}</Text>
            {room.last_message && (
              <Text style={styles.lastMessageTime}>
                {formatTime(room.last_message.created_at)}
              </Text>
            )}
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {formatLastMessage(room)}
          </Text>

          <View style={styles.roomStats}>
            <Text style={styles.messageCount}>
              {room.total_messages || 0} tin nhắn
            </Text>
            <Text style={styles.roomDate}>
              Tạo: {new Date(room.created_at).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color={COLORS.light.SUBTEXT} />
      <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
      <Text style={styles.emptySubtitle}>
        Bắt đầu trò chuyện với Coach để được hỗ trợ trong hành trình cai thuốc
      </Text>
    </View>
  );

  if (userLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>Vui lòng đăng nhập để xem chat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.light.BACKGROUND} />

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.light.PRIMARY]}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
}

export default ChatRoomsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.light.BACKGROUND,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.light.WHITE,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  roomItem: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.light.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.light.SUBTEXT,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    marginBottom: 8,
  },
  roomStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  messageCount: {
    fontSize: 12,
    color: COLORS.light.PRIMARY,
    fontWeight: "500",
  },
  roomDate: {
    fontSize: 12,
    color: COLORS.light.SUBTEXT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.light.ERROR,
    textAlign: "center",
  },
});
