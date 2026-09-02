import React, { useEffect, useState } from "react";
import { View, Text, Switch, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { useAppStore } from "@/store/useAppStore";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";

export default function SecurityBiometrics() {
  const router = useRouter();

  const biometricLockEnabled = useAppStore(
    (state) => state.biometricLockEnabled
  );
  const setBiometricLockEnabled = useAppStore(
    (state) => state.setBiometricLockEnabled
  );

  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const hardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasHardware(hardware);
        setIsEnrolled(enrolled);
      } catch {
        setHasHardware(false);
        setIsEnrolled(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const canEnable = hasHardware && isEnrolled;

  const biometricLabel =
    Platform.OS === "ios" ? "Face ID / Touch ID" : "Fingerprint / Biometrics";

  const handleToggle = async (value: boolean) => {
    if (!value) {
      // Turning off — no auth needed
      setBiometricLockEnabled(false);
      return;
    }

    // Turning on — verify identity first
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to enable app lock",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      setBiometricLockEnabled(true);
    }
  };

  const getStatusMessage = (): string | null => {
    if (checking) return null;
    if (!hasHardware)
      return "This device does not have biometric hardware (Face ID, Touch ID, or fingerprint sensor).";
    if (!isEnrolled)
      return `No biometrics enrolled. Go to your device settings to set up ${biometricLabel}.`;
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />

      {/* Header */}
      <View className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
        <View className="flex-row items-center gap-3">
          <ScaleButton
            activeScale={0.88}
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={22} color="#DFE2F1" />
          </ScaleButton>
          <Text className="text-xl font-extrabold text-on-surface tracking-tight">
            Security & Biometrics
          </Text>
        </View>
      </View>

      <View className="px-5 py-5 flex-col gap-6">
        {/* Info card */}
        <View className="p-4 bg-surface-container rounded-[24px] border border-outline-variant/30 shadow-sm flex-row items-center gap-3.5">
          <View className="w-11 h-11 rounded-2xl bg-[#C084FC20] items-center justify-center border border-[#C084FC30]">
            <MaterialIcons name="fingerprint" size={24} color="#C084FC" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-on-surface">
              {biometricLabel}
            </Text>
            <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
              Require authentication when opening the app
            </Text>
          </View>
        </View>

        {/* Toggle card */}
        <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
          <View
            className="flex-row items-center justify-between p-4"
            style={{ opacity: canEnable ? 1 : 0.5 }}
          >
            <View className="flex-row items-center gap-3.5 flex-1">
              <View className="w-10 h-10 rounded-xl bg-[#C084FC20] items-center justify-center">
                <MaterialIcons name="lock" size={20} color="#C084FC" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">
                  App Lock
                </Text>
                <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                  {biometricLockEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricLockEnabled}
              onValueChange={handleToggle}
              disabled={!canEnable || checking}
              trackColor={{ false: "#3E4150", true: "#B2C5FF40" }}
              thumbColor={biometricLockEnabled ? "#B2C5FF" : "#8D909F"}
            />
          </View>
        </View>

        {/* Status message when biometrics unavailable */}
        {statusMessage && (
          <View className="p-4 bg-error-container/20 rounded-2xl border border-error/20 flex-row items-start gap-3">
            <MaterialIcons
              name="info-outline"
              size={18}
              color="#FFB4AB"
              style={{ marginTop: 1 }}
            />
            <Text className="text-xs text-on-surface-variant leading-relaxed flex-1">
              {statusMessage}
            </Text>
          </View>
        )}

        {/* Explanation */}
        <View className="px-1">
          <Text className="text-xs text-outline leading-relaxed">
            When enabled, Stackly will require {biometricLabel.toLowerCase()}{" "}
            authentication each time you open the app or return from the
            background.
          </Text>
        </View>
      </View>
    </View>
  );
}
