import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { ICessationPlan } from "@/types/api/myPlan";
import { getStatusColor, translateStatus } from "@/utils";
import COLORS from "@/constants/Colors";
import ProgressRecordsList from "@/components/plan/ProgressRecordList";

interface PlanCardProps {
  plan: ICessationPlan;
  isExpanded: boolean;
  setExpandedPlanId: (id: string | null) => void;
  onStatusChange: (
    planId: string,
    newStatus:
      | "PLANNING"
      | "ACTIVE"
      | "PAUSED"
      | "COMPLETED"
      | "ABANDONED"
      | "CANCELLED"
  ) => void;
  onStageStatusChange: (stageId: string, newStatus: string) => void;
  onEditStage: (planId: string, stage: any) => void;
  onDeleteStage: (stageId: string) => void;
  onCreateNewStage: (plan: ICessationPlan) => void;
}

const getAllowedStatusItems = (currentStatus: string) => {
  const statusMap: Record<string, { label: string; value: string }[]> = {
    PLANNING: [{ label: "Thực hiện", value: "ACTIVE" }],
    ACTIVE: [
      { label: "Tạm dừng", value: "PAUSED" },
      { label: "Hoàn thành", value: "COMPLETED" },
      { label: "Từ bỏ", value: "ABANDONED" },
      { label: "Đã hủy", value: "CANCELLED" },
    ],
    PAUSED: [
      { label: "Tiếp tục", value: "ACTIVE" },
      { label: "Từ bỏ", value: "ABANDONED" },
      { label: "Đã hủy", value: "CANCELLED" },
    ],
    COMPLETED: [],
    ABANDONED: [],
    CANCELLED: [],
  };

  const allowedItems = statusMap[currentStatus] || [];
  if (!allowedItems.find((item) => item.value === currentStatus)) {
    allowedItems.unshift({
      label: translateStatus(currentStatus),
      value: currentStatus,
    });
  }
  return allowedItems;
};

