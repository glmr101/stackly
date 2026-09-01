import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MAX_ACCOUNT_COUNT } from '@/constants';
import { images } from '@/constants/images';
import { Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CardLayoutRect } from '@/components/ui/Card3DViewerModal';
import {
  RealisticCardFace,
  REALISTIC_CARD_WIDTH,
  REALISTIC_CARD_HEIGHT,
} from '@/components/ui/RealisticCardFace';
import { findPhilippineBank } from '@/data/philippineBanks';
import { MaterialIconName, Account } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Adaptive dimensions: cards are closer with minimal/overlap spacing
export const CARD_WIDTH = REALISTIC_CARD_WIDTH;
export const CARD_HEIGHT = REALISTIC_CARD_HEIGHT;
export const CARD_SPACING = -8; // Tight gap with layered deck effect
export const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
export const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

export interface CardItem {
  id: string;
  bankName: string;
  institution?: string;
  accountName?: string;
  cardType?: 'visa' | 'mastercard' | 'amex' | 'generic';
  cardNetwork?: 'visa' | 'mastercard' | 'generic';
  cardCategory?: 'debit' | 'credit';
  accountType?: Account['type'] | string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  balance?: number;
  backgroundColor?: string;
  secondaryColor?: string;
  textColor?: string;
  icon?: MaterialIconName;
  bankCode?: string;
  isAddCard?: boolean;
}

export interface CenteredCardCarouselProps {
  cards?: CardItem[];
  currencySymbol?: string;
  showAddCard?: boolean;
  onAddCard?: () => void;
  onCardPress?: (card: CardItem, sourceLayout?: CardLayoutRect) => void;
  onCardChange?: (activeCard: CardItem, index: number) => void;
}

export type StackedCardCarouselProps = CenteredCardCarouselProps;

const DEFAULT_CARDS: CardItem[] = [
  {
    id: 'card-1',
    bankName: 'BPI Checking',
    institution: 'BPI',
    accountName: 'BPI Checking',
    cardType: 'mastercard',
    cardNetwork: 'mastercard',
    cardCategory: 'debit',
    accountType: 'bank',
    cardNumber: '•••• 8421',
    cardHolder: 'BPI',
    expiryDate: '08/28',
    balance: 14850.75,
    backgroundColor: '#B11116',
    secondaryColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#FFFFFF',
    icon: 'account-balance',
  },
  {
    id: 'card-2',
    bankName: 'Maya Savings',
    institution: 'Maya Bank',
    accountName: 'Maya Savings',
    cardType: 'visa',
    cardNetwork: 'visa',
    cardCategory: 'debit',
    accountType: 'digital bank',
    cardNumber: '•••• 3094',
    cardHolder: 'MAYA BANK',
    expiryDate: '11/29',
    balance: 5320.0,
    backgroundColor: '#00D664',
    secondaryColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#FFFFFF',
    icon: 'account-balance-wallet',
  },
  {
    id: 'card-3',
    bankName: 'MariBank Wallet',
    institution: 'MariBank',
    accountName: 'MariBank Wallet',
    cardType: 'mastercard',
    cardNetwork: 'mastercard',
    cardCategory: 'debit',
    accountType: 'digital bank',
    cardNumber: '•••• 9152',
    cardHolder: 'MARIBANK',
    expiryDate: '04/27',
    balance: 8940.2,
    backgroundColor: '#FF5722',
    secondaryColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#FFFFFF',
    icon: 'account-balance-wallet',
  },
];

const styles = StyleSheet.create({
  carouselRoot: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cardPressable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  addCardBody: {
    backgroundColor: '#161A25',
    borderWidth: 1.5,
    borderColor: 'rgba(178, 197, 255, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  addCardAmbientGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(178, 197, 255, 0.10)',
  },
  addCardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(178, 197, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(178, 197, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DFE2F1',
    letterSpacing: 0.2,
  },
  addCardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C3C6D6',
    marginTop: 2,
  },
  addCardButtonPill: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(178, 197, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(178, 197, 255, 0.25)',
  },
  addCardButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B2C5FF',
  },
  frostedBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 19, 29, 0.55)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  paginationTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B2C5FF',
  },
  paginationDotAdd: {
    backgroundColor: 'rgba(178, 197, 255, 0.6)',
  },
});

