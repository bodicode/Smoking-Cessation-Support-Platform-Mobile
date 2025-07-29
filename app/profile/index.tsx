import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import COLORS from "@/constants/Colors";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/userService";
import { User } from "@/types/api/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = user.id;
        if (userId) {
          const data = await UserService.getUserById(userId);
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.light.PRIMARY_GREEN, COLORS.light.PRIMARY_GREEN + '80']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.light.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
            <View style={styles.placeholderRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </View>
    );
  }

  const memberProfile = userData?.member_profile?.[0];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.light.PRIMARY_GREEN, COLORS.light.PRIMARY_GREEN + '80']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.light.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
          <View style={styles.placeholderRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.light.PRIMARY_GREEN, COLORS.light.PRIMARY_GREEN + 'CC']}
              style={styles.avatarGradient}
            >
              <Ionicons
                name="person"
                size={50}
                color={COLORS.light.WHITE}
              />
            </LinearGradient>
          </View>

          <Text style={styles.name}>
            {userData?.name || user?.email || "Người dùng"}
          </Text>
          <Text style={styles.email}>{user?.email || "Chưa có email"}</Text>

          {/* Member Profile Information */}
          {memberProfile && (
            <View style={styles.memberInfo}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-circle" size={24} color={COLORS.light.PRIMARY_GREEN} />
                <Text style={styles.sectionTitle}>Thông tin thành viên</Text>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Ionicons name="flame" size={24} color={COLORS.light.PRIMARY_GREEN} />
                  <Text style={styles.statValue}>{memberProfile.cigarettes_per_day}</Text>
                  <Text style={styles.statLabel}>Điếu/ngày</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={24} color={COLORS.light.PRIMARY_GREEN} />
                  <Text style={styles.statValue}>{memberProfile.smoking_years}</Text>
                  <Text style={styles.statLabel}>Năm hút</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="refresh" size={24} color={COLORS.light.PRIMARY_GREEN} />
                  <Text style={styles.statValue}>{memberProfile.previous_attempts}</Text>
                  <Text style={styles.statLabel}>Lần thử</Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="flame" size={16} color={COLORS.light.PRIMARY_GREEN} />
                  </View>
                  <Text style={styles.detailLabel}>Mức nicotine:</Text>
                  <Text style={styles.detailValue}>{memberProfile.nicotine_level}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="pulse" size={16} color={COLORS.light.PRIMARY_GREEN} />
                  </View>
                  <Text style={styles.detailLabel}>Mức độ căng thẳng:</Text>
                  <Text style={styles.detailValue}>{memberProfile.stress_level}/5</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="people" size={16} color={COLORS.light.PRIMARY_GREEN} />
                  </View>
                  <Text style={styles.detailLabel}>Hỗ trợ xã hội:</Text>
                  <Text style={styles.detailValue}>
                    {memberProfile.social_support ? "Có" : "Không"}
                  </Text>
                </View>

                {memberProfile.brand_preference && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="star" size={16} color={COLORS.light.PRIMARY_GREEN} />
                    </View>
                    <Text style={styles.detailLabel}>Nhãn hiệu ưa thích:</Text>
                    <Text style={styles.detailValue}>{memberProfile.brand_preference}</Text>
                  </View>
                )}
              </View>

              {memberProfile.health_conditions && memberProfile.health_conditions.length > 0 && (
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medical" size={20} color={COLORS.light.PRIMARY_GREEN} />
                    <Text style={styles.sectionTitle}>Tình trạng sức khỏe</Text>
                  </View>
                  {memberProfile.health_conditions.map((condition, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.light.PRIMARY_GREEN} />
                      <Text style={styles.listText}>{condition}</Text>
                    </View>
                  ))}
                </View>
              )}

              {memberProfile.trigger_factors && memberProfile.trigger_factors.length > 0 && (
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="warning" size={20} color={COLORS.light.PRIMARY_GREEN} />
                    <Text style={styles.sectionTitle}>Yếu tố kích thích</Text>
                  </View>
                  {memberProfile.trigger_factors.map((factor, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.light.PRIMARY_GREEN} />
                      <Text style={styles.listText}>{factor}</Text>
                    </View>
                  ))}
                </View>
              )}

              {memberProfile.preferred_support && memberProfile.preferred_support.length > 0 && (
                <View style={styles.infoSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="heart" size={20} color={COLORS.light.PRIMARY_GREEN} />
                    <Text style={styles.sectionTitle}>Hỗ trợ ưa thích</Text>
                  </View>
                  {memberProfile.preferred_support.map((support, index) => (
                    <View key={index} style={styles.listItem}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.light.PRIMARY_GREEN} />
                      <Text style={styles.listText}>{support}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.dateContainer}>
                <Ionicons name="time" size={16} color={COLORS.light.SUBTEXT} />
                <Text style={styles.dateText}>Ghi nhận: {formatDate(memberProfile.recorded_at)}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LinearGradient
              colors={[COLORS.light.PRIMARY_RED, COLORS.light.PRIMARY_RED + 'CC']}
              style={styles.logoutGradient}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={COLORS.light.WHITE}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Transaction Button */}
          <TouchableOpacity
            style={styles.transactionBtn}
            onPress={() => router.push("/transaction")}
          >
            <LinearGradient
              colors={[COLORS.light.PRIMARY_GREEN, COLORS.light.PRIMARY_GREEN + 'CC']}
              style={styles.transactionGradient}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={COLORS.light.WHITE}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Giao dịch</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },

  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.WHITE,
  },
  placeholderRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
  },

  profileCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 25,
    padding: 25,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },

  avatarContainer: {
    marginBottom: 20,
    marginTop: -30,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.light.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 5,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    marginBottom: 25,
    textAlign: "center",
  },

  memberInfo: {
    width: "100%",
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginLeft: 8,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: COLORS.light.WHITE,
    padding: 15,
    borderRadius: 15,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_GREEN,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.light.SUBTEXT,
    marginTop: 2,
  },

  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  detailIcon: {
    width: 24,
    alignItems: "center",
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    fontWeight: "600",
  },

  infoSection: {
    marginBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  listText: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    marginLeft: 8,
    flex: 1,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.LIGHT_GREY_BG,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.light.SUBTEXT,
    marginLeft: 5,
  },

  logoutBtn: {
    width: "100%",
    marginTop: 10,
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: COLORS.light.PRIMARY_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: COLORS.light.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
  // Transaction button styles
  transactionBtn: {
    width: "100%",
    marginTop: 10,
  },
  transactionGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: COLORS.light.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
});
