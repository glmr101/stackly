import { Currency, Region } from '@/types';

export const DEFAULT_CURRENCY: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
};

export const DEFAULT_REGION: Region = {
  code: 'US',
  name: 'United States',
  flag: '🇺🇸',
  defaultCurrency: DEFAULT_CURRENCY,
};

export const POPULAR_REGIONS: Region[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    defaultCurrency: { code: 'USD', symbol: '$', name: 'US Dollar' },
  },
  {
    code: 'EU',
    name: 'European Union (Eurozone)',
    flag: '🇪🇺',
    defaultCurrency: { code: 'EUR', symbol: '€', name: 'Euro' },
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    defaultCurrency: { code: 'GBP', symbol: '£', name: 'British Pound' },
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    defaultCurrency: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    defaultCurrency: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    defaultCurrency: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    defaultCurrency: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    defaultCurrency: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    defaultCurrency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    defaultCurrency: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    defaultCurrency: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    defaultCurrency: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    defaultCurrency: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    defaultCurrency: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    defaultCurrency: { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    defaultCurrency: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    defaultCurrency: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    defaultCurrency: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    defaultCurrency: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    defaultCurrency: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    defaultCurrency: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    defaultCurrency: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    defaultCurrency: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    defaultCurrency: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    defaultCurrency: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    defaultCurrency: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    flag: '🇭🇰',
    defaultCurrency: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  },
  {
    code: 'TW',
    name: 'Taiwan',
    flag: '🇹🇼',
    defaultCurrency: { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    defaultCurrency: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    defaultCurrency: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    defaultCurrency: { code: 'COP', symbol: 'COL$', name: 'Colombian Peso' },
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    defaultCurrency: { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso' },
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    defaultCurrency: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  },
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    defaultCurrency: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  },
];

export const ALL_CURRENCIES: Currency[] = Array.from(
  new Map(
    POPULAR_REGIONS.map((r) => [r.defaultCurrency.code, r.defaultCurrency])
  ).values()
);
