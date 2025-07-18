import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import COLORS from "@/constants/Colors";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlanCountProvider, usePlanCount } from "@/contexts/PlanContext";

function RootLayoutContent() {
  const { planCount, loadingPlansCount } = usePlanCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.light.TAB_BG,
          borderTopWidth: 0,
          height: 66,
        },
        tabBarActiveTintColor: COLORS.light.ACTIVE,
        tabBarInactiveTintColor: COLORS.light.INACTIVE,
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={28}
              color={focused ? COLORS.light.ACTIVE : COLORS.light.INACTIVE}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="template"
        options={{
          title: "Mẫu",
          tabBarIcon: ({ focused }) => (
            <Feather
              name="bookmark"
              size={24}
              color={focused ? COLORS.light.ACTIVE : COLORS.light.INACTIVE}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="myPlan"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: COLORS.light.ACTIVE,
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                borderWidth: 5,
                borderColor: COLORS.light.TAB_BG,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {loadingPlansCount ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.light.PLUS_ICON}
                />
              ) : planCount === 0 ? (
                <Feather name="plus" size={34} color={COLORS.light.PLUS_ICON} />
              ) : (
                <Ionicons
                  name="create-outline"
                  size={30}
                  color={COLORS.light.PLUS_ICON}
                />
              )}
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: "Cộng đồng",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={27}
              color={focused ? COLORS.light.ACTIVE : COLORS.light.INACTIVE}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="compass-outline"
              size={27}
              color={focused ? COLORS.light.ACTIVE : COLORS.light.INACTIVE}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <PlanCountProvider>
        <RootLayoutContent />
      </PlanCountProvider>
    </AuthProvider>
  );
}
