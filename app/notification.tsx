import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/api/notification";
import { useRouter, Stack } from "expo-router";
import COLORS from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getUserNotifications({ page: 1, limit: 20 });
      setNotifications(data.data);
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định khi lấy thông báo");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setMarking(true);
    setError(null);
    try {
      const ids = notifications.map((n) => n.id);
      await notificationService.markMultipleAsRead(ids);
      fetchNotifications();
    } catch (e: any) {
      setError(e?.message || "Lỗi không xác định khi đánh dấu đã đọc");
    }
    setMarking(false);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View
      style={[
        styles.notificationItem,
        item.status === "READ" && styles.notificationItemRead,
      ]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  const unreadCount = notifications.filter(n => n.status === "SENT").length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Thông báo" }} />
      <View style={styles.titleRow}>
        <TouchableOpacity onPress={handleMarkAllAsRead} disabled={marking} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>{marking ? "Đang đánh dấu..." : "Đánh dấu đã đọc"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noteBtn}
          onPress={() => router.push("/notification")}
          activeOpacity={0.85}
        >
          <Feather name="bell" size={26} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>Lỗi: {error}</Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light.BG },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.light.BG,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  markAllBtn: { padding: 8 },
  markAllText: { color: "#007AFF", fontWeight: "bold" },
  notificationItem: {
    backgroundColor: COLORS.light.BTN_BG,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  notificationItemRead: {
    backgroundColor: "#F0F0F0", // màu nền cho đã đọc
  },
  title: { fontSize: 16, fontWeight: "bold", color: COLORS.light.TEXT },
  content: { fontSize: 14, color: COLORS.light.TEXT, marginTop: 4 },
  date: { fontSize: 12, color: COLORS.light.TEXT, marginTop: 8 },
  noteBtn: {
    position: "relative",
    padding: 8,
  },
  badgeDot: {
    position: "absolute",
    top: 3,
    right: -1,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: COLORS.light.BG,
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default NotificationScreen; 