import { Account, Transaction, Subscription } from '@/types';

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'a1',
    name: 'Savings',
    institution: 'Chase Bank',
    balance: 8000.0,
    type: 'savings',
    icon: 'savings',
  },
  {
    id: 'a2',
    name: 'Checking',
    institution: 'Wells Fargo',
    balance: 1200.0,
    type: 'checking',
    icon: 'account-balance-wallet',
  },
  {
    id: 'a3',
    name: 'Cash Stash',
    institution: 'Safe',
    balance: 250.0,
    type: 'cash',
    icon: 'payments',
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 4200.0,
    payee: 'Salary',
    category: 'Income',
    categoryIcon: 'payments',
    date: new Date().toISOString(),
    accountId: 'a2',
  },
  {
    id: 't2',
    type: 'expense',
    amount: 142.5,
    payee: 'Whole Foods',
    category: 'Groceries',
    categoryIcon: 'shopping-cart',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    accountId: 'a2',
  },
  {
    id: 't3',
    type: 'expense',
    amount: 6.5,
    payee: 'Blue Bottle Coffee',
    category: 'Food',
    categoryIcon: 'local-cafe',
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
    category: 'Entertainment',
    amount: 15.99,
    billingCycle: 'monthly',
    nextChargeDate: new Date('2026-10-24T00:00:00Z').toISOString(),
    icon: 'movie',
    active: true,
    color: '#E50914',
  },
  {
    id: 's2',
    name: 'Spotify',
    category: 'Music',
    amount: 9.99,
    billingCycle: 'monthly',
    nextChargeDate: new Date('2026-10-28T00:00:00Z').toISOString(),
    icon: 'music-note',
    active: true,
    color: '#1DB954',
  },
  {
    id: 's3',
    name: 'Adobe CC',
    category: 'Software',
    amount: 52.99,
    billingCycle: 'monthly',
    nextChargeDate: new Date('2026-11-01T00:00:00Z').toISOString(),
    icon: 'design-services',
    active: true,
    color: '#FF0000',
  },
];
