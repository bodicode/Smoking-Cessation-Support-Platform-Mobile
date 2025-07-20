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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useRouter, useNavigation } from "expo-router";
import { UserService } from "@/services/userService";
import { User } from "@/types/api/user";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

export default function CoachProfileScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>();
  const { id } = route.params;
  const router = useRouter();
  const navigation = useNavigation();

  const [coach, setCoach] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      try {
        setLoading(true);
        const userData = await UserService.getUserById(id);
        setCoach(userData);
        // Set navigation title to user name
        const title = userData.name || `User ${userData.id.slice(0, 8)}` || "User Profile";
        navigation.setOptions({ title });
      } catch (error: any) {
        console.error("Lỗi khi tải thông tin coach:", error);
        Toast.show({
          type: "error",
          text1: "Không thể tải thông tin coach",
          text2: error.message || "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoachProfile();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16F2A8" />
        <Text style={{ color: "#9ca3af", fontSize: 16, marginTop: 10 }}>
          Đang tải thông tin coach...
        </Text>
      </View>
    );
  }

  if (!coach) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>
          Không tìm thấy thông tin user.
        </Text>
      </View>
    );
  }

  // Kiểm tra xem user có phải là coach không
  if (!coach.coach_profile || coach.coach_profile.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>
          Người dùng này không phải là coach.
        </Text>
      </View>
    );
  }

  const coachProfile = coach.coach_profile[0]; // Lấy coach profile đầu tiên

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {coach.avatar_url ? (
              <Image source={{ uri: coach.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#16F2A8" />
              </View>
            )}
          </View>
          <Text style={styles.coachName}>{coach.name}</Text>
          <Text style={styles.coachTitle}>Chuyên gia tư vấn bỏ thuốc</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#FFB936" />
            <Text style={styles.statValue}>
              {coachProfile.average_rating ? coachProfile.average_rating.toFixed(1) : "0.0"}
            </Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#16F2A8" />
            <Text style={styles.statValue}>{coachProfile.total_clients || 0}</Text>
            <Text style={styles.statLabel}>Khách hàng</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FF6B35" />
            <Text style={styles.statValue}>
              {coachProfile.success_rate ? coachProfile.success_rate.toFixed(1) : "0.0"}%
            </Text>
            <Text style={styles.statLabel}>Tỷ lệ thành công</Text>
          </View>
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kinh nghiệm</Text>
          <View style={styles.experienceCard}>
            <View style={styles.experienceItem}>
              <Ionicons name="time" size={20} color="#16F2A8" />
              <Text style={styles.experienceText}>
                {coachProfile.experience_years || 0} năm kinh nghiệm
              </Text>
            </View>
            <View style={styles.experienceItem}>
              <Ionicons name="calendar" size={20} color="#16F2A8" />
              <Text style={styles.experienceText}>
                {coachProfile.total_sessions || 0} buổi tư vấn
              </Text>
            </View>
          </View>
        </View>

        {/* Education Section */}
        {coachProfile.education && coachProfile.education !== "null" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Học vấn</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{coachProfile.education}</Text>
            </View>
          </View>
        )}

        {/* Specializations Section */}
        {coachProfile.specializations && coachProfile.specializations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chuyên môn</Text>
            <View style={styles.specializationsContainer}>
              {coachProfile.specializations.map((spec, index) => (
                <View key={index} style={styles.specializationTag}>
                  <Text style={styles.specializationText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No Specializations Message */}
        {(!coachProfile.specializations || coachProfile.specializations.length === 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chuyên môn</Text>
            <View style={styles.infoCard}>
              <Text style={[styles.infoText, { color: '#9ca3af', fontStyle: 'italic' }]}>
                Chưa có thông tin chuyên môn
              </Text>
            </View>
          </View>
        )}

        {/* Certifications Section */}
        {coachProfile.certifications && coachProfile.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chứng chỉ</Text>
            <View style={styles.certificationsContainer}>
              {coachProfile.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                  <Text style={styles.certificationText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No Certifications Message */}
        {(!coachProfile.certifications || coachProfile.certifications.length === 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chứng chỉ</Text>
            <View style={styles.infoCard}>
              <Text style={[styles.infoText, { color: '#9ca3af', fontStyle: 'italic' }]}>
                Chưa có thông tin chứng chỉ
              </Text>
            </View>
          </View>
        )}

        {/* Professional Bio Section */}
        {coachProfile.professional_bio && coachProfile.professional_bio !== "null" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{coachProfile.professional_bio}</Text>
            </View>
          </View>
        )}

        {/* Approach Description Section */}
        {coachProfile.approach_description && coachProfile.approach_description !== "null" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương pháp tư vấn</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{coachProfile.approach_description}</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
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
  header: {
    backgroundColor: "#E5F9F4",
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E1F9F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  coachName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  coachTitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  experienceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  experienceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  specializationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specializationTag: {
    backgroundColor: "#E1F9F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#16F2A8",
  },
  specializationText: {
    fontSize: 14,
    color: "#0E9F6E",
    fontWeight: "500",
  },
  certificationsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 8,
  },
  contactSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  contactButton: {
    backgroundColor: "#16F2A8",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
}); 