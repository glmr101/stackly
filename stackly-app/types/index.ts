import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: MaterialIconName;
  color: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'savings';
  amount: number;
  payee: string;
  categoryId?: string;
  date: string; // ISO String
  note?: string;
  accountId: string;
  destinationAccountId?: string; // For transfers
  savingsGoalId?: string; // For savings contributions
};

export type Account = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'bank' | 'e-wallet' | 'cash' | 'credit card' | 'investment';
  icon: MaterialIconName;
  cardCategory?: 'debit' | 'credit';
  cardNetwork?: 'visa' | 'mastercard' | 'generic';
  bankCode?: string;
};

export type Subscription = {
  id: string;
  name: string;
  categoryId?: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextChargeDate: string; // ISO String
  icon: MaterialIconName;
  active: boolean;
  color: string;
  dueDay?: number;
};

export type BudgetGoal = {
  id: string;
  categoryId: string;
  monthlyLimit: number;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // ISO String
  icon: MaterialIconName;
  color: string;
};

export type AppDataSnapshot = {
  accounts: Account[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  savingsGoals: SavingsGoal[];
};

export type Currency = {
  code: string; // e.g. "USD", "EUR", "PHP"
  symbol: string; // e.g. "$", "€", "₱"
  name: string; // e.g. "US Dollar"
};

export type Region = {
  code: string; // e.g. "US", "PH", "GB"
  name: string; // e.g. "United States"
  flag: string; // e.g. "🇺🇸"
  defaultCurrency: Currency;
};
