import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "@/types/api/user";

type HomeHeaderProps = {
  user: User | null;
  onCrownPress?: () => void;
  onNotePress?: () => void;
};

const AVATAR_SIZE = 42;
const PROGRESS_SIZE = 48;

const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  onCrownPress,
  onNotePress,
}) => {
  const router = useRouter();

  const goToProfile = () => {
    if (user) router.push("/profile");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.leftBox}>
          {user ? (
            <>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={goToProfile}
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrap}>
                  <View style={styles.avatarCircle}>
                    {user.avatarUrl ? (
                      <Image
                        source={{ uri: user.avatarUrl }}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={24}
                        color="#fff"
                      />
                    )}
                  </View>
                  <View style={styles.avatarProgress} />
                </View>
                <Text style={styles.userNameText}>
                  {user.user_metadata?.name || user.email}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/login")}
              activeOpacity={0.85}
            >
              <Text style={styles.loginText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.crownBtn}
          onPress={onCrownPress}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="crown-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BG,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 18,
    minHeight: 44,
  },
  leftBox: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { justifyContent: "center", alignItems: "center" },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.AVATAR_BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarProgress: {
    position: "absolute",
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
    borderRadius: PROGRESS_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.ACTIVE,
    zIndex: 1,
  },
  userNameText: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
    marginLeft: 12,
  },
  userPointText: {
    color: COLORS.INACTIVE,
    fontSize: 14,
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: COLORS.ACTIVE,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 22,
    minWidth: 95,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  crownBtn: {
    backgroundColor: COLORS.BTN_BG,
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginHorizontal: 10,
  },
  noteBtn: {
    marginLeft: 8,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 42,
    minHeight: 42,
  },
  badgeDot: {
    position: "absolute",
    top: 3,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.BADGE,
    borderWidth: 2,
    borderColor: COLORS.BG,
    zIndex: 3,
  },
});

export default HomeHeader;
