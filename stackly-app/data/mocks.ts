import { Account, Transaction, Subscription, Category, BudgetGoal, SavingsGoal } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Income', type: 'income', icon: 'payments', color: '#4de082' },
  { id: 'c2', name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#ffb4ab' },
  { id: 'c3', name: 'Food', type: 'expense', icon: 'local-cafe', color: '#ffb4ab' },
  { id: 'c4', name: 'Entertainment', type: 'expense', icon: 'movie', color: '#ffb4ab' },
  { id: 'c5', name: 'Music', type: 'expense', icon: 'music-note', color: '#ffb4ab' },
  { id: 'c6', name: 'Software', type: 'expense', icon: 'design-services', color: '#ffb4ab' },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'a1',
    name: 'Savings',
    institution: 'Chase Bank',
    balance: 8000.0,
    type: 'bank',
    icon: 'savings',
  },
  {
    id: 'a2',
    name: 'Checking',
    institution: 'Wells Fargo',
    balance: 1200.0,
    type: 'e-wallet',
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
    categoryId: 'c1',
    date: new Date().toISOString(),
    accountId: 'a2',
  },
  {
    id: 't2',
    type: 'expense',
    amount: 142.5,
    payee: 'Whole Foods',
    categoryId: 'c2',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    accountId: 'a2',
  },
  {
    id: 't3',
    type: 'expense',
    amount: 6.5,
    payee: 'Blue Bottle Coffee',
    categoryId: 'c3',
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
    nextChargeDate: new Date('2026-10-24T00:00:00Z').toISOString(),
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
    nextChargeDate: new Date('2026-10-28T00:00:00Z').toISOString(),
    icon: 'music-note',
    active: true,
    color: '#1DB954',
  },
  {
    id: 's3',
    name: 'Adobe CC',
    categoryId: 'c6',
    amount: 52.99,
    billingCycle: 'monthly',
    nextChargeDate: new Date('2026-11-01T00:00:00Z').toISOString(),
    icon: 'design-services',
    active: true,
    color: '#FF0000',
  },
];

export const MOCK_BUDGET_GOALS: BudgetGoal[] = [
  {
    id: 'bg1',
    categoryId: 'c2',
    monthlyLimit: 600,
  },
  {
    id: 'bg2',
    categoryId: 'c3',
    monthlyLimit: 150,
  }
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
