import React, { useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import COLORS from "@/constants/Colors";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.light.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={COLORS.light.PRIMARY_GREEN}
          />
        </View>

        <Text style={styles.name}>
          {user?.user_metadata?.name || user?.email || "Người dùng"}
        </Text>
        <Text style={styles.email}>{user?.email || "Chưa có email"}</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="cog-outline"
            size={20}
            color={COLORS.light.TEXT}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>Cài đặt tài khoản</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.light.SUBTEXT}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={COLORS.light.TEXT}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>Trợ giúp & Hỗ trợ</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.light.SUBTEXT}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={COLORS.light.WHITE}
            style={styles.actionIcon}
          />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
    alignItems: "center",
    paddingTop: 0,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.light.BG,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  placeholderRight: {
    width: 24,
  },

  profileCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 20,
    padding: 25,
    width: "90%",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarContainer: {
    marginBottom: 20,
    marginTop: -20,
    backgroundColor: COLORS.light.BG,
    borderRadius: 50,
    padding: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    marginBottom: 30,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.light.TEXT,
    fontWeight: "500",
  },

  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.PRIMARY_RED,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    shadowColor: COLORS.light.PRIMARY_RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
