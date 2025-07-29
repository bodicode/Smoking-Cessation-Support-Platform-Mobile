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
  unreadCount?: number;
};

const AVATAR_SIZE = 42;
const PROGRESS_SIZE = 48;

const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onCrownPress, unreadCount }) => {
  const router = useRouter();

  const goToProfile = () => {
    if (user) router.push("/profile");
  };

  const handleCrownPress = () => {
    router.push("/membership");
    if (onCrownPress) {
      onCrownPress();
    }
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
                    {user.avatar_url ? (
                      <Image
                        source={{ uri: user.avatar_url }}
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
          onPress={handleCrownPress}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="crown-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() => router.push("/quiz" as any)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="clipboard-text" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noteBtn}
          onPress={() => router.push("/notification")}
          activeOpacity={0.85}
        >
          <Feather name="bell" size={26} color="#FFFFFF" />
          {unreadCount && unreadCount > 0 && (
            <View style={styles.badgeDot}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.light.BG,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 44,
  },
  leftBox: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { justifyContent: "center", alignItems: "center" },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.light.AVATAR_BG,
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
    borderColor: COLORS.light.ACTIVE,
    zIndex: 1,
  },
  userNameText: {
    color: COLORS.light.TEXT,
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
    marginLeft: 10,
    flexShrink: 1,
  },
  userPointText: {
    color: COLORS.light.INACTIVE,
    fontSize: 14,
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: COLORS.light.ACTIVE,
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
    backgroundColor: COLORS.light.BTN_BG,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginHorizontal: 6,
  },
  quizBtn: {
    marginLeft: 6,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    minHeight: 40,
    backgroundColor: "#FF6B6B", 
    borderRadius: 20,
  },
  noteBtn: {
    marginLeft: 6,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    minHeight: 40,
    backgroundColor: "#E0F0FF", 
    borderRadius: 20,
  },
  badgeDot: {
    position: "absolute",
    top: 3,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.light.BADGE,
    borderWidth: 2,
    borderColor: COLORS.light.BG,
    zIndex: 3,
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12, textAlign: "center" },
});

export default HomeHeader;
