import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { MaterialIconName, Account } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 360);
const CARD_HEIGHT = 190;
const STACK_OFFSET_Y = 12;
const SCALE_DIFF = 0.035;

export interface CardItem {
  id: string;
  bankName: string;
  institution?: string;
  accountName?: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'generic';
  cardNetwork?: 'visa' | 'mastercard' | 'generic';
  cardCategory?: 'debit' | 'credit';
  accountType?: Account['type'] | string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  balance: number;
  backgroundColor: string;
  secondaryColor?: string;
  textColor?: string;
  icon?: MaterialIconName;
  bankCode?: string;
}

export interface StackedCardCarouselProps {
  cards?: CardItem[];
  currencySymbol?: string;
  onCardPress?: (card: CardItem) => void;
  onCardChange?: (activeCard: CardItem, index: number) => void;
}

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

const FLIP_DURATION = 800;
const FLIP_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

interface SingleStackedCardProps {
  card: CardItem;
  index: number;
  totalCards: number;
  activeIndex: number;
  flippingCardIndex: SharedValue<number>;
  flipProgress: SharedValue<number>;
  isAnimating: SharedValue<boolean>;
  currencySymbol: string;
  onFlipNext: () => void;
  onSelectCard: (index: number) => void;
  onPressCard?: (card: CardItem) => void;
}

