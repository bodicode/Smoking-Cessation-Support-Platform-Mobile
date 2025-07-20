import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { ApolloProvider } from "@apollo/client";
import client from "@/libs/apollo-client";
import { AuthProvider } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/toastConfig";
import { ProgressProvider } from "@/contexts/ProgressRecordContext";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ProgressProvider>
          <RootLayoutNav />
        </ProgressProvider>
      </AuthProvider>
      <Toast position="bottom" config={toastConfig} />
    </ApolloProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="chat/index" 
          options={{ 
            title: "Đoạn chat",
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="chat/[chatRoomId]" 
          options={{ 
            title: "Đoạn chat",
            headerShown: true,
            headerBackTitle: "Quay lại"
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
