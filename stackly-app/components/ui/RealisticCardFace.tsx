import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { findPhilippineBank } from '@/data/philippineBanks';
import { CardItem } from '@/components/ui/StackedCardCarousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Canonical Card Dimensions (ISO/IEC 7810 ID-1 standard ratio ~1.58)
export const REALISTIC_CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.80), 330);
export const REALISTIC_CARD_HEIGHT = Math.round(REALISTIC_CARD_WIDTH / 1.58);

interface RealisticCardFaceProps {
  card: CardItem;
  currencySymbol?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function RealisticCardFace({
  card,
  currencySymbol = '₱',
  style,
  children,
}: RealisticCardFaceProps) {
  const isCash = card.accountType === 'cash';
  const phBank = findPhilippineBank(card.bankCode || card.institution || card.bankName);
  const institutionName = card.institution || phBank?.shortName || card.bankName || (isCash ? 'Physical Cash' : 'BANK');
  const accountLabel = card.accountName || card.bankName || (isCash ? 'Physical Cash' : 'Main Account');
  const themeColor = card.backgroundColor || phBank?.color || (isCash ? '#152E22' : '#1E293B');
  const isMastercard = card.cardNetwork === 'mastercard' || card.cardType === 'mastercard';
  const rawNumber = card.cardNumber || `•••• ${card.id.replace(/\D/g, '').slice(-4) || '8421'}`;
  const fullMaskedNumber = isCash
    ? `CASH-ID-${card.id.toUpperCase()}`
    : `4820 9182 3746 ${rawNumber.replace(/[^0-9]/g, '').slice(-4) || '8421'}`;
  const cardHolderName = card.cardHolder || institutionName.toUpperCase() || 'STACKLY USER';
  const expiryDate = card.expiryDate || '12/29';

  return (
    <View style={[styles.cardBody, { backgroundColor: themeColor, shadowColor: themeColor }, style]}>
      {/* Background Texture & Ambient Mesh Orbs */}
      <View style={styles.cardInnerGlow} pointerEvents="none" />
      <View style={styles.cardSpecularShine} pointerEvents="none" />
      <View style={styles.cardLuminousAura} pointerEvents="none" />
      <View style={styles.cardNeonRim} pointerEvents="none" />

      {/* Injected overlays (e.g. 3D holographic sheen or frosted blur) */}
      {children}

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.bankIdentityRow}>
          <View style={styles.bankIconCircle}>
            <MaterialIcons
              name={(card.icon as any) || (isCash ? 'payments' : 'account-balance')}
              size={16}
              color="#FFFFFF"
            />
          </View>
          <View>
            <Text style={styles.frontInstitutionText} numberOfLines={1}>
              {institutionName.toUpperCase()}
            </Text>
            <Text style={styles.frontCategorySubtext}>
              {isCash
                ? 'PHYSICAL CASH'
                : (card.cardCategory || card.accountType || 'DEBIT').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Right Header: Wireless contactless or Cash badge */}
        <View style={styles.headerRightBadge}>
          {!isCash ? (
            <View style={styles.nfcContainer}>
              <MaterialIcons
                name="contactless"
                size={20}
                color="rgba(255, 255, 255, 0.75)"
              />
            </View>
          ) : (
            <View style={styles.cashVaultBadge}>
              <MaterialIcons name="security" size={13} color="#4DE082" />
              <Text style={styles.cashVaultText}>VAULT</Text>
            </View>
          )}
        </View>
      </View>

      {/* Middle Row: EMV Gold Chip & Hologram Foil */}
      <View style={styles.chipAndHoloRow}>
        {!isCash ? (
          <View style={styles.emvGoldChip}>
            <View style={styles.chipMicroGrid}>
              <View style={styles.chipLineHorizontal} />
              <View style={styles.chipLineVertical} />
              <View style={styles.chipCenterCore} />
            </View>
          </View>
        ) : (
          <View style={styles.cashWatermarkPill}>
            <MaterialIcons name="attach-money" size={16} color="rgba(77,224,130,0.7)" />
            <Text style={styles.cashWatermarkText}>LEGAL TENDER</Text>
          </View>
        )}
      </View>

      {/* Embossed Card Number */}
      <View style={styles.cardNumberContainer}>
        <Text style={styles.embossedCardNumber}>{fullMaskedNumber}</Text>
      </View>

      {/* Balance & Expiry Row */}
      <View style={styles.cardFooter}>
        <View style={styles.footerBalanceGroup}>
          <Text style={styles.footerCaptionLabel}>
            {isCash ? 'AVAILABLE CASH' : 'CURRENT BALANCE'}
          </Text>
          <Text style={styles.frontBalanceValue}>
            {currencySymbol}
            {(card.balance ?? 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.footerRightInfo}>
          {!isCash ? (
            <>
              <View style={styles.expiryGroup}>
                <Text style={styles.expiryMicroLabel}>GOOD THRU</Text>
                <Text style={styles.expiryValueText}>{expiryDate}</Text>
              </View>
              {isMastercard ? (
                <View style={styles.mcSpheres}>
                  <View style={styles.mcRed} />
                  <View style={styles.mcYellow} />
                </View>
              ) : (
                <Text style={styles.visaBrandText}>VISA</Text>
              )}
            </>
          ) : (
            <View style={styles.cashCurrencySymbolContainer}>
              <Text style={styles.cashCurrencyLargeText}>PHP</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cardholder Name */}
      <View style={styles.cardholderRow}>
        <Text style={styles.cardholderText} numberOfLines={1}>
          {cardHolderName}
        </Text>
        <Text style={styles.cardAccountSubLabel} numberOfLines={1}>
          {accountLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    width: REALISTIC_CARD_WIDTH,
    height: REALISTIC_CARD_HEIGHT,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14,
  },
  cardInnerGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  cardSpecularShine: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  cardLuminousAura: {
    position: 'absolute',
    top: -30,
    left: 40,
    width: 180,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardNeonRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bankIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 6,
  },
  bankIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  frontInstitutionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  frontCategorySubtext: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  headerRightBadge: {
    alignItems: 'flex-end',
  },
  nfcContainer: {
    padding: 2,
  },
  cashVaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(77, 224, 130, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(77, 224, 130, 0.35)',
  },
  cashVaultText: {
    color: '#4DE082',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipAndHoloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
    zIndex: 2,
  },
  emvGoldChip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    borderWidth: 1,
    borderColor: '#B8860B',
    padding: 2.5,
    justifyContent: 'center',
  },
  chipMicroGrid: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  chipLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  chipCenterCore: {
    width: 10,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.35)',
    backgroundColor: '#E5C158',
  },
  cashWatermarkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(77, 224, 130, 0.3)',
  },
  cashWatermarkText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardNumberContainer: {
    marginVertical: 2,
    zIndex: 2,
  },
  embossedCardNumber: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 2.5,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  footerBalanceGroup: {},
  footerCaptionLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  frontBalanceValue: {
    color: '#FFFFFF',
    fontSize: 18.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  footerRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expiryGroup: {
    alignItems: 'flex-end',
  },
  expiryMicroLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expiryValueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mcSpheres: {
    width: 30,
    height: 18,
    position: 'relative',
    justifyContent: 'center',
  },
  mcRed: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EB001B',
    opacity: 0.95,
  },
  mcYellow: {
    position: 'absolute',
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F79E1B',
    opacity: 0.9,
  },
  visaBrandText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.2,
  },
  cashCurrencySymbolContainer: {
    backgroundColor: 'rgba(77, 224, 130, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  cashCurrencyLargeText: {
    color: '#4DE082',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 2,
  },
  cardholderText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    flex: 1,
  },
  cardAccountSubLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 9,
    fontWeight: '500',
    maxWidth: 110,
    textAlign: 'right',
  },
});