function SingleStackedCard({
  card,
  index,
  totalCards,
  activeIndex,
  flippingCardIndex,
  flipProgress,
  isAnimating,
  currencySymbol,
  onFlipNext,
  onSelectCard,
  onPressCard,
}: SingleStackedCardProps) {
  const relPosition = (index - activeIndex + totalCards) % totalCards;
  const isFront = relPosition === 0;

  const animatedStyle = useAnimatedStyle(() => {
    if (totalCards <= 1) {
      return {
        transform: [{ perspective: 1200 }, { translateY: 0 }, { scale: 1 }],
        opacity: 1,
        zIndex: 10,
      };
    }

    // Check if this specific card is currently executing the flip animation
    const isThisCardFlipping = flippingCardIndex.value === index;

    if (isThisCardFlipping) {
      const progress = flipProgress.value;

      // Physical card arc: lifts up, passes over the stack, lands at the back
      const translateY = interpolate(
        progress,
        [0, 0.4, 1],
        [0, -200, STACK_OFFSET_Y * (totalCards - 1)],
        Extrapolation.CLAMP
      );

      const scale = interpolate(
        progress,
        [0, 0.4, 1],
        [1, 1.05, 1 - SCALE_DIFF * (totalCards - 1)],
        Extrapolation.CLAMP
      );

      const zIndex = progress < 0.5 ? 50 : 0;

      return {
        transform: [
          { perspective: 1200 },
          { translateY },
          { scale },
        ],
        opacity: 1,
        zIndex,
      };
    }

    // Default stacked positions (relPosition: 0=front, 1=middle, 2=back, 3=bottom)
    const baseTranslateY = relPosition * STACK_OFFSET_Y;
    const baseScale = 1 - relPosition * SCALE_DIFF;
    const zIndex = 40 - relPosition * 10;

    return {
      transform: [
        { perspective: 1200 },
        { translateY: withSpring(baseTranslateY, SPRING_CONFIG) },
        { scale: withSpring(baseScale, SPRING_CONFIG) },
      ],
      opacity: 1,
      zIndex,
    };
  });

  const startFlipAnimation = () => {
    'worklet';
    if (isAnimating.value) return;
    isAnimating.value = true;
    flippingCardIndex.value = index;
    flipProgress.value = 0;
    flipProgress.value = withTiming(
      1,
      {
        duration: FLIP_DURATION,
        easing: FLIP_EASING,
      },
      (finished) => {
        if (finished) {
          runOnJS(onFlipNext)();
        }
      }
    );
  };

  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    if (isAnimating.value) return;
    if (isFront) {
      if (onPressCard) {
        runOnJS(onPressCard)(card);
      } else {
        startFlipAnimation();
      }
    } else {
      runOnJS(onSelectCard)(index);
    }
  });

  const isCard =
    card.accountType !== 'cash' &&
    card.accountType !== 'investment' &&
    (card.cardType !== 'generic' || !!card.cardNetwork);
  const isMastercard =
    card.cardNetwork === 'mastercard' || card.cardType === 'mastercard';
  const categoryLabel =
    card.cardCategory || (card.accountType === 'credit card' ? 'credit' : isCard ? 'debit' : '');
  const institutionName =
    card.institution || card.bankName || 'BANK';
  const accountLabel =
    card.accountName || card.bankName || 'Account';
  const typeLabel =
    card.accountType || (card.cardCategory === 'credit' ? 'credit card' : 'bank');

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor: card.backgroundColor || '#161B26',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          },
          animatedStyle,
        ]}
      >
        {/* Subtle Decorative Ambient Glow */}
        <View style={styles.decorativeOrb} pointerEvents="none" />

        {/* Card Header (Same as preview) */}
        <View style={styles.cardHeader}>
          <View style={styles.bankInfoRow}>
            <View style={styles.bankIconContainer}>
              <MaterialIcons
                name={(card.icon as any) || 'account-balance'}
                size={18}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.institutionText} numberOfLines={1}>
              {institutionName.toUpperCase()}
            </Text>
          </View>

          {/* Card Network Brand Badge or Account Type Badge */}
          <View style={styles.cardNetworkBadge}>
            {isCard && (card.cardNetwork || card.cardType !== 'generic') ? (
              <>
                {isMastercard ? (
                  <View style={styles.mastercardCircles}>
                    <View style={styles.mastercardRed} />
                    <View style={styles.mastercardYellow} />
                  </View>
                ) : (
                  <Text style={styles.visaBrandText}>VISA</Text>
                )}
                {categoryLabel ? (
                  <Text style={styles.cardCategoryText}>
                    {categoryLabel.toUpperCase()}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.cardCategoryText}>
                {(card.accountType || 'ACCOUNT').toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {/* Card Middle: Balance (Same as preview) */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          <AnimatedCounter
            value={card.balance}
            prefix={currencySymbol}
            decimals={2}
            className="text-2xl font-black text-white tracking-tight mt-0.5"
          />
        </View>

        {/* Card Footer: Account Name & Type (Same as preview) */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>ACCOUNT NAME</Text>
            <Text style={styles.footerValue} numberOfLines={1}>
              {accountLabel}
            </Text>
          </View>

          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>TYPE</Text>
            <Text style={styles.footerTypeValue}>
              {typeLabel.toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function StackedCardCarousel({
  cards = DEFAULT_CARDS,
  currencySymbol = '₱',
  onCardPress,
  onCardChange,
}: StackedCardCarouselProps) {
  const displayCards = (cards || DEFAULT_CARDS).slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);

  const flippingCardIndex = useSharedValue(-1);
  const flipProgress = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const handleFlipNext = () => {
    if (displayCards.length <= 1) return;
    const nextIndex = (activeIndex + 1) % displayCards.length;
    setActiveIndex(nextIndex);
    if (onCardChange && displayCards[nextIndex]) {
      onCardChange(displayCards[nextIndex], nextIndex);
    }
    requestAnimationFrame(() => {
      flippingCardIndex.value = -1;
      flipProgress.value = 0;
      isAnimating.value = false;
    });
  };

  const handleSelectCard = (targetIndex: number) => {
    if (targetIndex === activeIndex || isAnimating.value) return;
    isAnimating.value = true;
    flippingCardIndex.value = activeIndex;
    flipProgress.value = 0;
    flipProgress.value = withTiming(
      1,
      {
        duration: FLIP_DURATION,
        easing: FLIP_EASING,
      },
      (finished) => {
        if (finished) {
          runOnJS(handleFlipNext)();
        }
      }
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Cards Stack Container */}
      <View style={styles.stackContainer}>
        {displayCards.map((card, index) => (
          <SingleStackedCard
            key={card.id}
            card={card}
            index={index}
            totalCards={displayCards.length}
            activeIndex={activeIndex}
            flippingCardIndex={flippingCardIndex}
            flipProgress={flipProgress}
            isAnimating={isAnimating}
            currencySymbol={currencySymbol}
            onFlipNext={handleFlipNext}
            onSelectCard={handleSelectCard}
            onPressCard={onCardPress}
          />
        ))}
      </View>

      {/* Interactive Controls & Centered Pagination Dots */}
      <View style={styles.controlsRow}>
        <View style={styles.paginationRow}>
          {displayCards.map((card, index) => {
            const isSelected = activeIndex === index;
            return (
              <View
                key={`dot-${card.id}`}
                style={[
                  styles.paginationDot,
                  isSelected
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  stackContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + STACK_OFFSET_Y * 2 + 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  decorativeOrb: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  bankIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  institutionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  cardNetworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  mastercardCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -2,
  },
  mastercardRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EB001B',
    marginRight: -6,
  },
  mastercardYellow: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F79E1B',
  },
  visaBrandText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B2C5FF',
    letterSpacing: 1,
  },
  cardCategoryText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.90)',
    textTransform: 'uppercase',
  },
  balanceSection: {
    marginVertical: 4,
    zIndex: 2,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.70)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  footerLeft: {
    flex: 1,
    marginRight: 8,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.60)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footerTypeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.90)',
    textTransform: 'uppercase',
  },
  controlsRow: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
  },
  paginationDotActive: {
    width: 22,
    backgroundColor: '#B2C5FF',
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
});

export default StackedCardCarousel;