interface SingleCardProps {
  card: CardItem;
  cardIndex: number;
  scrollX: SharedValue<number>;
  currencySymbol: string;
  totalCards: number;
  onPress: (sourceLayout?: CardLayoutRect) => void;
}

function SingleCenteredCard({
  card,
  cardIndex,
  scrollX,
  currencySymbol,
  totalCards,
  onPress,
}: SingleCardProps) {
  const cardRef = useRef<View>(null);

  const handlePress = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.measureInWindow((pageX, pageY, width, height) => {
        if (pageX !== undefined && width > 0) {
          onPress({ pageX, pageY, width, height });
        } else {
          onPress();
        }
      });
    } else {
      onPress();
    }
  }, [onPress]);

  const cardCenter = cardIndex * SNAP_INTERVAL;
  const inputRange = [
    cardCenter - SNAP_INTERVAL,
    cardCenter,
    cardCenter + SNAP_INTERVAL,
  ];

  // 120fps hardware-accelerated animated style
  const animatedCardStyle = useAnimatedStyle(() => {
    if (totalCards <= 1) {
      return {
        transform: [{ scale: 1 }],
        opacity: 1,
        zIndex: 10,
      };
    }

    const dist = Math.abs(scrollX.value - cardCenter);
    // Skip work for offscreen cards
    if (dist > SNAP_INTERVAL * 2.5) {
      return {
        transform: [{ scale: 0.86 }],
        opacity: 0,
        zIndex: 1,
      };
    }

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.86, 1.0, 0.86],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.65, 1.0, 0.65],
      Extrapolation.CLAMP
    );

    const zIndex = Math.round(
      interpolate(
        scrollX.value,
        inputRange,
        [1, 10, 1],
        Extrapolation.CLAMP
      )
    );

    return {
      transform: [{ scale }],
      opacity,
      zIndex,
    };
  });

  // Frosted blur overlay animation
  const animatedBlurOverlayStyle = useAnimatedStyle(() => {
    if (totalCards <= 1) {
      return { opacity: 0 };
    }

    const dist = Math.abs(scrollX.value - cardCenter);
    if (dist > SNAP_INTERVAL * 2.5) {
      return { opacity: 1 };
    }

    const blurOpacity = interpolate(
      scrollX.value,
      inputRange,
      [1.0, 0.0, 1.0],
      Extrapolation.CLAMP
    );

    return {
      opacity: blurOpacity,
    };
  });

  // 1. Render Special "Add Card" Blank Card (Always Last)
  if (card.isAddCard) {
    // Determine if the max account limit has been reached (excluding this placeholder)
    const isLimitReached = totalCards - 1 >= MAX_ACCOUNT_COUNT;
    return (
      <Pressable
        onPress={() => onPress()}
        style={[
          styles.cardPressable,
          { marginRight: totalCards > 1 ? CARD_SPACING : 0 },
        ]}
      >
        <Animated.View
          style={[
            styles.cardBody,
            styles.addCardBody,
            animatedCardStyle,
          ]}
        >
          {/* Ambient Glow */}
          <View style={styles.addCardAmbientGlow} pointerEvents="none" />

          {/* Plus Icon Container or Lock */}
          <View
            style={[
              styles.addCardIconCircle,
              isLimitReached && {
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                borderColor: 'rgba(251, 191, 36, 0.4)',
              },
            ]}
          >
            {isLimitReached ? (
              <MaterialIcons name="lock" size={22} color="#FBBF24" />
            ) : (
              <MaterialIcons name="add" size={28} color="#B2C5FF" />
            )}
          </View>

          {/* Texts */}
          <View style={styles.addCardTextContainer}>
            <Text
              style={[
                styles.addCardTitle,
                isLimitReached && { color: '#FBBF24' },
              ]}
            >
              {isLimitReached
                ? 'Upgrade to Pro'
                : totalCards === 1
                ? 'Add Your First Card'
                : 'Add New Card'}
            </Text>
            <Text style={styles.addCardSubtitle}>
              {isLimitReached
                ? '3-card limit reached • Unlock unlimited'
                : 'Bank, E-Wallet, Cash, or Credit'}
            </Text>
          </View>

          {/* Action CTA Pill */}
          <View
            style={[
              styles.addCardButtonPill,
              isLimitReached && {
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                borderColor: 'rgba(251, 191, 36, 0.35)',
              },
            ]}
          >
            <Text
              style={[
                styles.addCardButtonText,
                isLimitReached && { color: '#FBBF24' },
              ]}
            >
              {isLimitReached ? '✨ View Pro Plans' : '+ Add Account'}
            </Text>
          </View>

          {/* Frosted Blur Overlay for Side state */}
          <Animated.View
            style={[styles.frostedBlurOverlay, animatedBlurOverlayStyle]}
            pointerEvents="none"
          />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      ref={cardRef}
      collapsable={false}
      onPress={handlePress}
      style={[
        styles.cardPressable,
        { marginRight: totalCards > 1 ? CARD_SPACING : 0 },
      ]}
    >
      <Animated.View
        style={[
          styles.cardBody,
          animatedCardStyle,
        ]}
      >
        <RealisticCardFace card={card} currencySymbol={currencySymbol}>
          {/* Side Card Frosted Depth-of-Field Blur Layer */}
          <Animated.View
            style={[styles.frostedBlurOverlay, animatedBlurOverlayStyle]}
            pointerEvents="none"
          />
        </RealisticCardFace>
      </Animated.View>
    </Pressable>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
  isAddCard?: boolean;
  onPress: () => void;
}

function PaginationDot({ index, scrollX, isAddCard, onPress }: PaginationDotProps) {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedDotStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      inputRange,
      [6, 22, 6],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
    };
  });

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View
        style={[
          styles.paginationDot,
          isAddCard ? styles.paginationDotAdd : null,
          animatedDotStyle,
        ]}
      />
    </Pressable>
  );
}

