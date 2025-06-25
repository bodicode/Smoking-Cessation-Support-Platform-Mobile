import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import COLORS from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Xác nhận đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin tài khoản</Text>
      <Text style={styles.name}>
        {user?.user_metadata?.name || user?.email}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT,
    marginBottom: 18,
  },
  name: {
    fontSize: 18,
    color: COLORS.ACTIVE,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: { fontSize: 15, color: COLORS.SUBTEXT, marginBottom: 32 },
  logoutBtn: {
    backgroundColor: COLORS.ACTIVE,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
