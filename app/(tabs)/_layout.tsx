import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import COLORS from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.TAB_BG,
          borderTopWidth: 0,
          height: 66,
        },
        tabBarActiveTintColor: COLORS.ACTIVE,
        tabBarInactiveTintColor: COLORS.INACTIVE,
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
              color={focused ? COLORS.ACTIVE : "#fff"}
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
              color={focused ? COLORS.ACTIVE : "#fff"}
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
                backgroundColor: COLORS.ACTIVE,
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                borderWidth: 5,
                borderColor: COLORS.TAB_BG,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Feather name="plus" size={34} color={COLORS.PLUS_ICON} />
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
              color={focused ? COLORS.ACTIVE : "#fff"}
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
              color={focused ? COLORS.ACTIVE : "#fff"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
