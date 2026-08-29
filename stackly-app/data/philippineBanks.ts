import { MaterialIconName } from '@/types';

export interface PhilippineBank {
  id: string;
  name: string;
  shortName: string;
  code: string;
  category: 'Universal / Commercial' | 'Digital Bank' | 'E-Wallet' | 'Thrift / Savings' | 'Government / Other';
  color: string;
  textColor?: string;
  icon: MaterialIconName;
  popular?: boolean;
}

export const PHILIPPINE_BANKS: PhilippineBank[] = [
  {
    id: 'bpi',
    name: 'Bank of the Philippine Islands',
    shortName: 'BPI',
    code: 'BPI',
    category: 'Universal / Commercial',
    color: '#B11116',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'bdo',
    name: 'BDO Unibank',
    shortName: 'BDO',
    code: 'BDO',
    category: 'Universal / Commercial',
    color: '#002D72',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'metrobank',
    name: 'Metropolitan Bank and Trust Co.',
    shortName: 'Metrobank',
    code: 'MBT',
    category: 'Universal / Commercial',
    color: '#0052CC',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'maya',
    name: 'Maya Bank / PayMaya',
    shortName: 'Maya Bank',
    code: 'MAYA',
    category: 'Digital Bank',
    color: '#00D664',
    icon: 'account-balance-wallet',
    popular: true,
  },
  {
    id: 'gcash',
    name: 'GCash (G-Xchange)',
    shortName: 'GCash',
    code: 'GCASH',
    category: 'E-Wallet',
    color: '#007DFE',
    icon: 'account-balance-wallet',
    popular: true,
  },
  {
    id: 'maribank',
    name: 'MariBank Philippines',
    shortName: 'MariBank',
    code: 'MARIBANK',
    category: 'Digital Bank',
    color: '#FF5722',
    icon: 'account-balance-wallet',
    popular: true,
  },
  {
    id: 'seabank',
    name: 'SeaBank Philippines',
    shortName: 'SeaBank',
    code: 'SEABANK',
    category: 'Digital Bank',
    color: '#FF6B00',
    icon: 'account-balance-wallet',
    popular: true,
  },
  {
    id: 'unionbank',
    name: 'Union Bank of the Philippines',
    shortName: 'UnionBank',
    code: 'UBP',
    category: 'Universal / Commercial',
    color: '#FF6600',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'gotyme',
    name: 'GoTyme Bank',
    shortName: 'GoTyme',
    code: 'GOTYME',
    category: 'Digital Bank',
    color: '#00E5FF',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'securitybank',
    name: 'Security Bank Corporation',
    shortName: 'Security Bank',
    code: 'SECB',
    category: 'Universal / Commercial',
    color: '#007A33',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'landbank',
    name: 'Land Bank of the Philippines',
    shortName: 'Landbank',
    code: 'LBP',
    category: 'Government / Other',
    color: '#006837',
    icon: 'account-balance',
    popular: true,
  },
  {
    id: 'rcbc',
    name: 'Rizal Commercial Banking Corp.',
    shortName: 'RCBC',
    code: 'RCBC',
    category: 'Universal / Commercial',
    color: '#0055A5',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'pnb',
    name: 'Philippine National Bank',
    shortName: 'PNB',
    code: 'PNB',
    category: 'Universal / Commercial',
    color: '#003366',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'chinabank',
    name: 'China Banking Corporation',
    shortName: 'China Bank',
    code: 'CHIB',
    category: 'Universal / Commercial',
    color: '#C00000',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'cimb',
    name: 'CIMB Bank Philippines',
    shortName: 'CIMB',
    code: 'CIMB',
    category: 'Digital Bank',
    color: '#ED1C24',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'tonik',
    name: 'Tonik Digital Bank',
    shortName: 'Tonik',
    code: 'TONIK',
    category: 'Digital Bank',
    color: '#7928CA',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'uno',
    name: 'UNO Digital Bank',
    shortName: 'Uno Bank',
    code: 'UNO',
    category: 'Digital Bank',
    color: '#FFA000',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'eastwest',
    name: 'EastWest Banking Corporation',
    shortName: 'EastWest',
    code: 'EWB',
    category: 'Universal / Commercial',
    color: '#004F9F',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'psbank',
    name: 'Philippine Savings Bank',
    shortName: 'PSBank',
    code: 'PSB',
    category: 'Thrift / Savings',
    color: '#00386B',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'dbp',
    name: 'Development Bank of the Philippines',
    shortName: 'DBP',
    code: 'DBP',
    category: 'Government / Other',
    color: '#002B49',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'bankcom',
    name: 'Bank of Commerce',
    shortName: 'Bank of Commerce',
    code: 'BOC',
    category: 'Universal / Commercial',
    color: '#D32F2F',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'robinsons',
    name: 'Robinsons Bank',
    shortName: 'Robinsons Bank',
    code: 'RBNX',
    category: 'Universal / Commercial',
    color: '#008080',
    icon: 'account-balance',
    popular: false,
  },
  {
    id: 'other',
    name: 'Other / Custom Bank',
    shortName: 'Other Bank',
    code: 'OTHER',
    category: 'Government / Other',
    color: '#64748B',
    icon: 'account-balance',
    popular: false,
  },
];

export const POPULAR_PHILIPPINE_BANKS = PHILIPPINE_BANKS.filter((b) => b.popular);

export function findPhilippineBank(idOrCode: string): PhilippineBank | undefined {
  const normalized = idOrCode.toLowerCase().trim();
  return PHILIPPINE_BANKS.find(
    (b) =>
      b.id.toLowerCase() === normalized ||
      b.code.toLowerCase() === normalized ||
      b.shortName.toLowerCase() === normalized
  );
}
