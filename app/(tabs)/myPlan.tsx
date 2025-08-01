import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ICessationPlan,
  ICessationPlanFiltersInput,
  IPaginationParamsInput,
} from "@/types/api/myPlan";
import { CessationPlanService } from "@/services/myPlanService";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";
import PlanCard from "@/components/plan/PlanCard";
import StageModalForm from "@/components/plan/StageModalForm";
import ChatBubbleRN from "@/components/plan/ChatBubble";
import UserFeedbackSection from "@/components/plan/UserFeedbackSection";

export default function CessationPlanListScreen() {
  const [plans, setPlans] = useState<ICessationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageInput, setStageInput] = useState({
    title: "",
    start_date: "",
    end_date: "",
    actions: "",
    description: "",
    stage_order: 0,
  });
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const currentUserId = user?.id;

  const fetchCessationPlans = useCallback(async () => {
    try {
      setLoading(true);
      const params: IPaginationParamsInput = {
        page: 1,
        limit: 10,
        orderBy: "created_at",
        sortOrder: "desc",
      };
      const filters: ICessationPlanFiltersInput = {
        user_id: currentUserId,
      };
      const data = await CessationPlanService.getCessationPlans({
        params,
        filters,
      });
      setPlans(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách kế hoạch.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Use useFocusEffect for fetching data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchCessationPlans();
      } else {
        setLoading(false);
      }
    }, [currentUserId, fetchCessationPlans]) // Add fetchCessationPlans to dependencies
  );

  const handleLoginPress = () => {
    router.push("/(auth)/login");
  };

  // Hàm này để gọi lại fetch plans khi feedback thay đổi
  const handleFeedbackChange = useCallback(() => {
    fetchCessationPlans();
  }, [fetchCessationPlans]);

  const toISOString = (dateStr: string) => {
    if (!dateStr) return "";
    // Đảm bảo định dạng ngày là YYYY-MM-DD để tạo ISO string chính xác
    return new Date(dateStr + "T00:00:00.000Z").toISOString();
  };

  const handleCreateStage = async () => {
    if (!selectedPlanId) return;

    const { title, start_date, end_date, actions, description, stage_order } =
      stageInput;

    if (
      !start_date ||
      !end_date ||
      !actions ||
      !description ||
      !title ||
      stage_order === 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ thông tin giai đoạn."
      );
      return;
    }

    if (
      isNaN(new Date(start_date).getTime()) ||
      isNaN(new Date(end_date).getTime())
    ) {
      Alert.alert(
        "Lỗi ngày",
        "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD."
      );
      return;
    }
    if (new Date(start_date) > new Date(end_date)) {
      Alert.alert("Lỗi ngày", "Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }

    try {
      setLoading(true);
      if (editingStageId) {
        await CessationPlanService.updateStage({
          id: editingStageId,
          title,
          start_date: toISOString(start_date),
          end_date: toISOString(end_date),
          actions,
          description,
          stage_order,
        });
        Toast.show({ type: "success", text1: "Cập nhật giai đoạn thành công" });
      } else {
        await CessationPlanService.createPlanStage({
          plan_id: selectedPlanId,
          title,
          start_date: toISOString(start_date),
          end_date: toISOString(end_date),
          actions,
          description,
          stage_order: stage_order,
        });
        Toast.show({ type: "success", text1: "Tạo giai đoạn mới thành công" });
      }
      setShowCreateModal(false);
      setStageInput({
        title: "",
        start_date: "",
        end_date: "",
        actions: "",
        description: "",
        stage_order: 0,
      });
      setEditingStageId(null);
      fetchCessationPlans(); // Re-fetch plans to update UI
    } catch (err: any) {
      setShowCreateModal(false);
      const message =
        err?.message?.includes("stage_order") ||
          err?.message?.includes("already exists")
          ? "Thứ tự giai đoạn này đã tồn tại."
          : "Không thể xử lý. Vui lòng thử lại.";
      Toast.show({
        type: "error",
        text1: "Lỗi khi cập nhật hoặc tạo giai đoạn",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    Alert.alert("Xác nhận xoá", "Bạn có chắc muốn xoá giai đoạn này không?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await CessationPlanService.removePlanStage(stageId);
            Toast.show({
              type: "success",
              text1: "Đã xoá giai đoạn thành công",
            });
            fetchCessationPlans(); // Re-fetch plans to update UI
          } catch (err) {
            Toast.show({ type: "error", text1: "Không thể xoá giai đoạn" });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleStatusChange = async (
    planId: string,
    newStatus:
      | "PLANNING"
      | "ACTIVE"
      | "PAUSED"
      | "COMPLETED"
      | "ABANDONED"
      | "CANCELLED"
  ) => {
    if (newStatus === null) return;
    try {
      setLoading(true);
      await CessationPlanService.updateCessationPlan({
        id: planId,
        status: newStatus,
      });
      fetchCessationPlans(); // Re-fetch plans to update UI
      Toast.show({ type: "success", text1: "Cập nhật trạng thái thành công" });
    } catch (error) {
      setError("Không thể cập nhật trạng thái kế hoạch.");
      Toast.show({ type: "error", text1: "Cập nhật trạng thái thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleStageStatusChange = async (
    stageId: string,
    newStatus: string
  ) => {
    if (newStatus === null) return;
    try {
      setLoading(true);
      await CessationPlanService.updateStage({
        id: stageId,
        status: newStatus,
      });
      fetchCessationPlans(); // Re-fetch plans to update UI
      Toast.show({ type: "success", text1: "Cập nhật trạng thái thành công" });
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái giai đoạn.");
      Toast.show({
        type: "error",
        text1: "Cập nhật trạng thái giai đoạn thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateStageModal = (plan: ICessationPlan) => {
    setSelectedPlanId(plan.id);
    setEditingStageId(null);
    setStageInput({
      title: "",
      start_date: "",
      end_date: "",
      actions: "",
      description: "",
      stage_order: (plan.stages.length || 0) + 1,
    });
    setShowCreateModal(true);
  };

  const handleOpenEditStageModal = (planId: string, stage: any) => {
    setSelectedPlanId(planId);
    setStageInput({
      title: stage.title,
      start_date: stage.start_date ? stage.start_date.slice(0, 10) : "",
      end_date: stage.end_date ? stage.end_date.slice(0, 10) : "",
      actions: stage.actions,
      description: stage.description,
      stage_order: stage.stage_order,
    });
    setEditingStageId(stage.id);
    setShowCreateModal(true);
  };

  const EmptyPlanListComponent = () => (
    <View style={styles.centeredContent}>
      <Ionicons
        name="document-text-outline"
        size={70}
        color={COLORS.light.SECONDARY_TEXT}
      />
      <Text style={styles.emptyText}>Bạn chưa có kế hoạch nào.</Text>
      <Text style={styles.emptySubText}>
        Hãy tạo một kế hoạch mới để bắt đầu hành trình cai thuốc của bạn!
      </Text>
      <TouchableOpacity
        style={styles.createPlanButton}
        onPress={() => router.push("/(tabs)/template")}
      >
        <Ionicons
          name="add-circle-outline"
          size={24}
          color={COLORS.light.WHITE}
        />
        <Text style={styles.createPlanButtonText}>Tạo kế hoạch mới</Text>
      </TouchableOpacity>
    </View>
  );

  const ListFooter = () => {
    if (plans.length > 0 && plans[0]?.id) {
      return (
        <View style={styles.feedbackManagerContainer}>
          <Text style={styles.feedbackSectionTitle}>Phản hồi về kế hoạch</Text>
          <UserFeedbackSection
            templateId={plans[0].template.id}
            user={user}
            onFeedbackChange={handleFeedbackChange}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <HomeHeader user={user} />
      {loading && !plans.length ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.light.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải kế hoạch...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={COLORS.light.ERROR}
          />
          <Text style={styles.errorText}>{error}</Text>
          {currentUserId && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchCessationPlans}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : !currentUserId ? (
        <View style={styles.centered}>
          <Ionicons
            name="log-in-outline"
            size={70}
            color={COLORS.light.SECONDARY_TEXT}
          />
          <Text style={styles.loginPromptText}>
            Chào mừng bạn đến với Kế hoạch cai thuốc!
          </Text>
          <Text style={styles.loginSubPromptText}>
            Để xem và quản lý các kế hoạch của mình, vui lòng đăng nhập.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <Text style={styles.loginHintText}>
            Bạn sẽ được chuyển hướng đến trang đăng nhập an toàn.
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              isExpanded={expandedPlanId === item.id}
              setExpandedPlanId={setExpandedPlanId}
              onStatusChange={handleStatusChange}
              onStageStatusChange={handleStageStatusChange}
              onEditStage={handleOpenEditStageModal}
              onDeleteStage={handleDeleteStage}
              onCreateNewStage={handleOpenCreateStageModal}
              onFeedbackChange={handleFeedbackChange}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyPlanListComponent}
          contentContainerStyle={styles.fullListContainer}
          style={styles.flatList}
        />
      )}
      <StageModalForm
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingStageId(null);
          setStageInput({
            title: "",
            start_date: "",
            end_date: "",
            actions: "",
            description: "",
            stage_order: 0,
          });
        }}
        initialData={editingStageId ? stageInput : undefined}
        isEditing={!!editingStageId}
        onSubmit={handleCreateStage}
        stageInput={stageInput}
        setStageInput={setStageInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BACKGROUND,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.light.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.light.PRIMARY_BLUE,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: COLORS.light.ERROR,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
    lineHeight: 25,
  },
  retryButton: {
    backgroundColor: COLORS.light.PRIMARY,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 25,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  retryButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 17,
    fontWeight: "bold",
  },
  loginPromptText: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginTop: 30,
    textAlign: "center",
    lineHeight: 34,
    paddingHorizontal: 10,
  },
  loginSubPromptText: {
    fontSize: 17,
    color: COLORS.light.SUBTEXT,
    marginTop: 12,
    textAlign: "center",
    marginHorizontal: 35,
    lineHeight: 26,
  },
  loginButton: {
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginTop: 35,
    shadowColor: COLORS.light.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  loginButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 19,
    fontWeight: "bold",
  },
  loginHintText: {
    fontSize: 14,
    color: COLORS.light.GRAY,
    marginTop: 18,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  flatList: {
    flex: 1,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
    paddingTop: 50,
  },
  fullListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 30,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 24,
    marginHorizontal: 25,
  },
  createPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.PRIMARY_GREEN,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 15,
    marginTop: 30,
    shadowColor: COLORS.light.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  createPlanButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 12,
  },
  feedbackManagerContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  feedbackSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginBottom: 15,
    textAlign: "center",
  },
});
