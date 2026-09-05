import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "@/constants/images";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { AnimatedBox } from "@/components/ui/AnimatedBox";
import { useAppStore } from "@/store/useAppStore";
import { MaterialIconName } from "@/types";

type PlanType = "annual" | "monthly" | "lifetime";

interface FeatureItem {
  icon: MaterialIconName;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const PRO_FEATURES: FeatureItem[] = [
  {
    icon: "all-inclusive",
    title: "Unlimited Accounts & Cards",
    description: "Break the 3-account ceiling. Connect every bank, e-wallet, cash reserve, and credit line.",
    iconBg: "rgba(178, 197, 255, 0.15)",
    iconColor: "#B2C5FF",
  },
  {
    icon: "auto-graph",
    title: "Predictive Cash Flow",
    description: "Forecast your available balances 90 days out and simulate major purchases before spending.",
    iconBg: "rgba(77, 224, 130, 0.15)",
    iconColor: "#4DE082",
  },
  {
    icon: "receipt-long",
    title: "Smart Recurring & Bill Tracker",
    description: "Automate recurring templates, track billing cycles, and eliminate unwanted subscriptions.",
    iconBg: "rgba(251, 191, 36, 0.15)",
    iconColor: "#FBBF24",
  },
  {
    icon: "security",
    title: "Encrypted Cloud Vault",
    description: "Zero-knowledge encryption for multi-device sync, daily cloud backups, and biometric security.",
    iconBg: "rgba(192, 132, 252, 0.15)",
    iconColor: "#C084FC",
  },
  {
    icon: "file-download",
    title: "Custom Categories & Tax Export",
    description: "Create limitless custom budget tags and export clean CSV/PDF accounting ledgers.",
    iconBg: "rgba(56, 189, 248, 0.15)",
    iconColor: "#38BDF8",
  },
];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currency = useAppStore((state) => state.currency);
  const currencySymbol = currency?.symbol || "₱";

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore Purchases",
      "Scanning App Store & Google Play receipts for prior purchases...",
      [
        {
          text: "OK",
          onPress: () => {
            Alert.alert("No Prior Purchases Found", "You currently do not have an active Stackly Pro subscription linked to this account.");
          },
        },
      ]
    );
  };

  const handlePurchase = () => {
    setIsPurchasing(true);

    setTimeout(() => {
      setIsPurchasing(false);
      Alert.alert(
        "🎉 Welcome to Stackly Pro!",
        `Your ${selectedPlan.toUpperCase()} subscription is now activated (Demo Mode). You can now create unlimited accounts, cards, and custom categories!`,
        [
          {
            text: "Let's Go",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    }, 900);
  };

  return (
    <View className="flex-1 bg-[#090B10]" style={{ paddingTop: insets.top }}>
      {/* Top Navigation Bar */}
      <View className="px-5 py-3 flex-row items-center justify-between z-50">
        <Pressable
          onPress={handleClose}
          hitSlop={12}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10 active:opacity-70"
        >
          <MaterialIcons name="close" size={22} color="#DFE2F1" />
        </Pressable>

        <Pressable
          onPress={handleRestore}
          hitSlop={12}
          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:opacity-70"
        >
          <Text className="text-xs font-semibold text-on-surface-variant">
            Restore
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 24) + 90,
        }}
      >
        {/* Hero Visual Card */}
        <AnimatedBox delay={0} className="mt-2 mb-6 rounded-[28px] overflow-hidden border border-white/10 bg-[#121622] relative">
          <View className="h-52 w-full relative">
            <Image
              source={images.subscriptionHero}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            {/* Ambient Multi-Stop Gradient Overlay */}
            <View style={styles.heroOverlayGradient} />

            {/* Floating Pro Badge */}
            <View className="absolute top-4 left-4 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#090B10]/80 border border-primary/40 backdrop-blur-md">
              <MaterialIcons name="star" size={14} color="#B2C5FF" />
              <Text className="text-[11px] font-black text-primary tracking-wider uppercase">
                Stackly Pro
              </Text>
            </View>
          </View>

          {/* Hero Pitch */}
          <View className="p-5 pt-3">
            <Text className="text-2xl font-black text-white tracking-tight leading-tight mb-2">
              Supercharge your wealth engine.
            </Text>
            <Text className="text-sm text-on-surface-variant leading-relaxed font-normal">
              Unlock unlimited accounts & cards, predictive recurring forecasts, and zero-compromise financial control.
            </Text>
          </View>
        </AnimatedBox>

        {/* Feature Highlights Grid */}
        <AnimatedBox delay={50} className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-3.5 px-1">
            Everything in Stackly Pro
          </Text>

          <View className="flex-col gap-3">
            {PRO_FEATURES.map((feat, idx) => (
              <View
                key={idx}
                className="flex-row items-start gap-3.5 p-3.5 rounded-2xl bg-surface-container/80 border border-outline-variant/30"
              >
                <View
                  style={{ backgroundColor: feat.iconBg }}
                  className="w-10 h-10 rounded-xl items-center justify-center mt-0.5"
                >
                  <MaterialIcons name={feat.icon} size={20} color={feat.iconColor} />
                </View>
                <View className="flex-1 pr-1">
                  <Text className="text-sm font-bold text-on-surface mb-0.5">
                    {feat.title}
                  </Text>
                  <Text className="text-xs text-on-surface-variant leading-normal">
                    {feat.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </AnimatedBox>

        {/* Plan Selection Cards */}
        <AnimatedBox delay={100} className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-3.5 px-1">
            Choose Your Plan
          </Text>

          <View className="flex-col gap-3">
            {/* Annual Plan (Featured) */}
            <Pressable
              onPress={() => setSelectedPlan("annual")}
              style={[
                styles.planCard,
                selectedPlan === "annual" ? styles.planCardActive : styles.planCardInactive,
              ]}
            >
              {/* Best Value Badge */}
              <View className="absolute -top-3 right-5 bg-gradient-to-r bg-[#4F46E5] px-3 py-0.5 rounded-full border border-white/20 shadow-md">
                <Text className="text-[10px] font-black text-white tracking-wide uppercase">
                  SAVE 58% • POPULAR
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === "annual" && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === "annual" && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-white">
                      Annual Access
                    </Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">
                      7-day free trial, then {currencySymbol}1,788/year
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-lg font-black text-primary">
                    {currencySymbol}149<Text className="text-xs font-semibold text-on-surface-variant">/mo</Text>
                  </Text>
                  <Text className="text-[10px] text-secondary font-bold">
                    Billed yearly
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              onPress={() => setSelectedPlan("monthly")}
              style={[
                styles.planCard,
                selectedPlan === "monthly" ? styles.planCardActive : styles.planCardInactive,
              ]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === "monthly" && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === "monthly" && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-white">
                      Monthly
                    </Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">
                      Cancel anytime with no commitments
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-lg font-black text-white">
                    {currencySymbol}359<Text className="text-xs font-semibold text-on-surface-variant">/mo</Text>
                  </Text>
                  <Text className="text-[10px] text-on-surface-variant font-medium">
                    Billed monthly
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Lifetime Plan */}
            <Pressable
              onPress={() => setSelectedPlan("lifetime")}
              style={[
                styles.planCard,
                selectedPlan === "lifetime" ? styles.planCardActive : styles.planCardInactive,
              ]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === "lifetime" && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === "lifetime" && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text className="text-base font-extrabold text-white">
                      Lifetime Founder
                    </Text>
                    <Text className="text-xs text-on-surface-variant mt-0.5">
                      Pay once, own Stackly Pro forever
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-lg font-black text-[#FBBF24]">
                    {currencySymbol}4,990
                  </Text>
                  <Text className="text-[10px] text-on-surface-variant font-medium">
                    One-time payment
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </AnimatedBox>

        {/* Social Proof Quote */}
        <AnimatedBox delay={130} className="p-4 rounded-2xl bg-surface-container-lowest border border-white/5 mb-4">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcons key={s} name="star" size={14} color="#FBBF24" />
            ))}
            <Text className="text-xs font-bold text-white ml-1">4.9 / 5.0</Text>
          </View>
          <Text className="text-xs text-on-surface-variant italic leading-relaxed">
            &ldquo;Stackly replaced 4 different budgeting spreadsheets. Having all my bank cards and cash in one loop is a game changer.&rdquo;
          </Text>
          <Text className="text-[11px] font-semibold text-primary mt-1.5">
            — Marc V., Product Designer & Real Estate Investor
          </Text>
        </AnimatedBox>

        {/* Disclaimer / Terms */}
        <Text className="text-[10px] text-outline text-center leading-relaxed px-4">
          Payment will be charged to your App Store / Google Play account at confirmation of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-[#090B10]/95 border-t border-white/10 backdrop-blur-xl"
      >
        <ScaleButton
          activeScale={0.96}
          onPress={handlePurchase}
          disabled={isPurchasing}
          className="w-full py-4 rounded-2xl bg-primary items-center justify-center shadow-2xl flex-row gap-2 border border-white/20"
        >
          <MaterialIcons
            name={selectedPlan === "annual" ? "lock-open" : "bolt"}
            size={20}
            color="#002C72"
          />
          <Text className="text-base font-black text-[#002C72] tracking-tight">
            {isPurchasing
              ? "Processing..."
              : selectedPlan === "annual"
              ? "Start 7-Day Free Trial"
              : "Upgrade to Stackly Pro"}
          </Text>
        </ScaleButton>

        <Text className="text-[10px] text-on-surface-variant text-center mt-2 font-medium">
          {selectedPlan === "annual"
            ? "7 days free, then automatically renews. Cancel anytime."
            : "Instant activation. Cancel anytime in settings."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(9, 11, 16, 0.4)",
  },
  planCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    position: "relative",
  },
  planCardActive: {
    backgroundColor: "rgba(178, 197, 255, 0.1)",
    borderColor: "#B2C5FF",
  },
  planCardInactive: {
    backgroundColor: "rgba(28, 31, 42, 0.7)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: "#B2C5FF",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B2C5FF",
  },
  bottomBarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
});
