import React, { ReactNode } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  DimensionValue,
} from "react-native";
import { BlurView } from "expo-blur";
import { GrabHandle } from "@/components/ui/GrabHandle";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: DimensionValue;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  height = "85%",
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop pressable */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView
            intensity={Platform.OS === "ios" ? 40 : 90}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          style={styles.keyboardContainer}
        >
          {/* Glassmorphic Sheet */}
          <BlurView
            intensity={80}
            tint="dark"
            style={[styles.sheetContainer, { height }]}
            className="border-t border-white/20 bg-[#0A0D14]/80"
            experimentalBlurMethod="dimezisBlurView"
          >
            {/* Inner top glow gradient simulation */}
            <View className="absolute top-0 left-0 right-0 h-40 bg-primary/10 pointer-events-none" style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36 }} />
            
            <GrabHandle />
            {children}
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  keyboardContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "95%",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
});
