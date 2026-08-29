import { Account, Transaction, Subscription, Category, BudgetGoal, SavingsGoal } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Income', type: 'income', icon: 'payments', color: '#4de082' },
  { id: 'c2', name: 'House Rent & Utilities', type: 'expense', icon: 'home', color: '#ffb4ab' },
  { id: 'c4', name: 'Entertainment', type: 'expense', icon: 'movie', color: '#ffb4ab' },
  { id: 'c5', name: 'Music', type: 'expense', icon: 'music-note', color: '#ffb4ab' },
  { id: 'c6', name: 'Software', type: 'expense', icon: 'design-services', color: '#ffb4ab' },
  { id: 'c7', name: 'Fitness', type: 'expense', icon: 'fitness-center', color: '#ffb4ab' },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'a1',
    name: 'BPI Checking',
    institution: 'BPI',
    balance: 8000.0,
    type: 'bank',
    icon: 'account-balance',
    cardCategory: 'debit',
    cardNetwork: 'mastercard',
    bankCode: 'BPI',
  },
  {
    id: 'a2',
    name: 'Maya Wallet',
    institution: 'Maya Bank',
    balance: 1200.0,
    type: 'e-wallet',
    icon: 'account-balance-wallet',
    cardCategory: 'debit',
    cardNetwork: 'visa',
    bankCode: 'MAYA',
  },
  {
    id: 'a3',
    name: 'MariBank Savings',
    institution: 'MariBank',
    balance: 2500.0,
    type: 'bank',
    icon: 'account-balance-wallet',
    cardCategory: 'debit',
    cardNetwork: 'mastercard',
    bankCode: 'MARIBANK',
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 4200.0,
    payee: 'Salary',
    categoryId: 'c1',
    date: new Date().toISOString(),
    accountId: 'a2',
  },
  {
    id: 't2',
    type: 'expense',
    amount: 1200.0,
    payee: 'Monthly Apartment Rent',
    categoryId: 'c2',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    accountId: 'a1',
  },
  {
    id: 't3',
    type: 'expense',
    amount: 85.5,
    payee: 'Electricity & Water Bill',
    categoryId: 'c2',
    date: new Date('2026-10-24T08:00:00Z').toISOString(),
    accountId: 'a2',
  },
];

export const MOCK_UPCOMING_BILLS = [
  {
    id: 'b1',
    name: 'Netflix',
    amount: 15.99,
    dueDate: 'Tomorrow',
    icon: 'movie',
  },
  {
    id: 'b2',
    name: 'Rent',
    amount: 1200.0,
    dueDate: 'In 3 days',
    icon: 'home',
  },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's1',
    name: 'Netflix',
    categoryId: 'c4',
    amount: 15.99,
    billingCycle: 'monthly',
    dueDay: 6,
    nextChargeDate: new Date('2026-10-06T12:00:00Z').toISOString(),
    icon: 'movie',
    active: true,
    color: '#E50914',
  },
  {
    id: 's2',
    name: 'Spotify',
    categoryId: 'c5',
    amount: 9.99,
    billingCycle: 'monthly',
    dueDay: 28,
    nextChargeDate: new Date('2026-10-28T12:00:00Z').toISOString(),
    icon: 'music-note',
    active: true,
    color: '#1DB954',
  },
  {
    id: 's3',
    name: 'Adobe CC',
    categoryId: 'c6',
    amount: 599.99,
    billingCycle: 'yearly',
    dueDay: 1,
    nextChargeDate: new Date('2026-11-01T12:00:00Z').toISOString(),
    icon: 'design-services',
    active: true,
    color: '#FF0000',
  },
  {
    id: 's4',
    name: 'Cloud Storage',
    categoryId: 'c6',
    amount: 29.99,
    billingCycle: 'quarterly',
    dueDay: 15,
    nextChargeDate: new Date('2026-11-15T12:00:00Z').toISOString(),
    icon: 'cloud',
    active: true,
    color: '#38BDF8',
  },
  {
    id: 's5',
    name: 'Gym Membership',
    categoryId: 'c7',
    amount: 12.50,
    billingCycle: 'weekly',
    dueDay: 1, // Monday
    nextChargeDate: new Date('2026-10-19T12:00:00Z').toISOString(),
    icon: 'fitness-center',
    active: true,
    color: '#4DE082',
  },
];

export const MOCK_BUDGET_GOALS: BudgetGoal[] = [
  {
    id: 'bg1',
    categoryId: 'c2',
    monthlyLimit: 1500,
  },
];

export const MOCK_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 8000,
    targetDate: new Date('2027-12-31T00:00:00Z').toISOString(),
    icon: 'security',
    color: '#4de082',
  },
  {
    id: 'sg2',
    name: 'New Laptop',
    targetAmount: 2000,
    currentAmount: 500,
    targetDate: new Date('2026-11-15T00:00:00Z').toISOString(),
    icon: 'laptop-mac',
    color: '#b2c5ff',
  }
];
