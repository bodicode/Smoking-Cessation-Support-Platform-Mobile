import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FeedService } from "@/services/newFeedService";
import { SafeAreaView } from "react-native-safe-area-context";
import CommentList from "@/components/feed/CommentList";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function ForumScreen() {
  const { user } = useAuth();

  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const fetchFeed = async (newPage = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await FeedService.getFeed({ page: newPage, limit: 10 }, {});
      setHasNext(res.hasNext);

      if (isRefresh || newPage === 1) setFeed(res.data);
      else setFeed((prev) => [...prev, ...res.data]);
      setPage(res.page);
    } catch (e) {
      // handle error
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => fetchFeed(1, true);
  const onEndReached = () => {
    if (hasNext && !loading) fetchFeed(page + 1);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => setSelectedPostId(item.id)}
    >
      <View style={styles.card}>
        <View style={styles.userRow}>
          {item.user_badge.user.avatar_url ? (
            <Image
              source={{ uri: item.user_badge.user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <MaterialCommunityIcons
              name="account"
              size={28}
              color="#bdbdbd"
              style={styles.avatarFallback}
            />
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.userTopRow}>
              <Text style={styles.name}>{item.user_badge.user.name}</Text>
              {item.user_badge.badge && (
                <Image
                  source={{ uri: item.user_badge.badge.icon_url }}
                  style={styles.badge}
                />
              )}
            </View>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.caption}>{item.caption}</Text>

        <View style={styles.divider} />
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.iconRow}>
            <Ionicons name="heart-outline" size={20} color="#16F2A8" />
            <Text style={styles.footerText}>{item.likes_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconRow}
            onPress={() => setSelectedPostId(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#557" />
            <Text style={styles.footerText}>{item.comments_count}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
      <HomeHeader user={user} />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16F2A8" />
        </View>
      ) : feed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={64}
            color="#b5bbc7"
          />
          <Text style={styles.emptyText}>Chưa có bài viết nào!</Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MODAL COMMENT NẰM GIỮA */}
      <Modal
        visible={!!selectedPostId}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPostId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Nút đóng */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedPostId(null)}
              hitSlop={12}
            >
              <Ionicons name="close" size={32} color="#222" />
            </TouchableOpacity>
            {/* CommentList (có thể custom height để không tràn) */}
            <View style={{ flex: 1, paddingTop: 12 }}>
              <CommentList postId={selectedPostId!} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatTime(str: string) {
  const date = new Date(str);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFDFF",
    borderRadius: 20,
    marginBottom: 20,
    padding: 18,
    shadowColor: "#1E2944",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#eef2fb",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e9ecf5",
    borderWidth: 1.6,
    borderColor: "#D8E5F2",
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0e6ed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.6,
    borderColor: "#D8E5F2",
    marginRight: 10,
    padding: 4,
  },
  badge: {
    width: 25,
    height: 25,
    marginLeft: 7,
    borderRadius: 13,
    backgroundColor: "#EAFBF3",
    borderWidth: 1,
    borderColor: "#C4E7DD",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16.8,
    color: "#1E2944",
    marginRight: 7,
    letterSpacing: 0.15,
  },
  time: {
    color: "#A6B0C1",
    fontSize: 13.4,
    marginTop: 2,
    fontWeight: "500",
    letterSpacing: 0.07,
  },
  caption: {
    fontSize: 16.2,
    color: "#212936",
    marginBottom: 12,
    marginTop: 6,
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F1F3",
    marginVertical: 7,
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 7,
    gap: 18,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 14,
  },
  footerText: {
    color: "#3ab58d",
    fontSize: 15,
    marginLeft: 6,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#b5bbc7",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "600",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,40,50,0.22)",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  modalContent: {
    width: width * 0.96,
    maxHeight: height * 0.82,
    minHeight: height * 0.34,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#222",
    shadowOpacity: 0.17,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 13,
    position: "relative",
    alignItems: "stretch",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#F1F1F3",
    borderRadius: 999,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
