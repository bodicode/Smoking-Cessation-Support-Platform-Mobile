import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Alert,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FeedService } from "@/services/newFeedService";
import CommentList from "@/components/feed/CommentList";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import ShareBadgeModal from "@/components/feed/ShareBadgeModal";
import { BadgeService } from "@/services/badgeService";
import { FeedItem } from "@/types/api/newFeed";
import { UserBadge } from "@/types/api/badge";
import COLORS from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

export default function ForumScreen() {
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedItem | null>(null);
  const [newCaption, setNewCaption] = useState("");
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [likerFetchLoading, setLikerFetchLoading] = useState<
    Record<string, boolean>
  >({});

  const fetchFeed = useCallback(
    async (newPage = 1, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await FeedService.getFeed({ page: newPage, limit: 10 }, {});
        setHasNext(res.hasNext);

        const newFeedItems = res.data;

        if (isRefresh || newPage === 1) {
          setFeed(newFeedItems);
        } else {
          setFeed((prev) => [...prev, ...newFeedItems]);
        }
        setPage(res.page);

        const newLikedPosts: Record<string, boolean> = {};
        if (user) {
          const newLikedPosts: Record<string, boolean> = {};
          const fetchLikersPromises = newFeedItems.map(async (item) => {
            setLikerFetchLoading((prev) => ({ ...prev, [item.id]: true }));
            try {
              const likers = await FeedService.getPostLikers(item.id);
              const isLikedByMe = likers.some(
                (liker: any) => liker.user.id === user.id
              );
              newLikedPosts[item.id] = isLikedByMe;
            } catch (error) {
              newLikedPosts[item.id] = false;
            } finally {
              setLikerFetchLoading((prev) => ({ ...prev, [item.id]: false }));
            }
          });

          await Promise.allSettled(fetchLikersPromises);
          setLikedPosts((prev) => ({ ...prev, ...newLikedPosts }));

          await Promise.allSettled(fetchLikersPromises);
        }

        setLikedPosts((prev) => ({ ...prev, ...newLikedPosts }));
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Lỗi tải bảng tin",
          text2: "Không thể tải danh sách bài viết. Vui lòng thử lại.",
        });
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [user]
  );

  if (user) {
  }
  const fetchUserBadges = async () => {
    if (!user) return;
    try {
      const res = await BadgeService.getMyAwardedBadges();
      if (res && (res as any).data) {
        setUserBadges((res as any).data);
      } else {
        setUserBadges(res as UserBadge[]);
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Lỗi tải huy hiệu",
        text2: "Không thể tải danh sách huy hiệu của bạn.",
      });
      setIsShareModalVisible(false);
    }
  };

  const handleShareBadge = async (userBadgeId: string, caption: string) => {
    setSharingLoading(true);
    try {
      const newPost = await FeedService.shareBadge(userBadgeId, caption);
      setFeed((prev) => [newPost, ...prev]);
      setLikedPosts((prev) => ({ ...prev, [newPost.id]: false }));
      setLikerFetchLoading((prev) => ({ ...prev, [newPost.id]: false }));
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      Toast.show({
        type: "success",
        text1: "Chia sẻ thành công!",
        text2: "Bài viết của bạn đã được đăng lên bảng tin.",
      });
    } catch (e: any) {
      let toastText1 = "Chia sẻ thất bại";
      let toastText2 = "Đã xảy ra lỗi khi đăng bài. Vui lòng thử lại sau.";
      let toastType: "error" | "info" | "success" = "error";

      if (e.message && e.message.includes("already been shared")) {
        toastType = "info";
        toastText1 = "Huy hiệu đã được chia sẻ";
        toastText2 = "Bạn đã chia sẻ huy hiệu này trước đó.";
      }

      Toast.show({
        type: toastType,
        text1: toastText1,
        text2: toastText2,
      });
    } finally {
      setIsShareModalVisible(false);
      setSharingLoading(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      "Xác nhận xóa bài viết",
      "Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setDeletingPostId(postId);
            try {
              const result = await FeedService.removeSharedPost(postId);

              if (result && (result as any).is_deleted) {
                setFeed((prevFeed) =>
                  prevFeed.filter((post) => post.id !== postId)
                );
                setLikedPosts((prev) => {
                  const newState = { ...prev };
                  delete newState[postId];
                  return newState;
                });
                Toast.show({
                  type: "success",
                  text1: "Đã xóa bài viết!",
                  text2: "Bài viết của bạn đã được gỡ bỏ khỏi bảng tin.",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Xóa thất bại",
                  text2: "Không thể xóa bài viết. Vui lòng thử lại.",
                });
              }
            } catch (e) {
              Toast.show({
                type: "error",
                text1: "Lỗi!",
                text2: "Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng thử lại.",
              });
            } finally {
              setDeletingPostId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditPost = (post: FeedItem) => {
    setEditingPost(post);
    setNewCaption(post.caption);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    setIsEditingLoading(true);
    try {
      const updatedPost = await FeedService.updateSharedPostCaption(
        editingPost.id,
        newCaption
      );

      setFeed((prevFeed) =>
        prevFeed.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        )
      );

      Toast.show({
        type: "success",
        text1: "Cập nhật thành công!",
        text2: "Caption của bài viết đã được cập nhật.",
      });

      setIsEditModalVisible(false);
      setEditingPost(null);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Lỗi cập nhật",
        text2: "Không thể lưu thay đổi. Vui lòng thử lại.",
      });
    } finally {
      setIsEditingLoading(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: "Vui lòng đăng nhập",
        text2: "Bạn cần đăng nhập để thích bài viết.",
        position: "bottom",
      });
      return;
    }

    if (likingPostId) return;
    setLikingPostId(postId); // vẫn set để chặn spam, nhưng không dùng để show loading

    const isCurrentlyLiked = likedPosts[postId];
    const action = isCurrentlyLiked
      ? FeedService.unlikePost
      : FeedService.likePost;

    // Optimistic update: đổi trạng thái và số lượng like ngay lập tức
    setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setFeed((prevFeed) =>
      prevFeed.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: post.likes_count + (isCurrentlyLiked ? -1 : 1),
            }
          : post
      )
    );

    try {
      await action(postId);
    } catch (e) {
      // Nếu lỗi, revert lại trạng thái
      setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setFeed((prevFeed) =>
        prevFeed.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: post.likes_count + (isCurrentlyLiked ? 1 : -1),
              }
            : post
        )
      );
      Toast.show({
        type: "error",
        text1: `Thao tác thất bại`,
        text2: "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    } finally {
      setLikingPostId(null);
    }
  };

  const handleOpenCommentModal = useCallback(
    (postId: string) => {
      if (!user) {
        Toast.show({
          type: "info",
          text1: "Vui lòng đăng nhập",
          text2: "Hãy đăng nhập để xem và bình luận về bài viết này.",
          position: "bottom",
        });
        return;
      }
      setSelectedPostId(postId);
    },
    [user]
  );

  useEffect(() => {
    fetchFeed();
    fetchUserBadges();
  }, [user, fetchFeed]);

  const onRefresh = () => {
    fetchFeed(1, true);
    fetchUserBadges();
  };

  const onEndReached = () => {
    if (hasNext && !loading) fetchFeed(page + 1);
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    const isMyPost = item.user_badge?.user?.id === user?.id;
    const isDeleting = deletingPostId === item.id;
    const isLiked = likedPosts[item.id];
    const isLiking = likingPostId === item.id;
    const isFetchingLikers = likerFetchLoading[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => handleOpenCommentModal(item.id)}
      >
        <View style={styles.card}>
          <View style={styles.userRow}>
            {item.user_badge?.user?.avatar_url ? (
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
                {item.user_badge?.badge?.icon_url && (
                  <Text style={styles.name}>
                    {item.user_badge.user.name || "Người dùng ẩn danh"}
                  </Text>
                )}

                {item.user_badge?.badge?.icon_url && (
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
            <TouchableOpacity
              style={styles.iconRow}
              onPress={() => handleToggleLike(item.id)}
              disabled={isLiking || isFetchingLikers}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? COLORS.light.red : COLORS.light.green}
              />
              <Text
                style={[
                  styles.footerText,
                  { color: isLiked ? COLORS.light.red : COLORS.light.green },
                ]}
              >
                {item.likes_count}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconRow}
              onPress={() => handleOpenCommentModal(item.id)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#557" />
              <Text style={styles.footerText}>{item.comments_count}</Text>
            </TouchableOpacity>

            {isMyPost && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditPost(item)}
                >
                  <Ionicons name="create-outline" size={24} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePost(item.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#e74c3c" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
      <HomeHeader user={user} />

      <View style={styles.shareBadgeContainer}>
        <TouchableOpacity
          style={styles.shareBadgeButton}
          onPress={() => setIsShareModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={22} color="#fff" />
          <Text style={styles.shareBadgeButtonText}>Chia sẻ huy hiệu</Text>
        </TouchableOpacity>
      </View>

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
          ref={flatListRef}
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

      <Modal
        visible={!!selectedPostId}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPostId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedPostId(null)}
              hitSlop={12}
            >
              <Ionicons name="close" size={32} color="#222" />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingTop: 12 }}>
              <CommentList postId={selectedPostId!} />
            </View>
          </View>
        </View>
      </Modal>

      <ShareBadgeModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        userBadges={userBadges}
        onShare={handleShareBadge}
        loading={sharingLoading}
      />

      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>Chỉnh sửa bài viết</Text>
            <TextInput
              style={styles.captionInput}
              value={newCaption}
              onChangeText={setNewCaption}
              placeholder="Nhập nội dung mới..."
              multiline
              textAlignVertical="top"
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editButtonModal, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isEditingLoading}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButtonModal, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isEditingLoading || newCaption.trim() === ""}
              >
                {isEditingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatTime(str: string): string {
  const date = new Date(str);

  if (isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,40,50,0.22)",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  modalContent: {
    width: width * 0.96,
    height: height * 0.6,
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
  shareBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shareBadgeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16F2A8",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 8,
  },
  shareBadgeButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#ffecec",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  editButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#e7f3ff",
  },
  editModalContent: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#1E2944",
  },
  captionInput: {
    minHeight: 120,
    maxHeight: 250,
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    lineHeight: 22,
    borderColor: "#e3e8f0",
    borderWidth: 1,
    color: "#212936",
    marginBottom: 20,
  },
  editModalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
  },
  editButtonModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f4f8",
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  saveButton: {
    backgroundColor: "#16F2A8",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});
