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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 360);
const CARD_HEIGHT = 190;
const STACK_OFFSET_Y = 12;
const SCALE_DIFF = 0.035;

export interface CardItem {
  id: string;
  bankName: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'generic';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  balance: number;
  backgroundColor: string;
  secondaryColor?: string;
  textColor?: string;
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
    bankName: 'Chase Sapphire Reserve',
    cardType: 'visa',
    cardNumber: '•••• 8421',
    cardHolder: 'ALEX RIVERA',
    expiryDate: '08/28',
    balance: 14850.75,
    backgroundColor: '#161B26',
    secondaryColor: '#252F48',
    textColor: '#FFFFFF',
  },
  {
    id: 'card-2',
    bankName: 'Apple Card Goldman',
    cardType: 'mastercard',
    cardNumber: '•••• 3094',
    cardHolder: 'ALEX RIVERA',
    expiryDate: '11/29',
    balance: 5320.0,
    backgroundColor: '#1E293B',
    secondaryColor: '#334155',
    textColor: '#FFFFFF',
  },
  {
    id: 'card-3',
    bankName: 'Amex Platinum',
    cardType: 'amex',
    cardNumber: '•••• 9152',
    cardHolder: 'ALEX RIVERA',
    expiryDate: '04/27',
    balance: 8940.2,
    backgroundColor: '#0F172A',
    secondaryColor: '#1E293B',
    textColor: '#FFFFFF',
  },
];

const SPRING_CONFIG = {
  damping: 16,
  stiffness: 130,
  mass: 0.7,
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
      // Exit animation: card lifts up and fades out.
      // State update happens AFTER this completes — no overlapping animations.
      const progress = flipProgress.value;

      // Physical card arc: lifts up, passes over the stack, lands at the back
      const translateY = interpolate(
        progress,
        [0, 0.4, 1],
        [0, -160, STACK_OFFSET_Y * (totalCards - 1)],
        Extrapolation.CLAMP
      );

      const scale = interpolate(
        progress,
        [0, 0.4, 1],
        [1, 1.05, 1 - SCALE_DIFF * (totalCards - 1)],
        Extrapolation.CLAMP
      );

      // Card goes behind the stack once it passes the peak
      const zIndex = progress < 0.5 ? 40 : 1;

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

    // Default stacked positions (relPosition: 0=front, 1=middle, 2=back)
    const baseTranslateY = relPosition * STACK_OFFSET_Y;
    const baseScale = 1 - relPosition * SCALE_DIFF;
    const zIndex = 30 - relPosition * 10;

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

  const animatedDepthOverlayStyle = useAnimatedStyle(() => {
    if (totalCards <= 1) return { opacity: 0 };
    const isThisCardFlipping = flippingCardIndex.value === index;
    if (isThisCardFlipping) {
      const overlayOpacity = interpolate(
        flipProgress.value,
        [0, 0.4, 1],
        [0, 0.05, 0.26],
        Extrapolation.CLAMP
      );
      return { opacity: overlayOpacity };
    }
    const overlayOpacity = Math.min(relPosition * 0.14, 0.28);
    return { opacity: withSpring(overlayOpacity, SPRING_CONFIG) };
  });

  // Start the exit animation on the UI thread, then trigger state update on completion.
  const startFlipAnimation = () => {
    'worklet';
    if (isAnimating.value) return;
    isAnimating.value = true;
    flippingCardIndex.value = index;
    flipProgress.value = 0;
    flipProgress.value = withTiming(
      1,
      {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
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

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor: card.backgroundColor,
            borderColor: 'rgba(255, 255, 255, 0.14)',
          },
          animatedStyle,
        ]}
      >
        {/* Subtle Decorative Ambient Glow */}
        <View
          style={[
            styles.decorativeOrb,
            { backgroundColor: card.secondaryColor || '#252F48' },
          ]}
        />

        {/* Dynamic Dark Depth Overlay for stacked hierarchy */}
        <Animated.View
          style={[styles.depthOverlay, animatedDepthOverlayStyle]}
          pointerEvents="none"
        />

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bankInfoRow}>
            <View style={styles.chipIconContainer}>
              <MaterialIcons name="credit-card" size={16} color="#B2C5FF" />
            </View>
            <Text style={styles.bankNameText} numberOfLines={1}>
              {card.bankName}
            </Text>
          </View>

          {/* Card Brand Badge */}
          <View style={styles.cardBrandBadge}>
            <Text style={styles.cardBrandText}>
              {card.cardType.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* EMV Chip & Contactless Icons */}
        <View style={styles.emvChipContainer}>
          <View style={styles.emvChip}>
            <View style={styles.emvChipLine1} />
            <View style={styles.emvChipLine2} />
          </View>
          <MaterialIcons
            name="contactless"
            size={22}
            color="rgba(255, 255, 255, 0.65)"
            style={styles.contactlessIcon}
          />
        </View>

        {/* Card Number & Balance */}
        <View style={styles.cardMiddle}>
          <Text style={styles.cardNumberText}>{card.cardNumber}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <AnimatedCounter
              value={card.balance}
              prefix={currencySymbol}
              decimals={2}
              style={styles.balanceValue}
            />
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>CARD HOLDER</Text>
            <Text style={styles.footerValue}>{card.cardHolder}</Text>
          </View>

          <View style={styles.expiryContainer}>
            <Text style={styles.footerLabel}>EXPIRES</Text>
            <Text style={styles.footerValue}>{card.expiryDate}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function StackedCardCarousel({
  cards = DEFAULT_CARDS,
  currencySymbol = '$',
  onCardPress,
  onCardChange,
}: StackedCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const flippingCardIndex = useSharedValue(-1);
  const flipProgress = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const handleFlipNext = () => {
    if (cards.length <= 1) return;
    const nextIndex = (activeIndex + 1) % cards.length;
    setActiveIndex(nextIndex);
    if (onCardChange && cards[nextIndex]) {
      onCardChange(cards[nextIndex], nextIndex);
    }
    // Wait for React to re-render with the new positions,
    // then release the card from the flip branch.
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
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
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
        {cards.map((card, index) => (
          <SingleStackedCard
            key={card.id}
            card={card}
            index={index}
            totalCards={cards.length}
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

      {/* Interactive Controls & Flip Next Button */}
      <View style={styles.controlsRow}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {cards.map((card, index) => {
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

        {/* Quick Flip Button */}
        {cards.length > 1 && (
          <View style={styles.flipActionRow}>
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  stackContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + STACK_OFFSET_Y * 2 + 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
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
  depthOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    borderRadius: 24,
    zIndex: 1,
  },
  decorativeOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  chipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(178, 197, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bankNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardBrandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  cardBrandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B2C5FF',
    letterSpacing: 1,
  },
  emvChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  emvChip: {
    width: 34,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#D1A350',
    borderWidth: 1,
    borderColor: '#9E7428',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  emvChipLine1: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginVertical: 3,
  },
  emvChipLine2: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginVertical: 2,
  },
  contactlessIcon: {
    marginLeft: 10,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.55)',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  controlsRow: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
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
  flipActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(178, 197, 255, 0.8)',
  },
});

export default StackedCardCarousel;
