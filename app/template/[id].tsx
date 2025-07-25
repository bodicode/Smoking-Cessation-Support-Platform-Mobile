import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { PlanTemplate } from "@/types/api/template";
import { PlanTemplateService } from "@/services/templatePlanService";
import { getLevelColor, translateLevel } from "@/utils";
import { IFeedback } from "@/types/api/feedback";
import { getFeedbacks } from "@/services/feedbackService";
import { CessationPlanService } from "@/services/myPlanService";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function PlanTemplateDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>();
  const { id } = route.params;
  const navigation = useNavigation();
  const router = useRouter();

  const [template, setTemplate] = useState<PlanTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [isCustom, setIsCustom] = useState(true);

  useEffect(() => {
    PlanTemplateService.getTemplateById(id)
      .then((data) => {
        setTemplate(data);
        if (data?.name) navigation.setOptions({ title: data.name });
      })
      .catch((error) => {
        console.error("Lỗi khi tải chi tiết kế hoạch:", error);
      })
      .finally(() => setLoading(false));

    const fetchFeedbacksForTemplate = async () => {
      try {
        setFeedbackLoading(true);
        const data = await getFeedbacks(
          id ? { filters: { templateId: id } } : {}
        );
        setFeedbacks(data);
      } catch (error: any) {
        console.error("Lỗi khi tải feedbacks:", error);
        setFeedbackError(error.message || "Không thể tải phản hồi.");
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedbacksForTemplate();
  }, [id, navigation]);

  const handleCreatePlan = async () => {
    try {
      const existingPlans = await CessationPlanService.getCessationPlans({
        params: { page: 1, limit: 10 },
        filters: {},
      });

      const hasActivePlan = existingPlans.some(
        (plan) => plan.status !== "COMPLETED"
      );

      if (hasActivePlan) {
        Toast.show({
          type: "info",
          text1: "Bạn đã có kế hoạch chưa hoàn thành",
          text2: "Hãy hoàn thành kế hoạch hiện tại trước khi tạo mới.",
        });
        setShowReasonInput(false);
        return;
      }

      if (!template) {
        Toast.show({
          type: "error",
          text1: "Không tìm thấy kế hoạch mẫu",
          text2: "Vui lòng thử lại sau.",
        });
        setShowReasonInput(false);
        return;
      }

      const today = new Date();
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + template.estimated_duration_days);

      await CessationPlanService.createCessationPlan({
        template_id: template.id,
        reason: reason.trim(),
        start_date: today.toISOString(),
        target_date: targetDate.toISOString(),
        is_custom: isCustom,
      });

      Toast.show({
        type: "success",
        text1: "Tạo kế hoạch thành công!",
      });
      setShowReasonInput(false);
      setReason("");
      router.push("/(tabs)/myPlan");
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Không thể tạo kế hoạch",
        text2: "Vui lòng thử lại sau.",
      });
      setShowReasonInput(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16F2A8" />
        <Text style={{ color: "#9ca3af", fontSize: 16, marginTop: 10 }}>
          Đang tải kế hoạch...
        </Text>
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>
          Không tìm thấy kế hoạch.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 0, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.levelLabel}>
          <Ionicons
            name="flash"
            size={17}
            color={getLevelColor(template.difficulty_level)}
          />
          <Text
            style={{
              color: getLevelColor(template.difficulty_level),
              fontWeight: "700",
              marginLeft: 6,
            }}
          >
            {`  ${translateLevel(template.difficulty_level)}`}
          </Text>
        </Text>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.desc}>{template.description}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-circle" size={22} color="#73B3FA" />
          <Text style={styles.infoMain}>Coach:</Text>
          <Text style={styles.infoSub}>{template.coach?.name || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={20} color="#FFB936" />
          <Text style={styles.infoMain}>
            {template.average_rating
              ? template.average_rating.toFixed(1)
              : "0.0"}
            /5
          </Text>
          <Text style={styles.infoSub}>
            ({template.total_reviews || 0} đánh giá)
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={20} color="#34D399" />
          <Text style={styles.infoMain}>Tỷ lệ thành công:</Text>
          <Text
            style={[styles.infoSub, { color: "#0C9775", fontWeight: "700" }]}
          >
            {template.success_rate
              ? (template.success_rate * 100).toFixed(1)
              : "0.0"}
            %
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color="#16F2A8" />
          <Text style={styles.infoMain}>Thời gian:</Text>
          <Text style={styles.infoSub}>
            {template.estimated_duration_days} ngày
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Các giai đoạn</Text>
      <View style={styles.timeline}>
        {template.stages.map((stage, idx) => (
          <View key={stage.id} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={styles.timelineDot} />
              {idx < template.stages.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.stageTitle}>
                {stage.stage_order}. {stage.title}
              </Text>
              <Text style={styles.stageDesc}>{stage.description}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="reader-outline"
                  size={14}
                  color="#276ef1"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.stageAction} numberOfLines={2}>
                  {stage.recommended_actions}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="hourglass-outline"
                  size={14}
                  color="#16a37a"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.stageDuration}>
                  {stage.duration_days} ngày
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Phản hồi</Text>
      <View style={styles.feedbacksSection}>
        {feedbackLoading ? (
          <View style={styles.centeredFeedback}>
            <ActivityIndicator size="small" color="#16F2A8" />
            <Text style={{ color: "#9ca3af", fontSize: 14, marginTop: 5 }}>
              Đang tải phản hồi...
            </Text>
          </View>
        ) : feedbackError ? (
          <View style={styles.centeredFeedback}>
            <Text style={{ color: "#ef4444", fontSize: 14 }}>
              {feedbackError}
            </Text>
          </View>
        ) : feedbacks.length === 0 ? (
          <View style={styles.centeredFeedback}>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              Chưa có phản hồi nào cho kế hoạch này.
            </Text>
          </View>
        ) : (
          feedbacks.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < feedback.rating ? "star" : "star-outline"}
                      size={16}
                      color="#FFB936"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <Text style={styles.feedbackRating}>{feedback.rating}/5</Text>
                </View>
                <Text style={styles.feedbackUser}>
                  {feedback.is_anonymous
                    ? "Ẩn danh"
                    : feedback.user?.name || "Người dùng không xác định"}
                </Text>
              </View>
              <Text style={styles.feedbackContent}>{feedback.content}</Text>
              <Text style={styles.feedbackDate}>
                {new Date(feedback.created_at).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.useButton}
          onPress={() => setShowReasonInput(true)}
        >
          <Text style={styles.buttonText}>Sử dụng kế hoạch này</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showReasonInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "500" }}>
                Cá nhân hóa
              </Text>
              <Switch
                value={isCustom}
                onValueChange={setIsCustom}
                trackColor={{ false: "#d1d5db", true: "#16F2A8" }}
                thumbColor={isCustom ? "#0E9F6E" : "#f4f3f4"}
              />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
              Nhập lý do bạn muốn bỏ thuốc
            </Text>

            <TextInput
              placeholder="Ví dụ: Vì sức khỏe của tôi và gia đình"
              style={styles.textInput}
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button
                color="#cccccc"
                title="Hủy"
                onPress={() => setShowReasonInput(false)}
              />
              <View style={{ width: 12 }} />
              <Button
                color="#16F2A8"
                title="Tạo kế hoạch"
                onPress={handleCreatePlan}
                disabled={!reason.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFC",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  hero: {
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 18,
    backgroundColor: "#E5F9F4",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "flex-start",
    elevation: 4,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  levelLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 9,
    letterSpacing: 0.3,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    color: "#0E9F6E",
  },
  title: {
    fontSize: 22.5,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 3,
    letterSpacing: 0.05,
    textShadowColor: "#e0f8e7",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  desc: {
    color: "#555",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    marginBottom: 2,
  },
  infoCard: {
    marginTop: -22,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    zIndex: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  infoMain: {
    fontWeight: "600",
    fontSize: 15.5,
    marginLeft: 10,
    color: "#253053",
    minWidth: 70,
  },
  infoSub: {
    fontWeight: "500",
    color: "#495467",
    marginLeft: 8,
    fontSize: 14.5,
  },
  sectionLabel: {
    marginHorizontal: 28,
    marginBottom: 6,
    marginTop: 20, // Tăng khoảng cách từ phần trên
    color: "#0CA678",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  timeline: {
    marginHorizontal: 10,
    marginTop: 6,
    paddingBottom: 24,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    backgroundColor: "#16F2A8",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E1F9F2",
    marginTop: 8,
  },
  timelineLine: {
    width: 3,
    height: 70,
    backgroundColor: "#E7F9F4",
    marginTop: 0,
    borderRadius: 3,
  },
  timelineContent: {
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 13,
    marginLeft: 2,
    minWidth: width * 0.7,
    elevation: 2,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 4 },
  },
  stageTitle: {
    fontWeight: "bold",
    fontSize: 15.3,
    color: "#297966",
    marginBottom: 3,
  },
  stageDesc: {
    color: "#657080",
    fontSize: 13.2,
    marginBottom: 2,
    fontWeight: "400",
  },
  stageAction: {
    color: "#276ef1",
    fontSize: 13.2,
    marginBottom: 0,
    flex: 1,
  },
  stageDuration: {
    fontSize: 13.1,
    color: "#16a37a",
    fontWeight: "600",
  },
  feedbacksSection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFB936",
    marginLeft: 4,
  },
  feedbackUser: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4a5568",
  },
  feedbackContent: {
    fontSize: 14.5,
    color: "#2d3748",
    lineHeight: 20,
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#718096",
    textAlign: "right",
  },
  centeredFeedback: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  buttonWrapper: {
    marginHorizontal: 28,
    marginTop: 10,
    marginBottom: 30,
  },
  useButton: {
    backgroundColor: "#16F2A8",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#16F2A8",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16.5,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14.5,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
