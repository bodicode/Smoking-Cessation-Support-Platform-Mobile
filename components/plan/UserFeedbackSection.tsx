import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";
import { FeedbackService } from "@/services/feedbackService";
import { IFeedback } from "@/types/api/feedback";
import FeedbackForm from "./FeedbackForm";

interface UserFeedbackSectionProps {
  templateId: string;
  user: any;
  onFeedbackChange: () => void;
}

const UserFeedbackSection: React.FC<UserFeedbackSectionProps> = ({
  templateId,
  user,
  onFeedbackChange,
}) => {
  const [userFeedback, setUserFeedback] = useState<IFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);

  const fetchUserFeedback = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const feedbacks = await FeedbackService.getFeedbacks({
        filters: { templateId, userId: user.id },
      });
      setUserFeedback(feedbacks.length > 0 ? feedbacks[0] : null);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải feedback của bạn.",
      });
      setUserFeedback(null);
    } finally {
      setLoading(false);
    }
  }, [templateId, user]);

  useEffect(() => {
    fetchUserFeedback();
  }, [fetchUserFeedback]);

  const handleFormSuccess = () => {
    setIsFormModalVisible(false);
    fetchUserFeedback();
    onFeedbackChange();
  };

  const handleDeleteFeedback = useCallback(async () => {
    if (!userFeedback) return;
    Alert.alert(
      "Xác nhận xoá",
      "Bạn có chắc chắn muốn xoá feedback này không? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xoá",
          onPress: async () => {
            try {
              await FeedbackService.deleteFeedback(userFeedback.id);
              Toast.show({
                type: "success",
                text1: "Đã xoá feedback thành công!",
              });
              setUserFeedback(null);
              onFeedbackChange();
            } catch (e: any) {
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
  }, [userFeedback, onFeedbackChange]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.light.ACTIVE} />
        <Text style={styles.loadingText}>Đang tải feedback của bạn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userFeedback ? (
        <View style={styles.feedbackCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Feedback của bạn</Text>
            <View style={styles.ratingContainer}>
              <Ionicons
                name="star"
                size={16}
                color={COLORS.light.PRIMARY_YELLOW}
              />
              <Text style={styles.ratingText}>{userFeedback.rating}/5</Text>
            </View>
          </View>
          <Text style={styles.content}>{userFeedback.content}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setIsFormModalVisible(true)}>
              <Ionicons
                name="pencil"
                size={20}
                color={COLORS.light.PRIMARY_BLUE}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteFeedback}>
              <Ionicons
                name="trash"
                size={20}
                color={COLORS.light.PRIMARY_RED}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsFormModalVisible(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={COLORS.light.BACKGROUND}
          />
          <Text style={styles.createButtonText}>Gửi phản hồi</Text>
        </TouchableOpacity>
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
              initialData={userFeedback || undefined}
              templateId={templateId}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormModalVisible(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.light.SUBTEXT,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "center",
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
  feedbackCard: {
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_BLUE,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
});

export default UserFeedbackSection;
