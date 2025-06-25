import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import COLORS from "@/constants/Colors";
import { AuthService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import registerSchema from "@/schemas/registerSchema";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const { setUser } = useAuth();

  const handleRegister = async () => {
    setLoading(true);

    const result = registerSchema.safeParse({
      name,
      email,
      username,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    } else {
      setErrors({});
    }

    try {
      const apiResult = await AuthService.register({
        email,
        password,
        confirmPassword,
        name,
        username,
      });
      setLoading(false);

      if (apiResult?.access_token) {
        setUser(apiResult.user);
        await AsyncStorage.setItem("access_token", apiResult.access_token);
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
        });
        router.replace("/home");
      } else {
        setErrors({ general: "Thông tin chưa hợp lệ hoặc đã tồn tại!" });
      }
    } catch (err: any) {
      setLoading(false);

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
          text1: "Đăng ký thất bại",
          text2: "Email đã tồn tại hoặc không hợp lệ!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: rawMessage,
        });
      }

      setErrors({ general: rawMessage });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.card}>
        <Ionicons
          name="person-add-outline"
          size={64}
          color={COLORS.ACTIVE}
          style={{ alignSelf: "center", marginBottom: 10 }}
        />
        <Text style={styles.title}>Đăng ký</Text>

        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ tên"
          placeholderTextColor={COLORS.PLACEHOLDER}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập"
          placeholderTextColor={COLORS.PLACEHOLDER}
          value={username}
          onChangeText={setUsername}
          editable={!loading}
        />
        {errors.username && (
          <Text style={styles.errorText}>{errors.username}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email"
          placeholderTextColor={COLORS.PLACEHOLDER}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor={COLORS.PLACEHOLDER}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor={COLORS.PLACEHOLDER}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            loading && { backgroundColor: COLORS.PLACEHOLDER },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkBox}>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.link}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "92%",
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    color: COLORS.ACTIVE,
    fontSize: 26,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
  },
  label: {
    color: COLORS.SUBTEXT,
    fontSize: 15,
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.WHITE,
    color: COLORS.TEXT,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1.1,
    borderColor: COLORS.TAB_BG,
    marginBottom: 2,
  },
  button: {
    backgroundColor: COLORS.ACTIVE,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
    shadowColor: COLORS.ACTIVE,
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
    color: COLORS.ACTIVE,
    textAlign: "center",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 2,
  },
});
