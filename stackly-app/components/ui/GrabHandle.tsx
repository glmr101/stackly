import React from "react";
import { View } from "react-native";

export function GrabHandle() {
  return (
    <View className="items-center pt-3 pb-1">
      <View className="w-10 h-1 rounded-full bg-outline/40" />
    </View>
  );
}

export default GrabHandle;
