import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlanTemplate } from "@/types/api/template";
import { PlanTemplateService } from "@/services/templatePlanService";
import { QuizService } from "@/services/quizService";
import { getLevelColor, translateLevel } from "@/utils";
import { useRouter } from "expo-router";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";
import COLORS from "@/constants/Colors";

// Định nghĩa các mức độ lọc và giá trị tương ứng từ API
const filterLevels = [
  { label: "Tất cả", value: "all" },
  { label: "Dễ", value: "EASY" },
  { label: "Trung bình", value: "MEDIUM" },
  { label: "Khó", value: "HARD" },
];

export default function TemplateScreen() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizAttempt, setQuizAttempt] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();
  const { user } = useAuth();

  const handleAuthButtonPress = () => {
    router.push("/login");
  };

  useEffect(() => {
    if (user) {
      fetchTemplates();
      checkQuizAttempt();
    } else {
      setLoading(false);
      setQuizLoading(false);
    }
  }, [user]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await PlanTemplateService.getTemplates();
      setTemplates(res);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkQuizAttempt = async () => {
    setQuizLoading(true);
    try {
      const attempts = await QuizService.getQuizAttempt();

      const completedAttempt = Array.isArray(attempts)
        ? attempts.find(attempt => attempt.status === 'COMPLETED' && attempt.completed_at)
        : null;

      setQuizAttempt(completedAttempt);
    } catch (err) {
      console.error("Error checking quiz attempt:", err);
      setQuizAttempt(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const filteredTemplates =
    selectedFilter === "all"
      ? templates
      : templates.filter(
        (template) => template.difficulty_level === selectedFilter
      );

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
            Đăng nhập hoặc đăng ký để xem các kế hoạch cai thuốc lá và theo dõi
            tiến trình của bạn.
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
      </SafeAreaView>
    );
  }

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color="#16F2A8" size="large" />
        </View>
      </SafeAreaView>
    );

  if (!templates.length)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={48} color="#b6bdca" />
          <Text style={styles.empty}>Không có kế hoạch nào</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchTemplates}
          >
            <Ionicons name="refresh-outline" size={24} color="#16F2A8" />
            <Text style={styles.refreshButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );

  return (
    <View style={styles.safeArea}>
      <HomeHeader user={user} />
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlanTemplateCard
            template={item}
            onPress={() =>
              router.push({
                pathname: "/template/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 0 }}>
            <Text style={styles.sectionHeader}>Các mẫu kế hoạch cai thuốc</Text>
            {/* Quiz Notification */}
            {!quizLoading && !quizAttempt && (
              <View style={styles.quizNotification}>
                <View style={styles.quizNotificationContent}>
                  <Ionicons name="information-circle" size={24} color="#FF6B35" />
                  <View style={styles.quizNotificationText}>
                    <Text style={styles.quizNotificationTitle}>
                      Chưa có khảo sát cá nhân
                    </Text>
                    <Text style={styles.quizNotificationSubtitle}>
                      Làm khảo sát để nhận gợi ý kế hoạch phù hợp và có thể biết được bạn đã tiết kiệm được bao nhiêu tiền nhé!
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.quizButton}
                  onPress={() => router.push('/quiz' as any)}
                >
                  <Text style={styles.quizButtonText}>Làm khảo sát ngay</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {filterLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.filterButton,
                    selectedFilter === level.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(level.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === level.value &&
                      styles.filterButtonTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 40 }} />}
        style={{ paddingHorizontal: 18 }}
      />
    </View>
  );
}

type PlanTemplateCardProps = {
  template: PlanTemplate;
  onPress: () => void;
};

function PlanTemplateCard({ template, onPress }: PlanTemplateCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.91}
      onPress={onPress}
      style={{ marginBottom: 20 }}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{template.name}</Text>
          <Text
            style={[
              styles.level,
              { color: getLevelColor(template.difficulty_level) },
            ]}
          >
            {translateLevel(template.difficulty_level)}
          </Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {template.description}
        </Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={17} color="#16F2A8" />
          <Text style={styles.info}>
            {template.estimated_duration_days} ngày
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              if (i < Math.floor(template.average_rating)) {
                return (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color="#ffbb36"
                    style={{ marginRight: 1 }}
                  />
                );
              } else if (
                i === Math.floor(template.average_rating) &&
                template.average_rating % 1 >= 0.5
              ) {
                return (
                  <Ionicons
                    key={i}
                    name="star-half"
                    size={16}
                    color="#ffbb36"
                    style={{ marginRight: 1 }}
                  />
                );
              } else {
                return (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color="#dadada"
                    style={{ marginRight: 1 }}
                  />
                );
              }
            })}
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={15} color="#b5bbc7" />
          <Text style={styles.info}>{template.coach.name}</Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={15}
            color="#33c275"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.info}>
            Tỷ lệ thành công: {(template.success_rate)}%
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10, marginLeft: -6 }}
        >
          {template.stages.map((stage) => (
            <View key={stage.id} style={styles.stage}>
              <Text style={styles.stageTitle}>
                {stage.stage_order}. {stage.title}
              </Text>
              <Text style={styles.stageDesc} numberOfLines={1}>
                {stage.description}
              </Text>
              <Text style={styles.stageAction} numberOfLines={1}>
                📝 {stage.recommended_actions}
              </Text>
              <Text style={styles.stageDuration}>
                ⏳ {stage.duration_days} ngày
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BG,
    paddingHorizontal: 18,
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
    shadowColor: COLORS.light.CALL_TO_ACTION,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
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

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BG,
  },
  empty: {
    marginTop: 16,
    color: "#b6bdca",
    fontSize: 16,
    fontWeight: "500",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: COLORS.light.grey,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#16F2A8",
  },
  card: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },

    elevation: 5,

    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3,
  },
  name: {
    fontWeight: "700",
    fontSize: 19,
    color: COLORS.light.TEXT,
    letterSpacing: 0.2,
    flex: 1,
  },
  level: {
    fontSize: 13,
    backgroundColor: COLORS.light.PRIMARY_BLUE_LIGHT,

    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontWeight: "600",
    overflow: "hidden",
    marginLeft: 10,
  },
  desc: {
    color: COLORS.light.SUBTEXT,
    marginTop: 4,
    marginBottom: 10,
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.05,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
    gap: 5,
  },
  info: {
    fontSize: 13.5,
    color: COLORS.light.DARK_GREY_TEXT,
    marginLeft: 4,
    fontWeight: "500",
  },
  stage: {
    minWidth: 170,
    maxWidth: 210,
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.light.PRIMARY_GREEN_LIGHT,
    marginRight: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 3 },
    elevation: 1,
  },
  stageTitle: {
    fontWeight: "700",
    fontSize: 14.5,
    color: COLORS.light.PRIMARY_GREEN_DARK,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  stageDesc: {
    color: COLORS.light.SUBTEXT,
    fontSize: 13,
    marginTop: 1,
    marginBottom: 1,
    fontWeight: "400",
  },
  stageAction: {
    color: COLORS.light.PRIMARY_BLUE_DARK,
    fontSize: 13,
    marginTop: 1,
    marginBottom: 1,
  },
  stageDuration: {
    fontSize: 13,
    color: COLORS.light.PRIMARY_GREEN_DARK,
    marginTop: 2,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    // paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  filterContainer: {
    marginBottom: 10,
    paddingBottom: 5,
  },
  filterButton: {
    backgroundColor: COLORS.light.CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: COLORS.light.BTN_BG,
    borderColor: COLORS.light.BTN_BG,
  },
  filterButtonText: {
    color: COLORS.light.TEXT,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: COLORS.light.WHITE,
  },
  quizNotification: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  quizNotificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizNotificationText: {
    flex: 1,
    marginLeft: 12,
  },
  quizNotificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  quizNotificationSubtitle: {
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
  quizButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
