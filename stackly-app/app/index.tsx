import { View, ActivityIndicator } from "react-native";

export default function Index() {
  // This screen is only shown briefly while _layout.tsx
  // determines auth state and redirects accordingly.
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f131d" }}>
      <ActivityIndicator color="#b2c5ff" />
    </View>
  );
}