export function CenteredCardCarousel({
  cards = DEFAULT_CARDS,
  currencySymbol = '₱',
  showAddCard = true,
  onAddCard,
  onCardPress,
  onCardChange,
}: CenteredCardCarouselProps) {
  const router = useRouter();

  // Exact Sequence:
  // 1st card -> Center (initial index)
  // 2nd card -> Right of 1st card
  // 3rd card -> Left of 1st card
  // Add new card -> Always last
  const { arrangedCards, initialIndex } = useMemo(() => {
    const rawList = cards !== undefined ? cards.slice(0, 3) : DEFAULT_CARDS.slice(0, 3);
    const addCardItem: CardItem = {
      id: 'item-add-card-placeholder',
      bankName: 'Add Card',
      institution: 'Stackly',
      accountName: 'Add Card',
      balance: 0,
      backgroundColor: '#161A25',
      isAddCard: true,
    };

    if (rawList.length === 0) {
      return {
        arrangedCards: showAddCard ? [addCardItem] : [],
        initialIndex: 0,
      };
    }

    if (rawList.length === 1) {
      return {
        arrangedCards: showAddCard ? [rawList[0], addCardItem] : [rawList[0]],
        initialIndex: 0,
      };
    }

    if (rawList.length === 2) {
      // 1st card (center/start), 2nd card (right), Add Card (last)
      return {
        arrangedCards: showAddCard ? [rawList[0], rawList[1], addCardItem] : [rawList[0], rawList[1]],
        initialIndex: 0,
      };
    }

    // Exactly 3 cards:
    // Left (index 0): 3rd card
    // Center (index 1): 1st card
    // Right (index 2): 2nd card
    // Last (index 3): Add Card
    const card1 = rawList[0];
    const card2 = rawList[1];
    const card3 = rawList[2];

    const arranged = showAddCard
      ? [card3, card1, card2, addCardItem]
      : [card3, card1, card2];

    return {
      arrangedCards: arranged,
      initialIndex: 1, // Start on card1 (1st card - Center)
    };
  }, [cards, showAddCard]);

  const numCards = arrangedCards.length;
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(initialIndex * SNAP_INTERVAL);

  const isFocused = useIsFocused();
  const prevFocusedRef = useRef(isFocused);

  // Position at the 1st card (center) on mount or when navigating to dashboard
  useEffect(() => {
    const isReturningToDashboard = isFocused && !prevFocusedRef.current;
    prevFocusedRef.current = isFocused;

    if (isFocused) {
      const targetOffset = initialIndex * SNAP_INTERVAL;

      if (isReturningToDashboard) {
        // Smoothly glide from last card position back to main 1st card
        const timer = setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: targetOffset,
            animated: true,
          });
        }, 120);
        return () => clearTimeout(timer);
      } else {
        // Initial mount positioning
        scrollX.value = targetOffset;
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({
            x: targetOffset,
            animated: false,
          });
        });
      }
    }
  }, [isFocused, initialIndex, scrollX]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const scrollToIndex = useCallback((targetIndex: number, animated = true) => {
    scrollViewRef.current?.scrollTo({
      x: targetIndex * SNAP_INTERVAL,
      animated,
    });
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const activeIdx = Math.max(0, Math.min(Math.round(offsetX / SNAP_INTERVAL), numCards - 1));

      if (onCardChange && arrangedCards[activeIdx] && !arrangedCards[activeIdx].isAddCard) {
        onCardChange(arrangedCards[activeIdx], activeIdx);
      }
    },
    [arrangedCards, numCards, onCardChange]
  );

  const handleCardPress = useCallback(
    (card: CardItem, index: number, sourceLayout?: CardLayoutRect) => {
      const currentScroll = scrollX.value;
      const targetScroll = index * SNAP_INTERVAL;
      const isCentered = Math.abs(currentScroll - targetScroll) < SNAP_INTERVAL * 0.35;

      if (card.isAddCard) {
        const limitReached = (numCards - 1) >= MAX_ACCOUNT_COUNT;
        if (limitReached) {
          router.push('/subscription' as any);
          return;
        }
        if (onAddCard) {
          onAddCard();
        } else {
          router.push('/add-account' as any);
        }
        return;
      }

      if (!isCentered) {
        scrollToIndex(index, true);
      }
      if (onCardPress) {
        onCardPress(card, {
          pageX: (SCREEN_WIDTH - CARD_WIDTH) / 2,
          pageY: sourceLayout?.pageY ?? 260,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
      }
    },
    [onAddCard, onCardPress, router, scrollToIndex, scrollX]
  );

  return (
    <View style={styles.carouselRoot}>
      {/* Horizontal Carousel */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        contentOffset={{ x: initialIndex * SNAP_INTERVAL, y: 0 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: SIDE_INSET },
        ]}
      >
        {arrangedCards.map((card, index) => (
          <SingleCenteredCard
            key={`${card.id}-${index}`}
            card={card}
            cardIndex={index}
            scrollX={scrollX}
            currencySymbol={currencySymbol}
            totalCards={numCards}
            onPress={(sourceLayout) => handleCardPress(card, index, sourceLayout)}
          />
        ))}
      </Animated.ScrollView>

      {/* Dynamic Centered Pagination Indicator */}
      {numCards > 1 && (
        <View style={styles.paginationTrack}>
          {arrangedCards.map((card, index) => (
            <PaginationDot
              key={`dot-${card.id}-${index}`}
              index={index}
              scrollX={scrollX}
              isAddCard={card.isAddCard}
              onPress={() => scrollToIndex(index, true)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Alias for backwards compatibility
export const StackedCardCarousel = CenteredCardCarousel;

export default CenteredCardCarousel;
