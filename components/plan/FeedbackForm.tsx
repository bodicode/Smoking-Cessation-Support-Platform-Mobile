import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";
import { FeedbackService } from "@/services/feedbackService";
import {
  IFeedback,
  ICreateFeedbackInput,
  IUpdateFeedbackInput,
} from "@/types/api/feedback";

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
      setIsAnonymous(initialData.is_anonymous || false);
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
      console.log("Feedback create error:", error); // log out error
      let errorMsg = "";
      if (error?.message) {
        errorMsg = error.message;
      } else if (typeof error === "string") {
        errorMsg = error;
      }
      if (
        errorMsg.includes(
          "You have already submitted active feedback for this template"
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Bạn đã gửi feedback rồi!",
          text2: "Vui lòng chỉnh sửa feedback hiện có của bạn.",
          visibilityTime: 4000,
        });
      } else if (
        errorMsg.includes(
          "You can only provide feedback for templates from plans where you have completed at least one stage"
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Phải hoàn thành ít nhất 1 giai đoạn",
        });
      } else if (errorMsg) {
        Toast.show({
          type: "error",
          text1: "Lỗi!",
          text2: errorMsg,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi!",
          text2: "Không thể gửi feedback.",
        });
      }
      onCancel();
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

export default FeedbackForm;
