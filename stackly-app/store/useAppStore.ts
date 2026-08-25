import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Transaction, Subscription } from '@/types';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_SUBSCRIPTIONS } from '@/data/mocks';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  toggleSubscription: (id: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state is seeded with mock data if AsyncStorage is empty
      accounts: MOCK_ACCOUNTS,
      transactions: MOCK_TRANSACTIONS,
      subscriptions: MOCK_SUBSCRIPTIONS,

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...account, id: `a${Date.now()}` },
          ],
        })),

      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: `t${Date.now()}`,
          };

          // Update the balance of the associated account
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.name === transaction.accountId || acc.id === transaction.accountId) {
              const amountChange =
                transaction.type === 'expense' || transaction.type === 'transfer'
                  ? -transaction.amount
                  : transaction.amount;
              return { ...acc, balance: acc.balance + amountChange };
            }
            return acc;
          });

          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
          };
        }),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...subscription, id: `s${Date.now()}` },
          ],
        })),

      toggleSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, active: !sub.active } : sub
          ),
        })),

      reset: () =>
        set({
          accounts: [],
          transactions: [],
          subscriptions: [],
        }),
    }),
    {
      name: 'stackly-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
