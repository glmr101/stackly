import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PHILIPPINE_BANKS, POPULAR_PHILIPPINE_BANKS, PhilippineBank } from '@/data/philippineBanks';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface BankPickerModalProps {
  visible: boolean;
  selectedBankId?: string;
  onSelectBank: (bank: PhilippineBank) => void;
  onClose: () => void;
}

export function BankPickerModal({
  visible,
  selectedBankId,
  onSelectBank,
  onClose,
}: BankPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { label: 'All Banks', value: 'all' },
    { label: 'Popular', value: 'popular' },
    { label: 'Universal', value: 'Universal / Commercial' },
    { label: 'Digital', value: 'Digital Bank' },
    { label: 'E-Wallet', value: 'E-Wallet' },
  ];

  const filteredBanks = useMemo(() => {
    let list = PHILIPPINE_BANKS;

    if (activeCategory === 'popular') {
      list = POPULAR_PHILIPPINE_BANKS;
    } else if (activeCategory !== 'all') {
      list = PHILIPPINE_BANKS.filter((b) => b.category === activeCategory);
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (bank) =>
        bank.name.toLowerCase().includes(q) ||
        bank.shortName.toLowerCase().includes(q) ||
        bank.code.toLowerCase().includes(q) ||
        bank.category.toLowerCase().includes(q)
    );
  }, [searchQuery, activeCategory]);

  const handlePick = (bank: PhilippineBank) => {
    onSelectBank(bank);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="85%">
      <View className="flex-1">

            {/* Modal Header */}
            <View className="px-5 pb-3 pt-1 flex-row items-center justify-between border-b border-outline-variant/20">
              <View>
                <Text className="text-lg font-extrabold text-on-surface tracking-tight">
                  Select Philippine Bank
                </Text>
                <Text className="text-xs text-on-surface-variant font-medium">
                  Choose your financial institution or e-wallet
                </Text>
              </View>

              <ScaleButton
                activeScale={0.88}
                className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
                onPress={onClose}
              >
                <MaterialIcons name="close" size={20} color="#DFE2F1" />
              </ScaleButton>
            </View>

            {/* Search Input Bar */}
            <View className="px-5 pt-3 pb-2">
              <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
                <MaterialIcons name="search" size={20} color="#8D909F" />
                <TextInput
                  className="flex-1 text-on-surface text-sm p-3 h-12"
                  placeholder="Search BDO, BPI, Maya, MariBank, etc."
                  placeholderTextColor="#8D909F"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <ScaleButton
                    activeScale={0.88}
                    onPress={() => setSearchQuery('')}
                    className="w-7 h-7 rounded-full bg-surface-container-highest items-center justify-center"
                  >
                    <MaterialIcons name="close" size={14} color="#C3C6D6" />
                  </ScaleButton>
                )}
              </View>
            </View>

            {/* Category Filter Chips */}
            <View className="px-5 py-2">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat.value;
                  return (
                    <ScaleButton
                      key={cat.value}
                      activeScale={0.92}
                      onPress={() => setActiveCategory(cat.value)}
                      className={`px-3.5 py-1.5 rounded-full border ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </ScaleButton>
                  );
                })}
              </ScrollView>
            </View>

            {/* Bank List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 6 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm">
                {filteredBanks.map((bank, index) => {
                  const isSelected = selectedBankId === bank.id;
                  const isLast = index === filteredBanks.length - 1;

                  return (
                    <ScaleButton
                      key={bank.id}
                      activeScale={0.98}
                      onPress={() => handlePick(bank)}
                      className={`flex-row items-center justify-between p-3.5 ${
                        !isLast ? 'border-b border-outline-variant/20' : ''
                      } ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                        {/* Bank Avatar Badge */}
                        <View
                          className="w-11 h-11 rounded-2xl items-center justify-center shadow-sm"
                          style={{ backgroundColor: `${bank.color}25`, borderWidth: 1, borderColor: `${bank.color}50` }}
                        >
                          <Text
                            className="text-xs font-extrabold"
                            style={{ color: bank.color }}
                          >
                            {bank.code.slice(0, 4)}
                          </Text>
                        </View>

                        {/* Bank Details */}
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text
                              className={`text-sm font-bold ${
                                isSelected ? 'text-primary' : 'text-on-surface'
                              }`}
                              numberOfLines={1}
                            >
                              {bank.shortName}
                            </Text>
                            {bank.popular && (
                              <View className="bg-primary/20 px-1.5 py-0.5 rounded">
                                <Text className="text-[9px] font-bold text-primary uppercase">
                                  Popular
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            className="text-xs text-on-surface-variant font-medium mt-0.5"
                            numberOfLines={1}
                          >
                            {bank.name}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <View className="w-6 h-6 rounded-full bg-secondary items-center justify-center">
                          <MaterialIcons name="check" size={15} color="#003915" />
                        </View>
                      )}
                    </ScaleButton>
                  );
                })}

                {filteredBanks.length === 0 && (
                  <View className="py-12 items-center justify-center px-4">
                    <MaterialIcons name="search-off" size={36} color="#8D909F" />
                    <Text className="text-sm font-bold text-on-surface mt-2">
                      No matching banks found
                    </Text>
                    <Text className="text-xs text-on-surface-variant text-center mt-1">
                      Try another search term or select &quot;Other / Custom Bank&quot;
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({});

export default BankPickerModal;
