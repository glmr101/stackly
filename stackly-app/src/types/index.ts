export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  payee: string;
  category: string;
  categoryIcon: string;
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
  icon: string;
};

export type Subscription = {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextChargeDate: string; // ISO String
  icon: string;
  active: boolean;
  color: string;
};
