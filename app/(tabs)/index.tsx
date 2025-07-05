import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeHeader from "@/components/home/header";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { IProgressRecord } from "@/types/api/processRecord";
import ProgressCharts from "@/components/home/ProcessChart";
import ProgressRecordForm from "@/components/plan/ProgressRecordForm";
import Toast from "react-native-toast-message";
import { useProgress } from "@/contexts/ProgressRecordContext";

interface IProgressStats {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  moneySaved: number;
  cigarettesSmokedAgain: number;
}

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateToYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { activePlan, progressRecords, loading, error, refreshData } =
    useProgress();

  const [currentTime, setCurrentTime] = useState(new Date());

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<
    IProgressRecord | undefined
  >(undefined);
  const [selectedDateForNewRecord, setSelectedDateForNewRecord] = useState<
    Date | undefined
  >(undefined);

  const initialDailyCigarettes = 20;
  const costPerCigarette = 50000 / 20;

  const handleLogoutAndRedirectToLogin = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  const handleAuthButtonPress = useCallback(() => {
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds, moneySaved, cigarettesSmokedAgain } =
    useMemo<IProgressStats>(() => {
      if (!activePlan) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          moneySaved: 0,
          cigarettesSmokedAgain: 0,
        };
      }

      const startDate = new Date(activePlan.start_date);
      startDate.setHours(0, 0, 0, 0);

      const normalizedCurrentTime = new Date(currentTime);
      normalizedCurrentTime.setHours(0, 0, 0, 0);

      const daysSincePlanStartMs =
        normalizedCurrentTime.getTime() - startDate.getTime();
      const calculatedDays = Math.max(
        0,
        Math.floor(daysSincePlanStartMs / (1000 * 3600 * 24))
      );

      const fullTimeDiffMs =
        currentTime.getTime() - new Date(activePlan.start_date).getTime();
      const fullTotalSeconds = Math.max(0, Math.floor(fullTimeDiffMs / 1000));

      const actualHours = Math.floor(fullTotalSeconds / 3600) % 24;
      const actualMinutes = Math.floor((fullTotalSeconds % 3600) / 60);
      const actualSeconds = fullTotalSeconds % 60;

      let totalCigarettesSmokedAgain: number = 0;
      progressRecords.forEach((record) => {
        totalCigarettesSmokedAgain += record.cigarettes_smoked;
      });

      const totalCigarettesBaseline = initialDailyCigarettes;
      const totalCigarettesNotSmoked =
        totalCigarettesBaseline * calculatedDays - totalCigarettesSmokedAgain;
      const moneySaved = Math.round(
        Math.max(0, totalCigarettesNotSmoked * costPerCigarette)
      );

      return {
        days: calculatedDays,
        hours: actualHours,
        minutes: actualMinutes,
        seconds: actualSeconds,
        moneySaved,
        cigarettesSmokedAgain: totalCigarettesSmokedAgain,
      };
    }, [
      activePlan,
      progressRecords,
      currentTime,
      initialDailyCigarettes,
      costPerCigarette,
    ]);

  const dailyCheckInStatus = useMemo(() => {
    const startOfWeek = getStartOfWeek(currentTime);

    const todayNormalized = new Date(currentTime);
    todayNormalized.setHours(0, 0, 0, 0);
    const todayYYYYMMDD = formatDateToYYYYMMDD(todayNormalized);

    const recordedDatesMap = new Map<string, IProgressRecord>();
    progressRecords.forEach((record) => {
      const recordDateNormalized = new Date(record.record_date);
      recordDateNormalized.setHours(0, 0, 0, 0);
      recordedDatesMap.set(formatDateToYYYYMMDD(recordDateNormalized), record);
    });

    const weekDaysStatus: {
      date: Date;
      dayAbbr: string;
      status: "recorded" | "missed" | "future" | "current" | "before_plan";
      record?: IProgressRecord;
      isDisabled: boolean;
    }[] = [];
    const orderedDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const planStartDateNormalized = activePlan
      ? new Date(activePlan.start_date)
      : null;
    if (planStartDateNormalized) {
      planStartDateNormalized.setHours(0, 0, 0, 0);
    }

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      currentDay.setHours(0, 0, 0, 0);
      const currentDayYYYYMMDD = formatDateToYYYYMMDD(currentDay);

      let status: "recorded" | "missed" | "future" | "current" | "before_plan";
      let recordForDay: IProgressRecord | undefined =
        recordedDatesMap.get(currentDayYYYYMMDD);
      let isDisabled = false;

      if (
        planStartDateNormalized &&
        currentDay.getTime() < planStartDateNormalized.getTime()
      ) {
        status = "before_plan";
        isDisabled = true;
      } else if (currentDayYYYYMMDD === todayYYYYMMDD) {
        status = recordForDay ? "recorded" : "current";
        isDisabled = false;
      } else if (currentDay.getTime() < todayNormalized.getTime()) {
        status = recordForDay ? "recorded" : "missed";
        isDisabled = false;
      } else {
        status = "future";
        isDisabled = true;
      }

      const dayIndex = currentDay.getDay();
      const dayAbbr = orderedDayNames[(dayIndex + 6) % 7];

      weekDaysStatus.push({
        date: currentDay,
        dayAbbr,
        status,
        record: recordForDay,
        isDisabled: isDisabled,
      });
    }

    return weekDaysStatus.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentTime, progressRecords, activePlan]);

  const formatPlanDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleDayCirclePress = (dayStatus: {
    date: Date;
    status: string;
    record?: IProgressRecord;
    isDisabled: boolean;
  }) => {
    if (dayStatus.status === "future") {
      Alert.alert(
        "Thông báo",
        "Bạn không thể ghi nhận tiến trình cho ngày trong tương lai."
      );
      return;
    }

    if (
      dayStatus.status === "before_plan" &&
      activePlan &&
      dayStatus.date.getTime() < new Date(activePlan.start_date).getTime()
    ) {
      Alert.alert(
        "Thông báo",
        "Bạn không thể ghi nhận tiến trình cho ngày trước khi kế hoạch bắt đầu."
      );
      return;
    }

    if (!activePlan) {
      Alert.alert(
        "Thông báo",
        "Vui lòng tạo một kế hoạch cai thuốc trước khi ghi nhận tiến trình."
      );
      router.push("/(tabs)/myPlan");
      return;
    }

    if (dayStatus.record) {
      setSelectedRecordForEdit(dayStatus.record);
      setSelectedDateForNewRecord(undefined);
    } else {
      setSelectedRecordForEdit(undefined);
      setSelectedDateForNewRecord(dayStatus.date);
    }
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (newRecord: IProgressRecord) => {
    setIsFormModalVisible(false);
    setSelectedRecordForEdit(undefined);
    setSelectedDateForNewRecord(undefined);
  };

  const handleFormCancel = () => {
    setIsFormModalVisible(false);
    setSelectedRecordForEdit(undefined);
    setSelectedDateForNewRecord(undefined);
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      console.log(`Đang xóa bản ghi với ID: ${recordId}`);

      await refreshData();
      Toast.show({
        type: "success",
        text1: "Xóa thành công!",
        text2: "Bản ghi đã được xóa.",
      });
    } catch (deleteError: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi xóa bản ghi!",
        text2: "Không thể xóa bản ghi. Vui lòng thử lại.",
      });
      console.error("Error deleting record:", deleteError);
    }
  };

  if (loading && user?.id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
        <Text style={{ color: COLORS.light.SUBTEXT, marginTop: 10 }}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.light.ERROR, textAlign: "center" }}>
          Lỗi: {error}
        </Text>
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View style={styles.unauthenticatedContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.unauthenticatedTitle}>
          Chào mừng đến với ReAir - Hành trình cai thuốc của bạn!
        </Text>
        <Text style={styles.unauthenticatedSubtitle}>
          Đăng nhập hoặc đăng ký để bắt đầu theo dõi tiến trình và cải thiện sức
          khỏe.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          activeOpacity={0.8}
          onPress={handleAuthButtonPress}
        >
          <Text style={styles.authButtonText}>Đăng nhập / Đăng ký</Text>
        </TouchableOpacity>
        <Text style={styles.unauthenticatedDisclaimer}>
          ReAir sẽ giúp bạn trên con đường từ bỏ thuốc lá.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <HomeHeader user={user} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.howAreYouCard} activeOpacity={0.8}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={COLORS.light.PRIMARY_YELLOW}
          />
          <Text style={styles.howAreYouText}>
            Hôm nay bạn cảm thấy như thế nào?
          </Text>
        </TouchableOpacity>

        <View style={styles.dailyCheckInCard}>
          <Text style={styles.dailyCheckInTitle}>
            Đánh giá sức khỏe mỗi ngày nhé!
          </Text>
          <View style={styles.dailyCheckInRow}>
            <Text style={styles.dailyCheckInSubtitle}>Tuần này</Text>
          </View>
          <View style={styles.dailyDaysContainer}>
            {dailyCheckInStatus.map((dayStatus, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dailyDayCircle,
                  dayStatus.status === "recorded" && styles.dailyDayRecorded,
                  dayStatus.status === "missed" && styles.dailyDayMissed,
                  dayStatus.status === "current" && styles.dailyDayCurrent,
                  dayStatus.status === "before_plan" &&
                    styles.dailyDayBeforePlan,
                  dayStatus.isDisabled && { opacity: 0.5 },
                ]}
                onPress={() => handleDayCirclePress(dayStatus)}
                disabled={dayStatus.isDisabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dailyDayText,
                    dayStatus.status === "recorded" &&
                      styles.dailyDayTextRecorded,
                    dayStatus.status === "missed" && styles.dailyDayTextMissed,
                    dayStatus.status === "current" &&
                      styles.dailyDayTextCurrent,
                    dayStatus.status === "future" && styles.dailyDayTextFuture,
                    dayStatus.status === "before_plan" &&
                      styles.dailyDayTextBeforePlan,
                  ]}
                >
                  {dayStatus.dayAbbr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.progressSectionTitleContainer}>
          <Text style={styles.progressSectionTitle}>Hành trình của tôi</Text>
          <TouchableOpacity>
            <Ionicons
              name="share-outline"
              size={24}
              color={COLORS.light.DARK_GREY_TEXT}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainProgressCard}>
          <View style={styles.timeQuitContainer}>
            <Ionicons
              name="time-outline"
              size={24}
              color={COLORS.light.DARK_GREY_TEXT}
              style={{ marginRight: 10 }}
            />
            <View style={styles.timeValueContainer}>
              <Text style={styles.timeValue}>
                {String(days).padStart(2, "0")}
              </Text>
              <Text style={styles.timeUnit}>Ngày</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeValueContainer}>
              <Text style={styles.timeValue}>
                {String(hours).padStart(2, "0")}
              </Text>
              <Text style={styles.timeUnit}>Giờ</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeValueContainer}>
              <Text style={styles.timeValue}>
                {String(minutes).padStart(2, "0")}
              </Text>
              <Text style={styles.timeUnit}>Phút</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeValueContainer}>
              <Text style={styles.timeValue}>
                {String(seconds).padStart(2, "0")}
              </Text>
              <Text style={styles.timeUnit}>Giây</Text>
            </View>
          </View>

          <View style={styles.bottomStatsRow}>
            <View style={styles.bottomStatItem}>
              <Ionicons
                name="wallet-outline"
                size={28}
                color={COLORS.light.MONEY_ICON}
              />
              <Text style={styles.bottomStatLabel}>Tiền tiết kiệm </Text>
              <Text style={styles.bottomStatValue}>
                {moneySaved.toLocaleString("vi-VN")}đ
              </Text>
            </View>
            <View style={styles.bottomStatItem}>
              <Ionicons
                name="logo-no-smoking"
                size={28}
                color={COLORS.light.CIGARETTE_ICON}
              />
              <Text style={styles.bottomStatLabel}>
                Số điếu đã hút từ lúc bạn bắt đầu kế hoạch
              </Text>
              <Text style={styles.bottomStatValue}>
                {cigarettesSmokedAgain}
              </Text>
            </View>
          </View>

          <View style={styles.additionalStatsGrid}>
            <TouchableOpacity
              style={[styles.additionalStatCard, styles.startDateCard]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.light.PRIMARY_BLUE}
              />
              <Text style={styles.additionalStatLabel}>Bắt đầu</Text>
              <Text style={[styles.additionalStatValue, styles.startDateText]}>
                {activePlan ? formatPlanDate(activePlan.start_date) : "N/A"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.additionalStatCard, styles.targetDateCard]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="flag-outline"
                size={22}
                color={COLORS.light.PRIMARY_YELLOW_DARK}
              />
              <Text style={styles.additionalStatLabel}>Mục tiêu</Text>
              <Text style={[styles.additionalStatValue, styles.targetDateText]}>
                {activePlan && activePlan.target_date
                  ? formatPlanDate(activePlan.target_date)
                  : "N/A"}
              </Text>
            </TouchableOpacity>
          </View>

          <ProgressCharts records={progressRecords} />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFormModalVisible}
        onRequestClose={handleFormCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleFormCancel}
        >
          <View style={styles.modalContent}>
            <ProgressRecordForm
              initialData={selectedRecordForEdit}
              planId={activePlan?.id}
              prefillDate={selectedDateForNewRecord}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light.BG },
  safeArea: {
    backgroundColor: COLORS.light.BG,
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },

  howAreYouCard: {
    backgroundColor: COLORS.light.HOW_ARE_YOU_CARD_BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  howAreYouText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.HOW_ARE_YOU_TEXT,
    marginLeft: 10,
  },

  dailyCheckInCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  dailyCheckInTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 8,
  },
  dailyCheckInRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dailyCheckInSubtitle: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
  },
  dailyPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.PRIMARY_YELLOW_LIGHT,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dailyPointsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_YELLOW_DARK,
    marginLeft: 4,
  },
  dailyDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dailyDayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },

  dailyDayRecorded: {
    backgroundColor: COLORS.light.PRIMARY_GREEN_LIGHT,
    borderColor: COLORS.light.PRIMARY_GREEN,
  },
  dailyDayMissed: {
    backgroundColor: COLORS.light.PRIMARY_RED_LIGHT,
    borderColor: COLORS.light.PRIMARY_RED,
  },
  dailyDayCurrent: {
    backgroundColor: COLORS.light.PRIMARY_BLUE_LIGHT,
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  dailyDayText: {
    fontSize: 12,
    color: COLORS.light.DARK_GREY_TEXT,
    fontWeight: "600",
  },
  dailyDayTextRecorded: {
    color: COLORS.light.PRIMARY_GREEN_DARK,
  },
  dailyDayTextMissed: {
    color: COLORS.light.PRIMARY_RED_DARK,
  },
  dailyDayTextCurrent: {
    color: COLORS.light.PRIMARY_BLUE_DARK,
  },
  dailyDayTextFuture: {
    color: COLORS.light.PLACEHOLDER,
  },

  progressSectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },

  mainProgressCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  timeQuitContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  timeValueContainer: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  timeValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_GREEN,
  },
  timeUnit: {
    fontSize: 11,
    color: COLORS.light.SUBTEXT,
    fontWeight: "500",
    marginTop: -4,
  },
  colon: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_GREEN,
    marginTop: -12,
    marginHorizontal: 2,
  },
  bottomStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
  },
  bottomStatItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 14,
    paddingVertical: 18,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },
  bottomStatLabel: {
    fontSize: 13,
    color: COLORS.light.DARK_GREY_TEXT,
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginTop: 4,
  },

  additionalStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },
  startDateCard: {
    borderColor: COLORS.light.PRIMARY_BLUE,
    backgroundColor: COLORS.light.PRIMARY_BLUE_LIGHT,
  },
  targetDateCard: {
    borderColor: COLORS.light.PRIMARY_YELLOW_DARK,
    backgroundColor: COLORS.light.PRIMARY_YELLOW_LIGHT,
  },
  additionalStatLabel: {
    fontSize: 13,
    color: COLORS.light.DARK_GREY_TEXT,
    marginTop: 8,
    fontWeight: "600",
  },
  additionalStatValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginTop: 4,
  },
  startDateText: {
    color: COLORS.light.PRIMARY_BLUE_DARK,
  },
  targetDateText: {
    color: COLORS.light.PRIMARY_YELLOW_DARK,
  },

  recordsListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 15,
    marginTop: 10,
    textAlign: "center",
  },
  recordItem: {
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },
  recordItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light.BORDER_GREY,
    paddingBottom: 8,
  },
  recordDate: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginLeft: 8,
    flex: 1,
  },
  recordActions: {
    flexDirection: "row",
    gap: 10,
  },
  recordActionButton: {
    padding: 5,
  },
  recordDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recordDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  recordDetailLabel: {
    fontSize: 14,
    color: COLORS.light.DARK_GREY_TEXT,
    marginLeft: 8,
    marginRight: 5,
  },
  recordDetailValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  recordNotesContainer: {
    marginTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.light.BORDER_GREY,
    paddingTop: 8,
  },
  recordNotesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.light.SUBTEXT,
    marginBottom: 3,
  },
  recordNotesText: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    fontStyle: "italic",
  },
  noRecordsText: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  viewAllRecordsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.light.BG,
    borderWidth: 1,
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  viewAllRecordsButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_BLUE,
    marginRight: 5,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BG,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BG,
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  unauthenticatedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  unauthenticatedSubtitle: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  authButton: {
    backgroundColor: COLORS.light.CALL_TO_ACTION,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  authButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  unauthenticatedDisclaimer: {
    fontSize: 12,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        paddingBottom: 30,
      },
      android: {},
    }),
  },
  modalContent: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,

    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  dailyDayBeforePlan: {
    backgroundColor: COLORS.light.BACKGROUND,
    borderColor: COLORS.light.BORDER_GREY,
  },
  dailyDayTextBeforePlan: {
    color: COLORS.light.SUBTEXT,
  },
});
