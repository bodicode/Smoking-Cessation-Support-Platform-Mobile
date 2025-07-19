import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";
import { FeedbackService } from "@/services/feedbackService";
import { IFeedback } from "@/types/api/feedback";

interface AllFeedbacksListProps {
  templateId: string;
  refreshKey: number;
  currentUserId: string | null;
}

const AllFeedbacksList: React.FC<AllFeedbacksListProps> = ({
  templateId,
  refreshKey,
}) => {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FeedbackService.getFeedbacks({
        filters: { templateId: templateId },
        params: {
          limit: 20,
          page: 1,
          orderBy: "created_at",
          sortOrder: "desc",
        },
      });
      setFeedbacks(data);
    } catch (e: any) {
      setError("Không thể tải feedback. Vui lòng thử lại.");
      Toast.show({ type: "error", text1: "Không thể tải feedback" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      fetchFeedbacks();
    }
  }, [templateId, refreshKey]); // re-fetch khi refreshKey thay đổi

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
        <Text style={styles.loadingText}>Đang tải feedback...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={60}
          color={COLORS.light.SUBTEXT}
        />
        <Text style={styles.emptyStateText}>
          Chưa có feedback nào từ người dùng khác.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feedbacks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              {item.is_anonymous ? (
                <MaterialCommunityIcons
                  name="incognito"
                  size={28}
                  color="#9e9e9e"
                  style={styles.avatarFallback}
                />
              ) : item.user?.avatar_url ? (
                <Image
                  source={{
                    uri: item.user?.avatar_url,
                  }}
                  style={styles.avatar}
                  onError={(e) =>
                    console.log("Image load error:", e.nativeEvent.error)
                  }
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={28}
                  color="#bdbdbd"
                  style={styles.avatarFallback}
                />
              )}
              <Text style={styles.userName}>
                {item.is_anonymous
                  ? "Người dùng ẩn danh"
                  : item.user?.name || "Người dùng"}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons
                name="star"
                size={16}
                color={COLORS.light.PRIMARY_YELLOW}
              />
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          </View>
          <Text style={styles.content}>{item.content}</Text>
        </View>
      )}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    color: COLORS.light.SUBTEXT,
    marginTop: 10,
  },
  errorText: {
    color: COLORS.light.ERROR,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.SUBTEXT,
    marginTop: 15,
    textAlign: "center",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  feedbackCard: {
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.PRIMARY_YELLOW_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_YELLOW_DARK,
  },
  content: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: "#e0e6ed",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.6,
    borderColor: "#D8E5F2",
    padding: 0,
  },
});

export default AllFeedbacksList;
