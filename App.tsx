// 1. CRITICAL: Import the global CSS file
// This MUST be the first import to activate NativeWind
import "./global.css";

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
// We installed react-native-safe-area-context, so we'll use its
// SafeAreaView to avoid the phone's notch and home bar.
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    // Use the 'bg-bg-canvas' we defined in tailwind.config.js
    [cite_start]// This is our "Calm Light" theme's outermost background [cite: 1271]
    // 'flex-1' ensures it takes up the full screen
    <SafeAreaView className="flex-1 bg-bg-canvas">
      <View className="flex-1 items-center justify-center px-4">
        
        {/* Test our typography and primary text color.
          - [cite_start]`text-text-primary` (from config) [cite: 1273]
          - [cite_start]`font-inter` (from config) [cite: 1252]
          - [cite_start]`text-2xl` and `font-semibold` (from Style Guide H1) [cite: 1257]
        */}
        <Text className="text-2xl font-semibold font-inter text-text-primary">
          Momentum App
        </Text>

        [cite_start]{/* Test our secondary text color [cite: 1274] */}
        <Text className="mt-2 text-lg font-inter text-text-secondary">
          Smoke Test: Tailwind v3 + NativeWind v2
        </Text>

        [cite_start]{/* Test our custom action color [cite: 1276] */}
        <Text className="mt-4 font-inter text-action-primary">
          This text should be Indigo-600.
        </Text>

        [cite_start]{/* Test one of our custom profile colors [cite: 696] */}
        <Text className="mt-4 font-inter text-profile-blueberry">
          This text should be the Blueberry profile color.
        </Text>

        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}