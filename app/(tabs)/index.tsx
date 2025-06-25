import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import HomeHeader from "@/components/home/header";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <HomeHeader user={user} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <Text style={styles.welcome}>
            {user && user.user_metadata?.name
              ? `Chào, ${user.user_metadata.name}!`
              : "Chào, Cc!"}
          </Text>
          <Text style={styles.slogan}>
            Mỗi ngày không hút thuốc là một chiến thắng!
          </Text>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={28}
                color={COLORS.ACTIVE}
              />
              <Text style={styles.statText}>10 ngày</Text>
              <Text style={styles.statLabel}>Đã bỏ thuốc</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash"
                size={28}
                color={COLORS.ACTIVE}
              />
              <Text style={styles.statText}>200.000đ</Text>
              <Text style={styles.statLabel}>Tiết kiệm</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={28}
                color={COLORS.ACTIVE}
              />
              <Text style={styles.statText}>0</Text>
              <Text style={styles.statLabel}>Hút lại</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>Bắt đầu lộ trình mới</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 24 }}
        >
          <View style={styles.actionCard}>
            <Feather name="target" size={24} color={COLORS.ACTIVE} />
            <Text style={styles.actionText}>Lộ trình</Text>
          </View>
          <View style={styles.actionCard}>
            <Feather name="activity" size={24} color={COLORS.ACTIVE} />
            <Text style={styles.actionText}>Công cụ</Text>
          </View>
          <View style={styles.actionCard}>
            <Feather name="bar-chart" size={24} color={COLORS.ACTIVE} />
            <Text style={styles.actionText}>Thống kê</Text>
          </View>
          <View style={styles.actionCard}>
            <Feather name="users" size={24} color={COLORS.ACTIVE} />
            <Text style={styles.actionText}>Diễn đàn</Text>
          </View>
          <View style={styles.actionCard}>
            <Feather name="compass" size={24} color={COLORS.ACTIVE} />
            <Text style={styles.actionText}>Khám phá</Text>
          </View>
        </ScrollView>

        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            🌱 “Mỗi ngày không thuốc lá là một ngày khỏe mạnh hơn!”
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  safeArea: {
    backgroundColor: COLORS.BG,
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  progressCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 8,
  },
  welcome: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: "bold",
  },
  slogan: {
    color: COLORS.SUBTEXT,
    fontSize: 13,
    marginBottom: 12,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statText: {
    color: COLORS.ACTIVE,
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 2,
  },
  statLabel: {
    color: COLORS.SUBTEXT,
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: COLORS.ACTIVE,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  actionCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 72,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    color: COLORS.TEXT,
    marginTop: 8,
    fontSize: 13,
  },
  tipBox: {
    marginTop: 32,
    backgroundColor: COLORS.ACTIVE,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  tipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
