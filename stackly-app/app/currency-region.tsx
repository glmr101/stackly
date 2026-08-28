import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { POPULAR_REGIONS, ALL_CURRENCIES } from "@/data/currencies";
import { Region, Currency } from "@/types";
import { ScaleButton } from "@/components/ui/ScaleButton";
import { GrabHandle } from "@/components/ui/GrabHandle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type TabMode = "region" | "currency";

export default function CurrencyRegion() {
  const router = useRouter();

  const currentRegion = useAppStore((state) => state.region);
  const currentCurrency = useAppStore((state) => state.currency);
  const setRegion = useAppStore((state) => state.setRegion);
  const setCurrency = useAppStore((state) => state.setCurrency);

  const [tab, setTab] = useState<TabMode>("region");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return POPULAR_REGIONS;
    return POPULAR_REGIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.defaultCurrency.code.toLowerCase().includes(q) ||
        r.defaultCurrency.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectRegion = (region: Region) => {
    setRegion(region);
  };

  const handleSelectCurrency = (currency: Currency) => {
    setCurrency(currency);
  };

  return (
    <View className="flex-1 bg-background">
      <GrabHandle />

      {/* Top Header */}
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
            Currency & Region
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 py-5 flex-col gap-6">
          {/* Active Selection Hero Preview Card */}
          <View className="p-5 bg-surface-container rounded-[28px] border border-white/10 shadow-lg relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Current Settings
              </Text>
              <View className="bg-secondary/15 px-2.5 py-1 rounded-full border border-secondary/30 flex-row items-center gap-1">
                <MaterialIcons name="check-circle" size={12} color="#4DE082" />
                <Text className="text-[10px] font-bold text-secondary uppercase">
                  Active
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant/30 items-center justify-center">
                <Text className="text-3xl">{currentRegion?.flag || "🌍"}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-on-surface" numberOfLines={1}>
                  {currentRegion?.name || "United States"}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-xs text-primary font-bold">
                    {currentCurrency?.code || "USD"} ({currentCurrency?.symbol || "$"})
                  </Text>
                  <Text className="text-xs text-on-surface-variant font-medium">
                    • {currentCurrency?.name || "US Dollar"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Live Format Example Preview */}
            <View className="mt-4 pt-3.5 border-t border-white/5 flex-row items-center justify-between">
              <Text className="text-xs text-on-surface-variant font-medium">
                Live App Preview:
              </Text>
              <AnimatedCounter
                value={12450.5}
                decimals={2}
                className="text-base font-extrabold text-on-surface"
              />
            </View>
          </View>

          {/* Mode Switcher */}
          <SegmentedControl<TabMode>
            options={[
              { value: "region", label: "By Country / Region" },
              { value: "currency", label: "All Currencies" },
            ]}
            selectedValue={tab}
            onChange={setTab}
          />

          {/* Search Input Bar */}
          <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
            <MaterialIcons name="search" size={20} color="#8D909F" />
            <TextInput
              className="flex-1 text-on-surface text-sm p-3 h-12"
              placeholder={
                tab === "region"
                  ? "Search countries, codes, or currencies..."
                  : "Search currency name or code..."
              }
              placeholderTextColor="#8D909F"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <ScaleButton
                activeScale={0.88}
                onPress={() => setSearchQuery("")}
                className="w-7 h-7 rounded-full bg-surface-container-highest items-center justify-center"
              >
                <MaterialIcons name="close" size={14} color="#C3C6D6" />
              </ScaleButton>
            )}
          </View>

          {/* Region / Country List */}
          {tab === "region" && (
            <View className="flex-col gap-2.5">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">
                Select Region ({filteredRegions.length})
              </Text>

              <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
                {filteredRegions.map((region, index) => {
                  const isSelected = currentRegion?.code === region.code;
                  const isLast = index === filteredRegions.length - 1;

                  return (
                    <ScaleButton
                      key={region.code}
                      activeScale={0.98}
                      onPress={() => handleSelectRegion(region)}
                      className={`flex-row items-center justify-between p-4 ${
                        !isLast ? "border-b border-outline-variant/20" : ""
                      } ${isSelected ? "bg-primary/10" : ""}`}
                    >
                      <View className="flex-row items-center gap-3.5 flex-1">
                        <View className="w-10 h-10 rounded-xl bg-surface-container-highest items-center justify-center">
                          <Text className="text-xl">{region.flag}</Text>
                        </View>

                        <View className="flex-1">
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-primary" : "text-on-surface"
                            }`}
                            numberOfLines={1}
                          >
                            {region.name}
                          </Text>
                          <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {region.defaultCurrency.name} ({region.defaultCurrency.code} • {region.defaultCurrency.symbol})
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <View className="w-7 h-7 rounded-full bg-secondary items-center justify-center">
                          <MaterialIcons name="check" size={16} color="#003915" />
                        </View>
                      )}
                    </ScaleButton>
                  );
                })}

                {filteredRegions.length === 0 && (
                  <View className="py-10 items-center justify-center">
                    <MaterialIcons name="public-off" size={32} color="#8D909F" />
                    <Text className="text-xs text-on-surface-variant font-medium mt-2">
                      No matching countries found
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Currencies List */}
          {tab === "currency" && (
            <View className="flex-col gap-2.5">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">
                Select Currency ({filteredCurrencies.length})
              </Text>

              <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
                {filteredCurrencies.map((currency, index) => {
                  const isSelected = currentCurrency?.code === currency.code;
                  const isLast = index === filteredCurrencies.length - 1;

                  return (
                    <ScaleButton
                      key={currency.code}
                      activeScale={0.98}
                      onPress={() => handleSelectCurrency(currency)}
                      className={`flex-row items-center justify-between p-4 ${
                        !isLast ? "border-b border-outline-variant/20" : ""
                      } ${isSelected ? "bg-primary/10" : ""}`}
                    >
                      <View className="flex-row items-center gap-3.5 flex-1">
                        <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                          <Text className="text-sm font-extrabold text-primary">
                            {currency.symbol}
                          </Text>
                        </View>

                        <View className="flex-1">
                          <Text
                            className={`text-sm font-bold ${
                              isSelected ? "text-primary" : "text-on-surface"
                            }`}
                            numberOfLines={1}
                          >
                            {currency.code} — {currency.name}
                          </Text>
                          <Text className="text-xs text-on-surface-variant font-medium mt-0.5">
                            Symbol: {currency.symbol}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <View className="w-7 h-7 rounded-full bg-secondary items-center justify-center">
                          <MaterialIcons name="check" size={16} color="#003915" />
                        </View>
                      )}
                    </ScaleButton>
                  );
                })}

                {filteredCurrencies.length === 0 && (
                  <View className="py-10 items-center justify-center">
                    <MaterialIcons name="search-off" size={32} color="#8D909F" />
                    <Text className="text-xs text-on-surface-variant font-medium mt-2">
                      No matching currencies found
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
