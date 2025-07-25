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
import { useFocusEffect } from "@react-navigation/native";
import {
  HEALTH_MILESTONES,
  IHealthMilestone,
} from "@/types/api/healthMilestones";
import { notificationService } from "@/services/notificationService";
import { UserService } from '@/services/userService';

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

function LeaderboardStreak() {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    UserService.getStreakLeaderboard(10, 0)
      .then(setLeaderboard)
      .catch(() => setLeaderboard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.leaderboardCard}>
      <Text style={styles.leaderboardTitle}>🔥 Bảng xếp hạng streak</Text>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.light.PRIMARY} style={{ marginVertical: 16 }} />
      ) : leaderboard && leaderboard.data && leaderboard.data.length > 0 ? (
        <View>
          {leaderboard.data.map((item: any, idx: number) => (
            <View key={item.userId} style={[styles.leaderboardRow, leaderboard.myRank && item.userId === leaderboard.myRank.userId && styles.leaderboardRowMe]}>
              <Text style={[styles.leaderboardRank, idx < 3 && styles.leaderboardRankTop]}>{item.rank}</Text>
              <Text style={styles.leaderboardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.leaderboardStreak}>{item.streak} ngày</Text>
            </View>
          ))}
          {leaderboard.myRank && !leaderboard.data.some((i: any) => i.userId === leaderboard.myRank.userId) && (
            <View style={[styles.leaderboardRow, styles.leaderboardRowMe, { marginTop: 8 }]}>
              <Text style={styles.leaderboardRank}>{leaderboard.myRank.rank}</Text>
              <Text style={styles.leaderboardName} numberOfLines={1}>{leaderboard.myRank.name}</Text>
              <Text style={styles.leaderboardStreak}>{leaderboard.myRank.streak} ngày</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={{ color: COLORS.light.SUBTEXT, textAlign: 'center', marginVertical: 12 }}>Chưa có dữ liệu xếp hạng.</Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { activePlan, progressRecords, loading, error, refreshData, totalMoneySaved } =
    useProgress();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<
    IProgressRecord | undefined
  >(undefined);
  const [selectedDateForNewRecord, setSelectedDateForNewRecord] = useState<
    Date | undefined
  >(undefined);

  const initialDailyCigarettes = 20;
  const costPerCigarette = 50000 / 20;

  const achievedMilestones = useMemo(() => {
    if (!activePlan || !activePlan.start_date) {
      return [];
    }

    const startDate = new Date(activePlan.start_date);
    const now = currentTime;

    const achieved: IHealthMilestone[] = [];

    HEALTH_MILESTONES.forEach((milestone) => {
      let milestoneDate: Date;
      const [value, unit] = milestone.timeframe.split(" ");
      const numValue = parseInt(value);

      milestoneDate = new Date(startDate);

      switch (unit) {
        case "phút":
          milestoneDate.setMinutes(milestoneDate.getMinutes() + numValue);
          break;
        case "giờ":
          milestoneDate.setHours(milestoneDate.getHours() + numValue);
          break;
        case "ngày":
          milestoneDate.setDate(milestoneDate.getDate() + numValue);
          break;
        case "tuần":
          milestoneDate.setDate(milestoneDate.getDate() + numValue * 7);
          break;
        case "năm":
          milestoneDate.setFullYear(milestoneDate.getFullYear() + numValue);
          break;
        default:
          break;
      }

      if (now.getTime() >= milestoneDate.getTime()) {
        achieved.push(milestone);
      }
    });

    return achieved;
  }, [activePlan, currentTime]);

  const handleAuthButtonPress = useCallback(() => {
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    notificationService.getUserNotifications({ page: 1, limit: 20 }).then(data => {
      setUnreadCount(data.data.filter(n => n.status === "SENT").length);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

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

      // Parse start_date từ ISO string và chuyển về local time
      const startDate = new Date(activePlan.start_date);
      const now = new Date(currentTime);

      // Tính toán thời gian chính xác từ thời điểm bắt đầu
      const fullTimeDiffMs = currentTime.getTime() - startDate.getTime();
      const fullTotalSeconds = Math.max(0, Math.floor(fullTimeDiffMs / 1000));

      // Tính số ngày chính xác dựa trên tổng thời gian
      const days = Math.floor(fullTotalSeconds / (24 * 3600));

      // Tính giờ, phút, giây còn lại
      const remainingSeconds = fullTotalSeconds % (24 * 3600);
      const actualHours = Math.floor(remainingSeconds / 3600);
      const actualMinutes = Math.floor((remainingSeconds % 3600) / 60);
      const actualSeconds = remainingSeconds % 60;

      let totalCigarettesSmokedAgain: number = 0;
      progressRecords.forEach((record) => {
        totalCigarettesSmokedAgain += record.cigarettes_smoked;
      });

      const totalCigarettesBaseline = initialDailyCigarettes;
      const totalCigarettesNotSmoked =
        totalCigarettesBaseline * days - totalCigarettesSmokedAgain;
      const moneySaved = Math.round(
        Math.max(0, totalCigarettesNotSmoked * costPerCigarette)
      );

      return {
        days,
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

  const avgHealthScore = useMemo(() => {
    if (!progressRecords || progressRecords.length === 0) return 0;
    const total = progressRecords.reduce((sum, rec) => sum + (rec.health_score || 0), 0);
    return total / progressRecords.length;
  }, [progressRecords]);

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

    await refreshData();
  };

  const handleFormCancel = () => {
    setIsFormModalVisible(false);
    setSelectedRecordForEdit(undefined);
    setSelectedDateForNewRecord(undefined);
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
        {activePlan ? (
          <>
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
                        dayStatus.status === "current" && styles.dailyDayTextCurrent,
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
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.light.PRIMARY }}>
                  Tổng tiền đã tiết kiệm: {totalMoneySaved.toLocaleString('vi-VN')}₫
                </Text>
              </View>

              <View style={styles.bottomStatsRow}>
                <View style={styles.bottomStatItem}>
                  <Ionicons
                    name="heart-outline"
                    size={28}
                    color={COLORS.light.PRIMARY_RED}
                  />
                  <Text style={styles.bottomStatLabel}>Sức khỏe trung bình</Text>
                  <Text style={styles.bottomStatValue}>
                    {avgHealthScore ? avgHealthScore.toFixed(1) : "-"}
                  </Text>
                </View>
                <View style={styles.bottomStatItem}>
                  <Ionicons
                    name="logo-no-smoking"
                    size={28}
                    color={COLORS.light.CIGARETTE_ICON}
                  />
                  <Text style={styles.bottomStatLabel}>
                    Số điếu đã hút
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

              <ProgressCharts records={progressRecords} planId={activePlan?.id} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.membershipInviteCard}>
              <Ionicons name="star-outline" size={40} color={COLORS.light.PRIMARY_YELLOW_DARK} style={{ marginBottom: 10 }} />
              <Text style={styles.membershipInviteTitle}>Nâng cấp thành viên để nhận nhiều quyền lợi hơn!</Text>
              <Text style={styles.membershipInviteDesc}>Trở thành thành viên để cá nhân hóa kế hoạch, chat với coach và nhận nhiều ưu đãi đặc biệt.</Text>
              <TouchableOpacity
                style={styles.membershipInviteButton}
                onPress={() => router.push('/membership')}
                activeOpacity={0.85}
              >
                <Ionicons name="rocket-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.membershipInviteButtonText}>Đăng ký thành viên</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quizInviteCard}>
              <Ionicons name="heart-circle-outline" size={48} color={COLORS.light.PRIMARY_GREEN} style={{ marginBottom: 12 }} />
              <Text style={styles.quizInviteTitle}>Bạn chưa có kế hoạch nào</Text>
              <Text style={styles.quizInviteDesc}>Hãy bắt đầu hành trình bằng cách làm khảo sát để nhận gợi ý kế hoạch phù hợp nhất cho bạn!</Text>
              <TouchableOpacity
                style={styles.quizInviteButton}
                onPress={() => router.push('/quiz')}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.quizInviteButtonText}>Làm khảo sát ngay</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <LeaderboardStreak />
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
              coachId={activePlan?.template.coach_id}
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
  healthMilestonesContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.BORDER_LIGHT_GREY,
    backgroundColor: COLORS.light.BACKGROUND,
    borderRadius: 12,
    padding: 15,
  },
  healthMilestonesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 15,
    textAlign: "center",
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingHorizontal: 5,
    position: "relative",
  },
  milestoneIcon: {
    marginRight: 15,
    width: 30,
    textAlign: "center",
    marginTop: 2,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTimeframe: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_BLUE_DARK,
    marginBottom: 2,
  },
  milestoneDescription: {
    fontSize: 14,
    color: COLORS.light.DARK_GREY_TEXT,
    lineHeight: 20,
  },
  milestoneConnector: {
    position: "absolute",
    left: 20,
    top: 30,
    bottom: -10,
    width: 2,
    backgroundColor: COLORS.light.BORDER_GREY,
    zIndex: -1,
  },
  overallProgressBarContainer: {
    height: 8,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 10,
    overflow: "hidden",
    borderColor: COLORS.light.BORDER_GREY,
    borderWidth: 1,
  },
  overallProgressBarFill: {
    height: "100%",
    backgroundColor: COLORS.light.PRIMARY_GREEN,
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 13,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  leaderboardCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    shadowColor: COLORS.light.SHADOW,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.PRIMARY_BLUE_DARK,
    marginBottom: 10,
    textAlign: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  leaderboardRowMe: {
    backgroundColor: '#E6F7FF',
    borderRadius: 8,
  },
  leaderboardRank: {
    width: 32,
    fontWeight: 'bold',
    color: COLORS.light.PRIMARY,
    fontSize: 16,
    textAlign: 'center',
  },
  leaderboardRankTop: {
    color: '#FFB936',
    fontSize: 18,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.light.TEXT,
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  leaderboardStreak: {
    minWidth: 60,
    textAlign: 'right',
    color: COLORS.light.PRIMARY_GREEN_DARK,
    fontWeight: 'bold',
    fontSize: 15,
  },
  quizInviteCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    shadowColor: COLORS.light.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  quizInviteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.PRIMARY_BLUE_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  quizInviteDesc: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  quizInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 6,
  },
  quizInviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 2,
  },
  membershipInviteCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    shadowColor: COLORS.light.SHADOW,
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },
  membershipInviteTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.light.PRIMARY_YELLOW_DARK,
    marginBottom: 6,
    textAlign: 'center',
  },
  membershipInviteDesc: {
    fontSize: 14,
    color: COLORS.light.SECONDARY_TEXT,
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  membershipInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.PRIMARY_YELLOW_DARK,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  membershipInviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 2,
  },
});