const getAllowedStageStatusItems = (currentStatus: string) => {
  const statusMap: Record<string, { label: string; value: string }[]> = {
    PENDING: [
      { label: "Đang thực hiện", value: "ACTIVE" },
      { label: "Bỏ qua", value: "SKIPPED" },
    ],
    ACTIVE: [
      { label: "Hoàn thành", value: "COMPLETED" },
      { label: "Bỏ qua", value: "SKIPPED" },
    ],
    SKIPPED: [],
    COMPLETED: [],
  };

  const allowedItems = statusMap[currentStatus.toUpperCase()] || [];
  if (!allowedItems.find((item) => item.value === currentStatus)) {
    allowedItems.unshift({
      label: translateStatus(currentStatus),
      value: currentStatus,
    });
  }
  return allowedItems;
};

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isExpanded,
  setExpandedPlanId,
  onStatusChange,
  onStageStatusChange,
  onEditStage,
  onDeleteStage,
  onCreateNewStage,
}) => {
  return (
    <View style={styles.planCard}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpandedPlanId(isExpanded ? null : plan.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {plan.template.name}
        </Text>
        <View style={styles.statusBadgeContainer}>
          {plan.is_custom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          )}
          {getAllowedStatusItems(plan.status).length > 0 ? (
            <RNPickerSelect
              value={plan.status}
              onValueChange={(value) => onStatusChange(plan.id, value)}
              items={getAllowedStatusItems(plan.status)}
              placeholder={{}}
              style={{
                inputIOS: {
                  fontSize: 13,
                  fontWeight: "700",
                  color: COLORS.light.WHITE,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 15,
                  backgroundColor: getStatusColor(plan.status),
                  overflow: "hidden",
                },
                inputAndroid: {
                  fontSize: 13,
                  fontWeight: "700",
                  color: COLORS.light.WHITE,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 15,
                  backgroundColor: getStatusColor(plan.status),
                },
                iconContainer: {
                  top: 9,
                  right: 12,
                },
              }}
              useNativeAndroidPickerStyle={false}
            />
          ) : (
            <Text
              style={[
                styles.planStatus,
                { backgroundColor: getStatusColor(plan.status) },
              ]}
            >
              {translateStatus(plan.status)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.cardReason} numberOfLines={2}>
        Lý do bắt đầu của bạn là {plan.reason}
      </Text>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${plan.completion_percentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {plan.completion_percentage.toFixed(0)}% hoàn thành
        </Text>
      </View>

      <View style={styles.cardInfoGrid}>
        <View style={[styles.cardInfoItem, styles.startDateItem]}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLORS.light.PRIMARY_BLUE}
          />
          <Text style={styles.cardInfoLabel}>Bắt đầu</Text>
          <Text style={[styles.cardInfoValue, styles.startDateValue]}>
            {new Date(plan.start_date).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View style={[styles.cardInfoItem, styles.targetDateItem]}>
          <Ionicons
            name="flag-outline"
            size={20}
            color={COLORS.light.PRIMARY_YELLOW}
          />
          <Text style={styles.cardInfoLabel}>Mục tiêu</Text>
          <Text style={[styles.cardInfoValue, styles.targetDateValue]}>
            {new Date(plan.target_date).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View
          style={[
            styles.cardInfoItem,
            styles.daysSinceStartItem,
            { width: "100%" },
          ]}
        >
          <Ionicons
            name="hourglass-outline"
            size={22}
            color={COLORS.light.ACTIVE}
          />
          <Text style={styles.cardInfoLabel}>Thời gian đã qua</Text>
          <Text style={[styles.cardInfoValue, styles.daysSinceStartValue]}>
            {plan.days_since_start} ngày
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.stagesToggle}
        onPress={() => setExpandedPlanId(isExpanded ? null : plan.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={22}
          color={COLORS.light.PRIMARY_BLUE}
        />
        <Text style={styles.stagesToggleText}>
          {isExpanded
            ? "Thu gọn giai đoạn"
            : `Xem ${plan.stages.length} giai đoạn`}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.detailedStagesContainer}>
          {plan.stages.length === 0 ? (
            <Text style={styles.noStagesText}>
              Chưa có giai đoạn nào cho kế hoạch này.
            </Text>
          ) : (
            plan.stages.map((stage) => (
              <View key={stage.id} style={styles.stageItem}>
                <Text style={styles.stageTitleText}>
                  <Text style={{ fontWeight: "bold" }}>
                    Giai đoạn {stage.stage_order}:{" "}
                  </Text>
                  {stage.title}
                </Text>
                <Text style={styles.stageActionText}>
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color={COLORS.light.YELLOW}
                  />{" "}
                  Hành động: {stage.actions}
                </Text>
                <View style={styles.stageInfoRow}>
                  <Text style={styles.stageDateText}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={COLORS.light.GRAY}
                    />{" "}
                    {stage.start_date
                      ? new Date(stage.start_date).toLocaleDateString("vi-VN")
                      : "Chưa có"}{" "}
                    -{" "}
                    {stage.end_date
                      ? new Date(stage.end_date).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </Text>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <RNPickerSelect
                      value={stage.status}
                      onValueChange={(value) =>
                        onStageStatusChange(stage.id, value)
                      }
                      items={getAllowedStageStatusItems(stage.status)}
                      placeholder={{}}
                      disabled={
                        getAllowedStageStatusItems(stage.status).length <= 1
                      }
                      style={{
                        inputIOS: {
                          fontSize: 13,
                          fontWeight: "700",
                          color: COLORS.light.WHITE,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 15,
                          backgroundColor: getStatusColor(stage.status),
                          overflow: "hidden",
                          textAlign: "center",
                        },
                        inputAndroid: {
                          fontSize: 13,
                          fontWeight: "700",
                          color: COLORS.light.WHITE,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 15,
                          backgroundColor: getStatusColor(stage.status),
                          textAlign: "center",
                        },
                        iconContainer: {
                          top: 8,
                          right: 12,
                        },
                      }}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                </View>
                {plan.is_custom && (
                  <View style={styles.stageActionsContainer}>
                    <TouchableOpacity
                      style={styles.stageActionButton}
                      onPress={() => onEditStage(plan.id, stage)}
                    >
                      <Text style={styles.stageActionButtonText}>
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.stageActionButton,
                        { backgroundColor: COLORS.light.ERROR },
                      ]}
                      onPress={() => onDeleteStage(stage.id)}
                    >
                      <Text style={styles.stageActionButtonText}>Xoá</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
          {plan.is_custom && (
            <TouchableOpacity
              style={styles.createStageButton}
              onPress={() => onCreateNewStage(plan)}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={COLORS.light.WHITE}
              />
              <Text style={styles.createStageButtonText}>
                Tạo giai đoạn mới
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isExpanded && (
        <ProgressRecordsList
          planId={plan.id}
          coachId={plan.template.coach_id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    borderWidth: 0.7,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.light.DARK_TEXT,
    flexShrink: 1,
    marginRight: 15,
    lineHeight: 30,
  },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customBadge: {
    backgroundColor: COLORS.light.BADGE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.light.BADGE,
  },
  customBadgeText: {
    color: COLORS.light.WHITE,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  planStatus: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.light.WHITE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  cardReason: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    marginBottom: 25,
    lineHeight: 24,
    fontStyle: "italic",
  },
  progressBarContainer: {
    marginBottom: 25,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.light.ACTIVE,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    textAlign: "right",
    marginTop: 10,
    fontWeight: "600",
  },
  cardInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 15,
  },
  cardInfoItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.WHITE,
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },
  startDateItem: {
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  targetDateItem: {
    borderColor: COLORS.light.PRIMARY_YELLOW,
  },
  daysSinceStartItem: {
    borderColor: COLORS.light.ACTIVE,
    width: "100%",
    justifyContent: "center",
  },
  cardInfoLabel: {
    fontSize: 15,
    color: COLORS.light.DARK_GREY_TEXT,
    marginLeft: 12,
    fontWeight: "600",
  },
  cardInfoValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: "auto",
    color: COLORS.light.DARK_TEXT,
  },
  startDateValue: {
    color: COLORS.light.PRIMARY_BLUE,
  },
  targetDateValue: {
    color: COLORS.light.PRIMARY_YELLOW,
  },
  daysSinceStartValue: {
    color: COLORS.light.ACTIVE,
  },
  stagesToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.BORDER,
    marginTop: 18,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 15,
  },
  stagesToggleText: {
    fontSize: 17,
    color: COLORS.light.PRIMARY_BLUE,
    fontWeight: "bold",
    marginLeft: 10,
  },
  detailedStagesContainer: {
    marginTop: 25,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.BORDER,
  },
  noStagesText: {
    textAlign: "center",
    color: COLORS.light.SUBTEXT,
    fontStyle: "italic",
    marginTop: 20,
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  stageItem: {
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 0.7,
    borderColor: COLORS.light.BORDER_GREY,
  },
  stageTitleText: {
    fontSize: 18,
    color: COLORS.light.DARK_TEXT,
    marginBottom: 10,
    lineHeight: 26,
  },
  stageActionText: {
    fontSize: 16,
    color: COLORS.light.DARK_GREY_TEXT,
    marginBottom: 12,
  },
  stageInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  stageDateText: {
    fontSize: 15,
    color: COLORS.light.GRAY,
    flexShrink: 1,
    marginRight: 15,
  },
  stageActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  stageActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.light.PRIMARY_BLUE,
  },
  stageActionButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  createStageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 25,
  },
  createStageButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 12,
  },
});

export default PlanCard;
