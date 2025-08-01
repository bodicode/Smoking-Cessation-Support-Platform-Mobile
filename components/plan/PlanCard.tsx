import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ICessationPlan } from "@/types/api/myPlan";
import { getStatusColor, translateStatus } from "@/utils";
import COLORS from "@/constants/Colors";
import ProgressRecordsList from "@/components/plan/ProgressRecordList";
import UserFeedbackSection from "./UserFeedbackSection";

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
  onFeedbackChange: () => void;
}

const getAllowedStatusItems = (currentStatus: string) => {
  const statusMap: Record<string, { label: string; value: string }[]> = {
    // PLANNING: [{ label: "Bắt đầu thực hiện", value: "ACTIVE" }],
    ACTIVE: [
      { label: "Hủy kế hoạch", value: "CANCELLED" },
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
    // PENDING: [
    //   { label: "Bắt đầu thực hiện", value: "ACTIVE" },
    //   { label: "Bỏ qua", value: "SKIPPED" },
    // ],
    ACTIVE: [
      { label: "Hoàn thành", value: "COMPLETED" },
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

function getStatusIcon(status: string) {
  switch (status) {
    case "ACTIVE": return "play-circle-outline";
    case "PLANNING": return "construct-outline";
    case "PAUSED": return "pause-circle-outline";
    case "COMPLETED": return "checkmark-circle-outline";
    case "ABANDONED": return "close-circle-outline";
    case "CANCELLED": return "remove-circle-outline";
    default: return "ellipse-outline";
  }
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isExpanded,
  setExpandedPlanId,
  onStatusChange,
  onStageStatusChange,
  onEditStage,
  onDeleteStage,
  onCreateNewStage,
  onFeedbackChange,
}) => {
  if (!plan) {
    return null;
  }

  const isCancelled = plan.status === "CANCELLED";

  return (
    <View style={[
      styles.planCard,
      isCancelled && styles.cancelledPlanCard
    ]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => !isCancelled && setExpandedPlanId(isExpanded ? null : plan.id)}
        activeOpacity={0.8}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {plan.template?.name || "Kế hoạch không có tên"}
          </Text>
          {plan.is_custom && !isCancelled && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Tùy chỉnh</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.statusBadgeContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.statusSectionLabel}>Trạng thái hiện tại:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plan.status) }]}>
            <Ionicons name={getStatusIcon(plan.status)} size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.statusBadgeText}>{translateStatus(plan.status)}</Text>
          </View>
        </View>
        {getAllowedStatusItems(plan.status).length > 1 && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
              <Text style={styles.statusSectionLabel}>Chuyển trạng thái:</Text>
              <View style={styles.statusButtonsContainer}>
                {getAllowedStatusItems(plan.status)
                  .filter(item => item.value !== plan.status)
                  .map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.statusButton,
                        { borderColor: getStatusColor(item.value) },
                      ]}
                      onPress={() => onStatusChange(plan.id, item.value as any)}
                    >
                      <Ionicons
                        name={getStatusIcon(item.value)}
                        size={16}
                        color={getStatusColor(item.value)}
                      />
                      <Text style={[
                        styles.statusButtonText,
                        { color: getStatusColor(item.value) },
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </>
        )}
      </View>

      {!isCancelled && (
        <>
          <View style={styles.reasonContainer}>
            <Ionicons
              name="bulb-outline"
              size={18}
              color={COLORS.light.PRIMARY_YELLOW}
              style={styles.reasonIcon}
            />
            <Text style={styles.cardReason} numberOfLines={2}>
              <Text style={styles.reasonLabel}>Lý do: </Text>
              {plan.reason}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
              <Text style={styles.progressPercentage}>
                {plan.completion_percentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${plan.completion_percentage}%` },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <View style={styles.progressInfoItem}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.light.GRAY} />
                <Text style={styles.progressInfoText}>
                  {plan.days_since_start} ngày đã qua
                </Text>
              </View>
              <View style={styles.progressInfoItem}>
                <Ionicons name="flag-outline" size={16} color={COLORS.light.GRAY} />
                <Text style={styles.progressInfoText}>
                  {Math.max(0, Math.ceil((new Date(plan.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} ngày còn lại
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardInfoGrid}>
            <View style={[styles.cardInfoItem, styles.startDateItem]}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.light.PRIMARY_BLUE}
              />
              <Text style={styles.cardInfoLabel}>Bắt đầu</Text>
              <Text style={styles.cardInfoValue}>
                {plan.start_date
                  ? new Date(plan.start_date).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </Text>
            </View>
            <View style={[styles.cardInfoItem, styles.targetDateItem]}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={COLORS.light.PRIMARY_YELLOW}
              />
              <Text style={styles.cardInfoLabel}>Mục tiêu</Text>
              <Text style={styles.cardInfoValue}>
                {plan.target_date
                  ? new Date(plan.target_date).toLocaleDateString("vi-VN")
                  : "Chưa có"}
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
        </>
      )}

      {isExpanded && !isCancelled && (
        <View style={styles.detailedStagesContainer}>
          {plan.stages.length === 0 ? (
            <View style={styles.emptyStagesContainer}>
              <Ionicons name="list-outline" size={48} color={COLORS.light.GRAY} />
              <Text style={styles.noStagesText}>
                Chưa có giai đoạn nào cho kế hoạch này.
              </Text>
            </View>
          ) : (
            plan.stages.map((stage) => {
              return (
                <View key={stage.id} style={styles.stageItem}>
                  <View style={styles.stageHeader}>
                    <View style={styles.stageNumberContainer}>
                      <Text style={styles.stageNumber}>{stage.stage_order}</Text>
                    </View>
                    <Text style={styles.stageTitleText}>
                      {stage.title}
                    </Text>
                  </View>
                  <Text style={styles.stageActionText}>
                    <Ionicons
                      name="bulb-outline"
                      size={16}
                      color={COLORS.light.YELLOW}
                    />
                    {stage.actions}
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
                    {stage.max_cigarettes_per_day !== undefined && (
                      <Text style={[styles.stageDateText, { marginTop: 4, color: 'red' }]}>
                        <Ionicons
                          name="filter-outline"
                          size={16}
                          color={'red'}
                        />{" "}
                        Tối đa {stage.max_cigarettes_per_day} điếu/ngày
                      </Text>
                    )}

                    <View style={{ width: '100%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                        <Text style={[styles.statusSectionLabel, { marginRight: 8 }]}>Trạng thái hiện tại:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(stage.status), marginTop: 2 }]}>
                          <Ionicons name={getStatusIcon(stage.status)} size={16} color="#fff" style={{ marginRight: 6 }} />
                          <Text style={styles.statusBadgeText}>{translateStatus(stage.status)}</Text>
                        </View>
                      </View>

                      {getAllowedStageStatusItems(stage.status).filter(item => item.value !== stage.status).length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                          <Text style={[styles.statusSectionLabel, { marginRight: 8 }]}>Chuyển trạng thái:</Text>
                          <View style={styles.stageStatusButtonsContainer}>
                            {getAllowedStageStatusItems(stage.status)
                              .filter(item => item.value !== stage.status)
                              .map((item) => (
                                <TouchableOpacity
                                  key={item.value}
                                  style={styles.stageStatusButton}
                                  onPress={() => onStageStatusChange(stage.id, item.value)}
                                >
                                  <Text style={styles.stageStatusButtonText}>{item.label}</Text>
                                </TouchableOpacity>
                              ))}
                          </View>
                        </View>
                      )}
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
              );
            })
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

      {isExpanded && !isCancelled && (
        <ProgressRecordsList
          planId={plan.id}
          coachId={plan.template?.coach_id || ""}
        />
      )}

      {plan.template?.id && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
            Phản hồi kế hoạch
          </Text>
          <UserFeedbackSection
            templateId={plan.template.id}
            user={plan.user}
            onFeedbackChange={onFeedbackChange}
          />
        </View>
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
    marginTop: 10,
    borderWidth: 0.7,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelledPlanCard: {
    opacity: 0.7,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.light.DARK_TEXT,
    lineHeight: 30,
    marginBottom: 8,
  },
  statusBadgeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  customBadge: {
    backgroundColor: COLORS.light.BADGE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.light.BADGE,
    alignSelf: "flex-start",
  },
  customBadgeText: {
    color: COLORS.light.WHITE,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 6,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "capitalize",
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  reasonIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  cardReason: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    lineHeight: 24,
    fontStyle: "italic",
    flex: 1,
  },
  reasonLabel: {
    fontWeight: "600",
    color: COLORS.light.DARK_TEXT,
  },
  progressBarContainer: {
    marginBottom: 25,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.DARK_TEXT,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.ACTIVE,
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
  progressInfo: {
    marginTop: 12,
    gap: 8,
  },
  progressInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressInfoText: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
  },
  cardInfoGrid: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 25,
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
    marginBottom: 0,
  },
  startDateItem: {
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  targetDateItem: {
    borderColor: COLORS.light.PRIMARY_YELLOW,
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
  emptyStagesContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noStagesText: {
    textAlign: "center",
    color: COLORS.light.SUBTEXT,
    fontStyle: "italic",
    marginTop: 15,
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
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stageNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stageNumber: {
    color: COLORS.light.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  stageTitleText: {
    fontSize: 18,
    color: COLORS.light.DARK_TEXT,
    lineHeight: 26,
    flex: 1,
  },
  stageActionText: {
    fontSize: 16,
    color: COLORS.light.DARK_GREY_TEXT,
    marginBottom: 12,
    lineHeight: 22,
  },
  stageInfoRow: {
    flexDirection: "column",
    alignItems: "flex-start",
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
  statusButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2196F3",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusButtonText: {
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  stageStatusButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: 'center',
  },
  stageStatusButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 4,
  },
  stageStatusButtonText: {
    color: "4CAF50",
    fontWeight: "500",
    fontSize: 14,
  },
  activeStageStatusButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dateBoxStart: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.light.PRIMARY_BLUE,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: COLORS.light.WHITE,
  },
  dateBoxTarget: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.light.PRIMARY_YELLOW,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: COLORS.light.WHITE,
  },
  statusSectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.light.GRAY,
  },
});

export default PlanCard;
