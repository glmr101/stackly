import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Platform,
  Clipboard,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { CardItem } from '@/components/ui/StackedCardCarousel';
import { findPhilippineBank } from '@/data/philippineBanks';
import { ScaleButton } from '@/components/ui/ScaleButton';
import {
  RealisticCardFace,
  REALISTIC_CARD_WIDTH,
  REALISTIC_CARD_HEIGHT,
} from '@/components/ui/RealisticCardFace';
import type { Transaction, Category } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard 3D Card Dimensions (ISO/IEC 7810 ID-1 standard ratio ~1.58)
const VIEWER_CARD_WIDTH = REALISTIC_CARD_WIDTH;
const VIEWER_CARD_HEIGHT = REALISTIC_CARD_HEIGHT;

// How far the card lifts when expanded
const CARD_LIFT_Y = -200;

export interface CardLayoutRect {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

interface Card3DViewerModalProps {
  visible: boolean;
  card: CardItem | null;
  sourceLayout?: CardLayoutRect | null;
  currencySymbol?: string;
  transactions?: Transaction[];
  categories?: Category[];
  onClose: () => void;
}

export function Card3DViewerModal({
  visible,
  card,
  sourceLayout,
  currencySymbol = '₱',
  transactions = [],
  categories = [],
  onClose,
}: Card3DViewerModalProps) {
  // Modal animation and buffer states (buffer prevents unmount flash before reverse animation finishes)
  const [modalRendered, setModalRendered] = useState(visible);
  const [cachedCard, setCachedCard] = useState<CardItem | null>(card);
  const [cachedLayout, setCachedLayout] = useState<CardLayoutRect | null>(sourceLayout || null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [, setIsExpanded] = useState(false);
  const [showTxList, setShowTxList] = useState(false);

  const isExpandedRef = useRef(false);
  const isDismissingRef = useRef(false);
  const txTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync buffer whenever active card or layout is provided
  useEffect(() => {
    if (card) {
      setCachedCard(card);
    }
  }, [card]);

  useEffect(() => {
    if (sourceLayout) {
      setCachedLayout(sourceLayout);
    }
  }, [sourceLayout]);

  const activeCard = card || cachedCard;
  const activeLayout = sourceLayout || cachedLayout;

  // 3D Tilt & Zoom Animated Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const zoomScale = useSharedValue(0.6);
  const backdropOpacity = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const flipRotation = useSharedValue(0);
  const startRotateX = useSharedValue(0);
  const startRotateY = useSharedValue(0);

  // Expanded state animated values
  const cardLiftY = useSharedValue(0);
  const txListOpacity = useSharedValue(0);
  const txListTranslateY = useSharedValue(30);

  // Compute exact screen-coordinate offsets
  // Card is absolutely centered at screen center via styles
  const screenCenterX = SCREEN_WIDTH / 2;
  const screenCenterY = SCREEN_HEIGHT / 2;

  const sourceCenterX = activeLayout
    ? activeLayout.pageX + activeLayout.width / 2
    : screenCenterX;
  const sourceCenterY = activeLayout
    ? activeLayout.pageY + activeLayout.height / 2
    : screenCenterY;
  const sourceScale = activeLayout && activeLayout.width > 0
    ? activeLayout.width / VIEWER_CARD_WIDTH
    : 1.0;

  const originTranslateX = sourceCenterX - screenCenterX;
  const originTranslateY = sourceCenterY - screenCenterY;
  const originScale = Math.min(Math.max(sourceScale, 0.7), 1.0);

  // Filter transactions for the active card's account
  const accountTransactions = useMemo(() => {
    if (!activeCard) return [];
    return transactions
      .filter((tx) => tx.accountId === activeCard.id || tx.destinationAccountId === activeCard.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [activeCard, transactions]);

  // Category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (txTimerRef.current) clearTimeout(txTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const finishClose = useCallback(() => {
    if (txTimerRef.current) clearTimeout(txTimerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    isDismissingRef.current = false;
    isExpandedRef.current = false;
    setModalRendered(false);
    setIsExpanded(false);
    setShowTxList(false);
    onClose();
  }, [onClose]);

  // Collapse card back to center (used before dismiss)
  const collapseCard = useCallback(() => {
    isExpandedRef.current = false;
    setIsExpanded(false);
    setShowTxList(false);
    if (txTimerRef.current) clearTimeout(txTimerRef.current);

    const springConfig = { damping: 16, stiffness: 120, mass: 0.8 };
    // Fade out transaction list immediately
    txListOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
    txListTranslateY.value = withTiming(30, { duration: 200, easing: Easing.out(Easing.cubic) });
    // Add 1 second delay before the 3D card goes back to center
    cardLiftY.value = withDelay(200, withSpring(0, springConfig));
  }, [cardLiftY, txListOpacity, txListTranslateY]);

  // Dismiss — collapse first if expanded, then animate card back to dashboard
  const handleDismiss = useCallback(() => {
    if (isDismissingRef.current) return;

    const animateDismiss = () => {
      isDismissingRef.current = true;
      const dur = 260;
      const easeOut = Easing.out(Easing.cubic);

      // Flatten 3D tilt & flip
      rotateX.value = withTiming(0, { duration: dur, easing: easeOut });
      rotateY.value = withTiming(0, { duration: dur, easing: easeOut });
      flipRotation.value = withTiming(0, { duration: dur, easing: easeOut });

      // Fade out backdrop
      backdropOpacity.value = withTiming(0, { duration: dur, easing: easeOut });

      // Reset lift
      cardLiftY.value = withTiming(0, { duration: dur, easing: easeOut });

      // Fly card back to exact source position & scale
      translateX.value = withTiming(originTranslateX, { duration: dur, easing: easeOut });
      translateY.value = withTiming(originTranslateY, { duration: dur, easing: easeOut });
      zoomScale.value = withTiming(
        originScale,
        { duration: dur, easing: easeOut },
        (finished) => {
          if (finished) {
            runOnJS(finishClose)();
          }
        }
      );

      // Safety fallback
      setTimeout(() => {
        finishClose();
      }, dur + 20);
    };

    if (isExpandedRef.current) {
      // Collapse first: tx list fades out immediately, wait 1s, card returns to center, then animate to dashboard
      collapseCard();
      // 1000ms delay + ~400ms spring return to center
      dismissTimerRef.current = setTimeout(animateDismiss, 450);
    } else {
      animateDismiss();
    }
  }, [
    collapseCard,
    originTranslateX,
    originTranslateY,
    originScale,
    rotateX,
    rotateY,
    flipRotation,
    backdropOpacity,
    cardLiftY,
    translateX,
    translateY,
    zoomScale,
    finishClose,
  ]);

  // When visible becomes true, zoom in from dashboard card's exact position
  useEffect(() => {
    if (visible) {
      if (txTimerRef.current) clearTimeout(txTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      isDismissingRef.current = false;
      isExpandedRef.current = false;
      setModalRendered(true);
      setIsFlipped(false);
      setShowCvv(false);
      setIsExpanded(false);
      setShowTxList(false);
      rotateX.value = 0;
      rotateY.value = 0;
      flipRotation.value = 0;
      cardLiftY.value = 0;
      txListOpacity.value = 0;
      txListTranslateY.value = 30;

      // Start at dashboard card's exact screen position
      translateX.value = originTranslateX;
      translateY.value = originTranslateY;
      zoomScale.value = originScale;
      backdropOpacity.value = 0;

      // Animate to center with subtle float zoom
      backdropOpacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      translateX.value = withSpring(0, { damping: 16, stiffness: 120, mass: 0.8 });
      translateY.value = withSpring(0, { damping: 16, stiffness: 120, mass: 0.8 });
      zoomScale.value = withSpring(1.05, { damping: 16, stiffness: 120, mass: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, originTranslateX, originTranslateY, originScale]);

  // Handle Flip Button (via double tap)
  const handleToggleFlip = useCallback(() => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    flipRotation.value = withSpring(nextFlipped ? 180 : 0, {
      damping: 14,
      stiffness: 90,
      mass: 0.9,
    });
  }, [isFlipped, flipRotation]);

  // Handle single tap to expand/collapse
  const handleToggleExpand = useCallback(() => {
    if (isDismissingRef.current) return;

    const nextExpanded = !isExpandedRef.current;
    isExpandedRef.current = nextExpanded;
    setIsExpanded(nextExpanded);

    const springConfig = { damping: 16, stiffness: 120, mass: 0.8 };

    if (nextExpanded) {
      // 1. Lift card up immediately
      cardLiftY.value = withSpring(CARD_LIFT_Y, springConfig);

      // 2. Add 1 second delay before the transaction list shows up
      txListOpacity.value = withDelay(
        200,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      );
      txListTranslateY.value = withDelay(
        200,
        withSpring(0, springConfig)
      );

      if (txTimerRef.current) clearTimeout(txTimerRef.current);
      txTimerRef.current = setTimeout(() => {
        setShowTxList(true);
      }, 1000);
    } else {
      // 1. Fade out transaction list immediately
      setShowTxList(false);
      if (txTimerRef.current) clearTimeout(txTimerRef.current);
      txListOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
      txListTranslateY.value = withTiming(30, { duration: 200, easing: Easing.out(Easing.cubic) });

      // 2. Add 1 second delay before the 3D card goes back to center
      cardLiftY.value = withDelay(200, withSpring(0, springConfig));
    }
  }, [cardLiftY, txListOpacity, txListTranslateY]);

  // Handle Copy Card / Account Number
  const handleCopy = useCallback((textToCopy: string, _label: string) => {
    try {
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(textToCopy);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // 3D Pan Drag Gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startRotateX.value = rotateX.value;
      startRotateY.value = rotateY.value;
    })
    .onUpdate((event) => {
      const newY = startRotateY.value + event.translationX * 0.28;
      const newX = startRotateX.value - event.translationY * 0.28;
      rotateY.value = Math.max(-42, Math.min(42, newY));
      rotateX.value = Math.max(-38, Math.min(38, newX));
    })
    .onEnd((event) => {
      // Swipe down to dismiss
      if (event.translationY > 120 && event.velocityY > 300) {
        runOnJS(handleDismiss)();
        return;
      }
      rotateX.value = withSpring(0, { damping: 14, stiffness: 95 });
      rotateY.value = withSpring(0, { damping: 14, stiffness: 95 });
    });

  // Double tap to flip
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleToggleFlip)();
    });

  // Single tap on card to expand/collapse
  const singleCardTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(handleToggleExpand)();
    });

  // Single tap on backdrop to dismiss (collapses first if expanded)
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(handleDismiss)();
    });

