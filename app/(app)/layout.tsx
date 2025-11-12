import { Tabs } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Focus",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="gear" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}