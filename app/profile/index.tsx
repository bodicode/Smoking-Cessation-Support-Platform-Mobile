import React, { useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import COLORS from "@/constants/Colors";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerBackTitleVisible: false,
    });
  }, [navigation]);

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
    backgroundColor: COLORS.light.BG,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 18,
  },
  name: {
    fontSize: 18,
    color: COLORS.light.ACTIVE,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: { fontSize: 15, color: COLORS.light.SUBTEXT, marginBottom: 32 },
  logoutBtn: {
    backgroundColor: COLORS.light.ACTIVE,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
