import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { ScaleButton } from '@/components/ui/ScaleButton';
import { GrabHandle } from '@/components/ui/GrabHandle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/data/categoryOptions';
import type { Category, MaterialIconName } from '@/types';

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (category: Category) => void;
  /** Lock the type toggle to a specific value */
  defaultType?: 'income' | 'expense';
}

export function CreateCategoryModal({
  visible,
  onClose,
  onCreated,
  defaultType,
}: CreateCategoryModalProps) {
  const addCategory = useAppStore((state) => state.addCategory);

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(defaultType || 'expense');
  const [selectedIcon, setSelectedIcon] = useState<MaterialIconName>('label');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (visible) {
      setType(defaultType || 'expense');
      setName('');
      setSelectedIcon('label');
      setSelectedColor(CATEGORY_COLORS[0]);
    }
  }, [visible, defaultType]);

  const resetForm = () => {
    setName('');
    setType(defaultType || 'expense');
    setSelectedIcon('label');
    setSelectedColor(CATEGORY_COLORS[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || !selectedIcon || !selectedColor) return;

    const newCat: Omit<Category, 'id'> = {
      name: trimmed,
      type,
      icon: selectedIcon,
      color: selectedColor,
    };

    addCategory(newCat);

    // Retrieve the newly created category from store
    const allCats = useAppStore.getState().categories;
    const created = allCats[allCats.length - 1];
    if (created && onCreated) {
      onCreated(created);
    }

    resetForm();
    onClose();
  };

  const canSave = name.trim().length > 0;

  const typeOptions = [
    { value: 'expense' as const, label: 'Expense' },
    { value: 'income' as const, label: 'Income' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop pressable */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
          style={styles.keyboardContainer}
        >
          {/* Sheet Card */}
          <View style={styles.sheetContainer} className="bg-surface border-t border-outline-variant/30">
            <GrabHandle />

            {/* Header */}
            <View className="px-5 pb-3 pt-1 flex-row items-center justify-between border-b border-outline-variant/20">
              <View>
                <Text className="text-lg font-extrabold text-on-surface tracking-tight">
                  New Category
                </Text>
                <Text className="text-xs text-on-surface-variant font-medium">
                  Create a custom category
                </Text>
              </View>

              <ScaleButton
                activeScale={0.88}
                className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 items-center justify-center shadow-sm"
                onPress={handleClose}
              >
                <MaterialIcons name="close" size={20} color="#DFE2F1" />
              </ScaleButton>
            </View>

            <ScrollView
              style={styles.flex1}
              contentContainerStyle={{ paddingBottom: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Live Preview */}
              <View className="mx-5 mt-4 mb-4 p-4 rounded-[22px] bg-surface-container-low border border-outline-variant/20 items-center">
                <Text className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2.5">
                  Preview
                </Text>
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${selectedColor}25` }}
                  >
                    <MaterialIcons
                      name={selectedIcon as any}
                      size={24}
                      color={selectedColor}
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-on-surface">
                      {name.trim() || 'Category Name'}
                    </Text>
                    <Text className="text-xs text-on-surface-variant font-medium capitalize">
                      {type} Category
                    </Text>
                  </View>
                </View>
              </View>

              {/* Type Toggle */}
              {!defaultType && (
                <View className="px-5 mb-5">
                  <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5">
                    Type
                  </Text>
                  <SegmentedControl<'income' | 'expense'>
                    options={typeOptions}
                    selectedValue={type}
                    onChange={setType}
                    activePillColor={type === 'income' ? '#4DE082' : '#FFB4AB'}
                    activeTextColor={type === 'income' ? '#003919' : '#690005'}
                  />
                </View>
              )}

              {/* Category Name Input */}
              <View className="px-5 mb-5">
                <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2.5">
                  Name
                </Text>
                <View className="bg-surface-container rounded-2xl px-4 py-1 flex-row items-center gap-3 border border-outline-variant/30">
                  <MaterialIcons name="edit" size={18} color="#8D909F" />
                  <TextInput
                    className="flex-1 text-on-surface text-sm p-3 h-12"
                    placeholder="e.g. Groceries, Gym, Salary..."
                    placeholderTextColor="#8D909F"
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Color Picker */}
              <View className="px-5 mb-5">
                <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Color Accent
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {CATEGORY_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <ScaleButton
                        key={color}
                        activeScale={0.85}
                        onPress={() => setSelectedColor(color)}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: color,
                          borderWidth: isSelected ? 2.5 : 0,
                          borderColor: isSelected ? '#FFFFFF' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <MaterialIcons name="check" size={18} color="#000000" />
                        )}
                      </ScaleButton>
                    );
                  })}
                </View>
              </View>

              {/* Icon Picker */}
              <View className="px-5 mb-6">
                <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Icon
                </Text>

                <View className="flex-row flex-wrap gap-2.5">
                  {CATEGORY_ICONS.map((iconName) => {
                    const isSelected = selectedIcon === iconName;
                    return (
                      <ScaleButton
                        key={iconName}
                        activeScale={0.88}
                        onPress={() => setSelectedIcon(iconName)}
                        className="w-12 h-12 rounded-2xl items-center justify-center border"
                        style={{
                          backgroundColor: isSelected
                            ? `${selectedColor}30`
                            : '#1C1F2A',
                          borderColor: isSelected
                            ? selectedColor
                            : 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <MaterialIcons
                          name={iconName as any}
                          size={22}
                          color={isSelected ? selectedColor : '#8D909F'}
                        />
                      </ScaleButton>
                    );
                  })}
                </View>
              </View>

              {/* Save Button */}
              <View className="px-5 mb-8">
                <ScaleButton
                  activeScale={0.95}
                  className="w-full py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
                  style={{
                    backgroundColor: canSave ? '#B2C5FF' : '#262A35',
                    opacity: canSave ? 1 : 0.5,
                  }}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  <MaterialIcons
                    name="add-circle"
                    size={22}
                    color={canSave ? '#002C72' : '#8D909F'}
                  />
                  <Text
                    className="text-base font-extrabold"
                    style={{ color: canSave ? '#002C72' : '#8D909F' }}
                  >
                    Create Category
                  </Text>
                </ScaleButton>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: '86%',
    maxHeight: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  flex1: {
    flex: 1,
  },
});

export default CreateCategoryModal;
