import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { AuthService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import loginSchema from "@/schemas/loginSchema";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    setLoading(true);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    try {
      const result = await AuthService.login(email, password);

      if (result?.access_token) {
        setUser(result.user);
        await AsyncStorage.setItem("access_token", result.access_token);
        router.replace("/");
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công",
          text2: `Chào mừng, ${result.user.user_metadata.name}!`,
        });
      } else {
        setErrors({ general: "Sai email hoặc mật khẩu!" });
      }
    } catch (err: any) {
      const rawMessage =
        err?.message ||
        err?.graphQLErrors?.[0]?.message ||
        "Đã xảy ra lỗi, thử lại sau!";
      if (
        rawMessage.includes("Cannot read properties of null") &&
        rawMessage.includes("id")
      ) {
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: "Email hoặc mật khẩu không đúng!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: rawMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.card}>
        <Ionicons
          name="person-circle-outline"
          size={64}
          color={COLORS.light.ACTIVE}
          style={{ alignSelf: "center", marginBottom: 10 }}
        />
        <Text style={styles.title}>Đăng nhập</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email"
          placeholderTextColor={COLORS.light.PLACEHOLDER}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
        {errors.email && (
          <Text style={{ color: "red", marginBottom: 4 }}>{errors.email}</Text>
        )}

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor={COLORS.light.PLACEHOLDER}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        {errors.password && (
          <Text style={{ color: "red", marginBottom: 4 }}>
            {errors.password}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            loading && { backgroundColor: COLORS.light.PLACEHOLDER },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkBox}>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            style={{ marginBottom: 6 }}
          >
            <Text style={styles.secondaryLink}>
              Bạn chưa có tài khoản?{" "}
              <Text style={{ color: COLORS.light.ACTIVE, fontWeight: "bold" }}>
                Đăng ký
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.link}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "92%",
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    color: COLORS.light.ACTIVE,
    fontSize: 26,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
  },
  label: {
    color: COLORS.light.SUBTEXT,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.light.WHITE,
    color: COLORS.light.TEXT,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1.1,
    borderColor: COLORS.light.TAB_BG,
    marginBottom: 2,
  },
  button: {
    backgroundColor: COLORS.light.ACTIVE,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
    shadowColor: COLORS.light.ACTIVE,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkBox: { alignItems: "center", marginTop: 12 },
  link: {
    color: COLORS.light.ACTIVE,
    textAlign: "center",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  secondaryLink: {
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    fontSize: 14,
    marginTop: 2,
  },
});
