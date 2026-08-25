import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  payee: string;
  category: string;
  categoryIcon: MaterialIconName;
  date: string; // ISO String
  note?: string;
  accountId: string;
};

export type Account = {
  id: string;
  name: string;
  institution: string;
  balance: number;
  type: 'checking' | 'savings' | 'cash' | 'credit' | 'investment';
  icon: MaterialIconName;
};

export type Subscription = {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextChargeDate: string; // ISO String
  icon: MaterialIconName;
  active: boolean;
  color: string;
};