  const cardGesture = Gesture.Exclusive(doubleTapGesture, singleCardTapGesture, panGesture);

  // Animated styles
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const totalY = rotateY.value + flipRotation.value;
    const normalizedY = ((totalY % 360) + 360) % 360;
    const isShowingBack = normalizedY > 90 && normalizedY < 270;

    return {
      opacity: isShowingBack ? 0 : 1,
      zIndex: isShowingBack ? 1 : 10,
      transform: [
        { perspective: 1200 },
        { translateX: translateX.value },
        { translateY: translateY.value + cardLiftY.value },
        { scale: zoomScale.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${totalY}deg` },
      ],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const totalY = rotateY.value + flipRotation.value;
    const normalizedY = ((totalY % 360) + 360) % 360;
    const isShowingBack = normalizedY > 90 && normalizedY < 270;

    return {
      opacity: isShowingBack ? 1 : 0,
      zIndex: isShowingBack ? 10 : 1,
      transform: [
        { perspective: 1200 },
        { translateX: translateX.value },
        { translateY: translateY.value + cardLiftY.value },
        { scale: zoomScale.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${totalY + 180}deg` },
      ],
    };
  });

  const specularGlareStyle = useAnimatedStyle(() => {
    const transX = interpolate(rotateY.value, [-42, 42], [VIEWER_CARD_WIDTH * 0.7, -VIEWER_CARD_WIDTH * 0.7]);
    const transY = interpolate(rotateX.value, [-38, 38], [-VIEWER_CARD_HEIGHT * 0.5, VIEWER_CARD_HEIGHT * 0.5]);
    const glareIntensity = interpolate(
      Math.sqrt(rotateX.value * rotateX.value + rotateY.value * rotateY.value),
      [0, 10, 40],
      [0.08, 0.25, 0.55]
    );
    return {
      transform: [
        { translateX: transX },
        { translateY: transY },
        { rotate: '30deg' },
      ],
      opacity: glareIntensity * backdropOpacity.value,
    };
  });

  // Transaction list animated style
  const txListAnimatedStyle = useAnimatedStyle(() => ({
    opacity: txListOpacity.value,
    transform: [{ translateY: txListTranslateY.value }],
  }));

  if (!modalRendered || !activeCard) {
    return null;
  }

  const currentCard = activeCard;
  const isCash = currentCard.accountType === 'cash';
  const phBank = findPhilippineBank(currentCard.bankCode || currentCard.institution || currentCard.bankName);
  const accountLabel = currentCard.accountName || currentCard.bankName || (isCash ? 'Physical Cash' : 'Main Account');
  const themeColor = currentCard.backgroundColor || phBank?.color || '#1E293B';
  const rawNumber = currentCard.cardNumber || `•••• ${currentCard.id.replace(/\D/g, '').slice(-4) || '8421'}`;
  const fullMaskedNumber = isCash
    ? `CASH-ID-${currentCard.id.toUpperCase()}`
    : `4820 9182 3746 ${rawNumber.replace(/[^0-9]/g, '').slice(-4) || '8421'}`;
  const securityCvv = '749';

  // Format transaction date
  const formatTxDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get transaction display info
  const getTxInfo = (tx: Transaction) => {
    const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
    const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.destinationAccountId === currentCard.id);
    const amountPrefix = isIncoming ? '+' : '-';
    const amountColor = isIncoming ? '#4DE082' : '#FFB4AB';
    const icon = cat?.icon || (tx.type === 'transfer' ? 'swap-horiz' : tx.type === 'income' ? 'arrow-downward' : 'arrow-upward');
    const iconColor = cat?.color || (isIncoming ? '#4DE082' : '#FFB4AB');

    return { amountPrefix, amountColor, icon, iconColor, isIncoming };
  };

  return (
    <Modal
      transparent
      visible={modalRendered}
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        {/* Blurred Frosted Backdrop (70% Blur) — tap to dismiss */}
        <GestureDetector gesture={singleTapGesture}>
          <Animated.View style={[styles.backdropFill, animatedBackdropStyle]}>
            <BlurView
              intensity={90}
              tint="dark"
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod="dimezisBlurView"
            />
            <View style={styles.frostedTint} pointerEvents="none" />
          </Animated.View>
        </GestureDetector>

        {/* Card centered absolutely at screen center */}
        <GestureDetector gesture={cardGesture}>
          <View style={styles.cardWrapper}>
            {/* ==================== FRONT OF CARD ==================== */}
            <Animated.View
              style={[
                styles.cardBody,
                frontAnimatedStyle,
              ]}
            >
              <RealisticCardFace card={currentCard} currencySymbol={currencySymbol}>
                {/* Dynamic Specular Holographic Glare */}
                <Animated.View
                  style={[styles.holographicSheen, specularGlareStyle]}
                  pointerEvents="none"
                />
              </RealisticCardFace>
            </Animated.View>

            {/* ==================== BACK OF CARD ==================== */}
            <Animated.View
              style={[
                styles.cardBody,
                styles.cardBodyBack,
                { backgroundColor: themeColor },
                backAnimatedStyle,
              ]}
            >
              {/* Magnetic Stripe */}
              <View style={styles.magStripe} />

              {/* Signature & CVV Band */}
              <View style={styles.backSignatureRow}>
                <View style={styles.signatureStrip}>
                  <Text style={styles.signatureScript}>Stackly Verified Asset</Text>
                </View>

                <Pressable
                  onPress={() => setShowCvv(!showCvv)}
                  style={styles.cvvBox}
                  hitSlop={8}
                >
                  <Text style={styles.cvvMicroLabel}>CVV/CVC</Text>
                  <View style={styles.cvvValueRow}>
                    <Text style={styles.cvvText}>{showCvv ? securityCvv : '•••'}</Text>
                    <MaterialIcons
                      name={showCvv ? 'visibility-off' : 'visibility'}
                      size={12}
                      color="#090B10"
                    />
                  </View>
                </Pressable>
              </View>

              {/* Security Hologram & Bank Routing Information */}
              <View style={styles.backInfoContainer}>
                <View style={styles.backLeftInfo}>
                  <Text style={styles.backNoticeText}>
                    Authorized signature only. For customer service or lost cards, open Stackly or
                    contact your issuing institution.
                  </Text>
                  <View style={styles.backIdPill}>
                    <Text style={styles.backIdLabel}>ACCOUNT ID:</Text>
                    <Text style={styles.backIdValue} numberOfLines={1}>
                      {currentCard.id}
                    </Text>
                  </View>
                </View>

                <View style={styles.hologramStamp}>
                  <View style={styles.hologramEagle}>
                    <MaterialIcons name="fingerprint" size={24} color="rgba(255,255,255,0.7)" />
                  </View>
                  <Text style={styles.hologramMicroText}>SECURE</Text>
                </View>
              </View>

              {/* Back Footer Quick Action Strip */}
              <View style={styles.backFooterRow}>
                <ScaleButton
                  activeScale={0.92}
                  onPress={() => handleCopy(fullMaskedNumber.replace(/\s/g, ''), 'Card Number')}
                  style={styles.backActionBtn}
                >
                  <MaterialIcons name="content-copy" size={13} color="#FFFFFF" />
                  <Text style={styles.backActionBtnText}>Copy Card No.</Text>
                </ScaleButton>

                <ScaleButton
                  activeScale={0.92}
                  onPress={() => handleCopy(currentCard.id, 'Account ID')}
                  style={styles.backActionBtn}
                >
                  <MaterialIcons name="tag" size={13} color="#FFFFFF" />
                  <Text style={styles.backActionBtnText}>Copy ID</Text>
                </ScaleButton>
              </View>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* ==================== TRANSACTION LIST ==================== */}
        <Animated.View
          style={[styles.txListContainer, txListAnimatedStyle]}
          pointerEvents={showTxList ? 'auto' : 'none'}
        >
          <View style={styles.txListHeader}>
            <Text style={styles.txListTitle}>Recent Transactions</Text>
            <Text style={styles.txListSubtitle}>{accountLabel}</Text>
          </View>

          {accountTransactions.length > 0 ? (
            <ScrollView
              style={styles.txScrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {accountTransactions.map((tx) => {
                const info = getTxInfo(tx);
                return (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={[styles.txIconContainer, { backgroundColor: `${info.iconColor}20` }]}>
                      <MaterialIcons
                        name={info.icon as any}
                        size={18}
                        color={info.iconColor}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Text style={styles.txPayee} numberOfLines={1}>
                        {tx.payee}
                      </Text>
                      <Text style={styles.txDate}>
                        {formatTxDate(tx.date)}
                        {tx.type === 'transfer' ? ' • Transfer' : ''}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: info.amountColor }]}>
                      {info.amountPrefix}{currencySymbol}
                      {tx.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.txEmptyState}>
              <MaterialIcons name="receipt-long" size={28} color="rgba(255,255,255,0.25)" />
              <Text style={styles.txEmptyText}>No transactions yet</Text>
              <Text style={styles.txEmptySubtext}>Transactions will appear here</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropFill: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  frostedTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 14, 23, 0.28)', // Soft translucent tint (keeps underlying dashboard vibrant and visible)
  },
  cardWrapper: {
    width: VIEWER_CARD_WIDTH,
    height: VIEWER_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    position: 'absolute',
    width: VIEWER_CARD_WIDTH,
    height: VIEWER_CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBodyBack: {
    paddingVertical: 18,
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  holographicSheen: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: VIEWER_CARD_WIDTH * 1.5,
    height: VIEWER_CARD_HEIGHT * 1.8,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 80,
  },
  // Back of card styles
  magStripe: {
    width: '100%',
    height: 42,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backSignatureRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signatureStrip: {
    flex: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  signatureScript: {
    color: '#334155',
    fontStyle: 'italic',
    fontSize: 12,
    fontWeight: '600',
  },
  cvvBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 50,
  },
  cvvMicroLabel: {
    color: '#64748B',
    fontSize: 7,
    fontWeight: '800',
  },
  cvvValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cvvText: {
    color: '#090B10',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  backInfoContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backLeftInfo: {
    flex: 1,
  },
  backNoticeText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 7.5,
    lineHeight: 11,
  },
  backIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  backIdLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 8,
    fontWeight: '800',
  },
  backIdValue: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  hologramStamp: {
    width: 44,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hologramEagle: {},
  hologramMicroText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backFooterRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backActionBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  // Transaction list styles
  txListContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 + VIEWER_CARD_HEIGHT / 2 + CARD_LIFT_Y + 20,
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: 20,
  },
  txListHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  txListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  txListSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  txScrollView: {
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txPayee: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  txDate: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  txEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  txEmptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  txEmptySubtext: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
