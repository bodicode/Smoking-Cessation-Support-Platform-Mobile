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

const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  onCrownPress,
  unreadCount,
}) => {
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
        {/* Left: Avatar + Name */}
        <View style={styles.leftBox}>
          {user ? (
            <TouchableOpacity
              style={styles.avatarInfo}
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
              <Text
                style={styles.userNameText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user.user_metadata?.name || user.email}
              </Text>
            </TouchableOpacity>
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

        {/* Right: Icon Buttons */}
        <View style={styles.rightBox}>
          {/* Chat icon button - leftmost, rounded-rectangle, same height as other icons */}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push("/chat")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="chat-outline" size={22} color={COLORS.light.PRIMARY_BLUE} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleCrownPress}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="crown-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#FF6B6B" }]}
            onPress={() => router.push("/quiz" as any)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="clipboard-text" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#E0F0FF" }]}
            onPress={() => router.push("/notification")}
            activeOpacity={0.85}
          >
            <Feather name="bell" size={22} color="#000" />
            {unreadCount && unreadCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 44,
  },
  leftBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 16,
    marginLeft: 0,
    marginRight: 2,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.10,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  chatBtnText: {
    marginLeft: 7,
    color: COLORS.light.PRIMARY_BLUE,
    fontWeight: "bold",
    fontSize: 15,
  },
  avatarInfo: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0, // quan trọng để giới hạn độ rộng khi flex: 1
  },
  avatarWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
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
    flexShrink: 1,
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light.BTN_BG,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 3,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.light.BADGE,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
    textAlign: "center",
  },
});

export default HomeHeader;
