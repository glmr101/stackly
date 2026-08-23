import { View, Pressable } from "react-native";

export function Toggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <Pressable
      className={`w-12 h-6 rounded-full justify-center px-1 transition-colors ${
        value ? "bg-primary" : "bg-surface-variant"
      }`}
      onPress={() => onValueChange(!value)}
    >
      <View
        className={`w-4 h-4 rounded-full transition-transform ${
          value ? "translate-x-6 bg-on-primary" : "translate-x-0 bg-outline"
        }`}
      />
    </Pressable>
  );
}
