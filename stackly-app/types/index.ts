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
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  payee: string;
  categoryId?: string;
  date: string; // ISO String
  note?: string;
  accountId: string;
  destinationAccountId?: string; // For transfers
};

export type Account = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'bank' | 'e-wallet' | 'cash' | 'credit card' | 'investment';
  icon: MaterialIconName;
};

export type Subscription = {
  id: string;
  name: string;
  categoryId?: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextChargeDate: string; // ISO String
  icon: MaterialIconName;
  active: boolean;
  color: string;
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
