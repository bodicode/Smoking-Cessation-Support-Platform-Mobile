import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";
import { FeedbackService } from "@/services/feedbackService";
import {
  IFeedback,
  ICreateFeedbackInput,
  IUpdateFeedbackInput,
} from "@/types/api/feedback";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackFormProps {
  initialData?: IFeedback;
  templateId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  initialData,
  templateId,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(initialData?.rating?.toString() || "5");
  const [content, setContent] = useState(initialData?.content || "");
  const [isAnonymous, setIsAnonymous] = useState(
    initialData?.is_anonymous || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating?.toString() || "5");
      setContent(initialData.content || "");
    } else {
      setRating("5");
      setContent("");
      setIsAnonymous(false);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      Alert.alert("Lỗi", "Điểm đánh giá phải từ 1 đến 5.");
      return;
    }

    if (content.trim().length === 0) {
      Alert.alert("Lỗi", "Nội dung phản hồi không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        const updatePayload: IUpdateFeedbackInput = {
          rating: numRating,
          content: content.trim(),
        };
        await FeedbackService.updateFeedback(initialData.id, updatePayload);
        Toast.show({ type: "success", text1: "Cập nhật feedback thành công!" });
      } else {
        if (!templateId) {
          Alert.alert("Lỗi", "Không có ID template để tạo feedback.");
          return;
        }
        const createPayload: ICreateFeedbackInput = {
          rating: numRating,
          content: content.trim(),
          template_id: templateId,
          is_anonymous: isAnonymous,
        };
        await FeedbackService.createFeedback(createPayload);
        Toast.show({ type: "success", text1: "Tạo feedback thành công!" });
      }
      onSuccess();
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes(
          "You have already submitted active feedback for this template"
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Bạn đã gửi feedback rồi!",
          text2: "Vui lòng chỉnh sửa feedback hiện có của bạn.",
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi!",
          text2: error.message || "Không thể gửi feedback.",
        });
      }
      onCancel()
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={formStyles.container}>
      <Text style={formStyles.title}>
        {initialData ? "Chỉnh sửa Feedback" : "Gửi Feedback mới"}
      </Text>

      <Text style={formStyles.label}>Đánh giá (1-5):</Text>
      <TextInput
        style={formStyles.input}
        keyboardType="numeric"
        value={rating}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (text === "" || (!isNaN(num) && num >= 0 && num <= 5)) {
            setRating(text);
          }
        }}
        maxLength={1}
        placeholder="VD: 4"
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      <Text style={formStyles.label}>Nội dung phản hồi:</Text>
      <TextInput
        style={[formStyles.input, formStyles.textArea]}
        multiline
        numberOfLines={4}
        value={content}
        onChangeText={setContent}
        placeholder="Chia sẻ cảm nhận của bạn về kế hoạch..."
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      {/* Checkbox chỉ hiển thị khi tạo mới */}
      {!initialData && (
        <TouchableOpacity
          style={formStyles.checkboxContainer}
          onPress={() => setIsAnonymous(!isAnonymous)}
          disabled={isSubmitting}
        >
          <Ionicons
            name={isAnonymous ? "checkbox-outline" : "square-outline"}
            size={24}
            color={
              isAnonymous ? COLORS.light.PRIMARY_BLUE : COLORS.light.SUBTEXT
            }
          />
          <Text style={formStyles.checkboxLabel}>Gửi ẩn danh</Text>
        </TouchableOpacity>
      )}

      <View style={formStyles.buttonContainer}>
        <TouchableOpacity
          style={[formStyles.button, formStyles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={formStyles.buttonCancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[formStyles.button, formStyles.submitButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.light.BACKGROUND} />
          ) : (
            <Text style={formStyles.buttonSubmitText}>
              {initialData ? "Cập nhật" : "Gửi Feedback"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.BACKGROUND,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: COLORS.light.TEXT,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.light.TEXT,
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: COLORS.light.PRIMARY_BLUE,
  },
  cancelButton: {
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER,
  },
  buttonCancelText: {
    color: COLORS.light.SUBTEXT,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSubmitText: {
    color: COLORS.light.INACTIVE,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default function FeedbackManage({ templateId }: { templateId: string }) {
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(
    null
  );
  const [hasUserFeedback, setHasUserFeedback] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
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

      const currentUserHasSubmitted = data.some(
        (feedback) => feedback.user?.id === user?.id
      );
      setHasUserFeedback(currentUserHasSubmitted);
    } catch (e: any) {
      setError("Không thể tải feedback. Vui lòng thử lại.");
      Toast.show({ type: "error", text1: "Không thể tải feedback" });
    } finally {
      setLoading(false);
    }
  }, [templateId, user?.id]);

  useEffect(() => {
    if (templateId) {
      fetchFeedbacks();
    } else {
      setLoading(false);
      setError("Không có ID template được chọn để hiển thị feedback.");
    }
  }, [templateId, fetchFeedbacks]);

  const handleFormSuccess = () => {
    setIsFormModalVisible(false);
    setSelectedFeedback(null);
    fetchFeedbacks();
  };

  const handleDeleteFeedback = useCallback(
    (feedbackId: string) => {
      Alert.alert(
        "Xác nhận xoá",
        "Bạn có chắc chắn muốn xoá feedback này không? Hành động này không thể hoàn tác.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xoá",
            onPress: async () => {
              try {
                await FeedbackService.deleteFeedback(feedbackId);
                Toast.show({
                  type: "success",
                  text1: "Đã xoá feedback thành công!",
                });
                fetchFeedbacks();
              } catch (e: any) {
                console.error("Error deleting feedback:", e);
                Toast.show({
                  type: "error",
                  text1: "Xoá thất bại",
                  text2: e.message || "Vui lòng thử lại.",
                });
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    },
    [fetchFeedbacks]
  );

  const openEditModal = (feedback: IFeedback) => {
    setSelectedFeedback(feedback);
    setIsFormModalVisible(true);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Nút gửi/chỉnh sửa feedback */}
        {user && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              if (hasUserFeedback) {
                const userFeedback = feedbacks.find(
                  (feedback) => feedback.user?.id === user.id
                );
                if (userFeedback) {
                  openEditModal(userFeedback);
                }
              } else {
                setSelectedFeedback(null);
                setIsFormModalVisible(true);
              }
            }}
          >
            <Ionicons
              name={hasUserFeedback ? "pencil-outline" : "add-circle-outline"}
              size={20}
              color={COLORS.light.BACKGROUND}
            />
            <Text style={styles.createButtonText}>
              {hasUserFeedback ? "Chỉnh sửa feedback của bạn" : "Gửi phản hồi"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {feedbacks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={60}
            color={COLORS.light.SUBTEXT}
          />
          <Text style={styles.emptyStateText}>Chưa có feedback nào.</Text>
          {/* Chỉ hiển thị subtext nếu người dùng chưa có feedback và có thể tạo */}
          {user && !hasUserFeedback && (
            <Text style={styles.emptyStateSubText}>
              Hãy là người đầu tiên gửi feedback!
            </Text>
          )}
        </View>
      ) : (
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

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={COLORS.light.PRIMARY_BLUE}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteFeedback(item.id)}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={COLORS.light.PRIMARY_RED}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      )}

      <Modal
        visible={isFormModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFormModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFormModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <FeedbackForm
              initialData={selectedFeedback || undefined}
              templateId={templateId}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormModalVisible(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.light.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  createButton: {
    flexDirection: "row",
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: COLORS.light.BACKGROUND,
    marginLeft: 8,
    fontWeight: "bold",
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
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.BORDER,
    paddingTop: 10,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BACKGROUND,
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
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    marginTop: 5,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.light.BACKGROUND,
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
