import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Transaction, Subscription, Category, BudgetGoal, SavingsGoal, AppDataSnapshot, Currency, Region } from '@/types';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_SUBSCRIPTIONS, MOCK_CATEGORIES, MOCK_BUDGET_GOALS, MOCK_SAVINGS_GOALS } from '@/data/mocks';
import { DEFAULT_CURRENCY, DEFAULT_REGION } from '@/data/currencies';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  categories: Category[];
  budgetGoals: BudgetGoal[];
  savingsGoals: SavingsGoal[];
  currency: Currency;
  region: Region;
  biometricLockEnabled: boolean;

  addAccount: (account: Omit<Account, 'id' | 'createdAt'> & { createdAt?: string }) => void;
  updateAccount: (id: string, updates: Partial<Omit<Account, 'id'>>) => void;
  deleteAccount: (id: string) => void;
  lastDeletedAccount: Account | null;
  restoreAccount: (account: Account) => void;
  restoreLastDeletedAccount: () => void;
  clearLastDeletedAccount: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  lastDeletedTransaction: Transaction | null;
  restoreTransaction: (transaction: Transaction) => void;
  restoreLastDeletedTransaction: () => void;
  clearLastDeletedTransaction: () => void;

  lastDeletedSubscription: Subscription | null;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id'>>) => void;
  deleteSubscription: (id: string) => void;
  restoreSubscription: (subscription: Subscription) => void;
  restoreLastDeletedSubscription: () => void;
  clearLastDeletedSubscription: () => void;
  toggleSubscription: (id: string) => void;
  paySubscription: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  setBudgetGoal: (goal: Omit<BudgetGoal, 'id'> | BudgetGoal) => void;
  deleteBudgetGoal: (idOrCategoryId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<Omit<SavingsGoal, 'id'>>) => void;
  deleteSavingsGoal: (id: string) => void;

  contributeToSavingsGoal: (goalId: string, accountId: string, amount: number) => boolean;

  setCurrency: (currency: Currency) => void;
  setRegion: (region: Region) => void;
  setRegionAndCurrency: (region: Region, currency: Currency) => void;
  setBiometricLockEnabled: (enabled: boolean) => void;

  reset: () => void;
  resetToDemo: () => void;
  restoreSnapshot: (snapshot: AppDataSnapshot) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state is seeded with mock data if AsyncStorage is empty
      accounts: MOCK_ACCOUNTS,
      transactions: MOCK_TRANSACTIONS,
      subscriptions: MOCK_SUBSCRIPTIONS,
      categories: MOCK_CATEGORIES,
      budgetGoals: MOCK_BUDGET_GOALS,
      savingsGoals: MOCK_SAVINGS_GOALS,
      currency: DEFAULT_CURRENCY,
      region: DEFAULT_REGION,
      lastDeletedAccount: null,
      lastDeletedTransaction: null,
      lastDeletedSubscription: null,
      biometricLockEnabled: false,

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id: `a${Date.now()}`,
              createdAt: account.createdAt || new Date().toISOString(),
            },
          ],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...updates } : acc
          ),
        })),

      deleteAccount: (id) =>
        set((state) => {
          const accToDelete = state.accounts.find((a) => a.id === id) || null;
          return {
            lastDeletedAccount: accToDelete,
            accounts: state.accounts.filter((acc) => acc.id !== id),
            transactions: state.transactions.filter((tx) => tx.accountId !== id && tx.destinationAccountId !== id),
            subscriptions: state.subscriptions.filter((sub) => sub.accountId !== id),
          };
        }),

      restoreAccount: (account) =>
        set((state) => {
          const exists = state.accounts.some((a) => a.id === account.id);
          if (exists) return state;
          return {
            accounts: [account, ...state.accounts],
          };
        }),

      restoreLastDeletedAccount: () =>
        set((state) => {
          if (!state.lastDeletedAccount) return state;
          const exists = state.accounts.some(
            (a) => a.id === state.lastDeletedAccount!.id
          );
          if (exists) {
            return { lastDeletedAccount: null };
          }
          return {
            accounts: [state.lastDeletedAccount, ...state.accounts],
            lastDeletedAccount: null,
          };
        }),

      clearLastDeletedAccount: () =>
        set({ lastDeletedAccount: null }),


      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: `t${Date.now()}`,
          };

          // Update the balance of the associated account
          const updatedAccounts = state.accounts.map((acc) => {
            let balance = acc.balance;

            // Handle from account (expense, savings, or transfer sender)
            if (acc.id === transaction.accountId) {
              if (
                transaction.type === 'expense' ||
                transaction.type === 'transfer' ||
                transaction.type === 'savings'
              ) {
                balance -= transaction.amount;
              } else if (transaction.type === 'income') {
                balance += transaction.amount;
              }
            }

            // Handle to account (transfer recipient)
            if (transaction.type === 'transfer' && transaction.destinationAccountId && acc.id === transaction.destinationAccountId) {
              balance += transaction.amount;
            }

            return { ...acc, balance };
          });

          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
          };
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const oldTx = state.transactions.find((t) => t.id === id);
          if (!oldTx) return state;

          const updatedTx = { ...oldTx, ...updates };

          let updatedAccounts = [...state.accounts];

          // 1. Reverse oldTx
          updatedAccounts = updatedAccounts.map((acc) => {
            let balance = acc.balance;
            if (acc.id === oldTx.accountId) {
              if (oldTx.type === 'expense' || oldTx.type === 'transfer' || oldTx.type === 'savings') balance += oldTx.amount;
              else if (oldTx.type === 'income') balance -= oldTx.amount;
            }
            if (oldTx.type === 'transfer' && oldTx.destinationAccountId && acc.id === oldTx.destinationAccountId) {
              balance -= oldTx.amount;
            }
            return { ...acc, balance };
          });

          // 2. Apply updatedTx
          updatedAccounts = updatedAccounts.map((acc) => {
            let balance = acc.balance;
            if (acc.id === updatedTx.accountId) {
              if (updatedTx.type === 'expense' || updatedTx.type === 'transfer' || updatedTx.type === 'savings') balance -= updatedTx.amount;
              else if (updatedTx.type === 'income') balance += updatedTx.amount;
            }
            if (updatedTx.type === 'transfer' && updatedTx.destinationAccountId && acc.id === updatedTx.destinationAccountId) {
              balance += updatedTx.amount;
            }
            return { ...acc, balance };
          });

          return {
            transactions: state.transactions.map((t) => (t.id === id ? updatedTx : t)),
            accounts: updatedAccounts,
          };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const txToDelete = state.transactions.find((t) => t.id === id);
          if (!txToDelete) return state;

          let updatedAccounts = state.accounts.map((acc) => {
            let balance = acc.balance;
            if (acc.id === txToDelete.accountId) {
              if (txToDelete.type === 'expense' || txToDelete.type === 'transfer' || txToDelete.type === 'savings') balance += txToDelete.amount;
              else if (txToDelete.type === 'income') balance -= txToDelete.amount;
            }
            if (txToDelete.type === 'transfer' && txToDelete.destinationAccountId && acc.id === txToDelete.destinationAccountId) {
              balance -= txToDelete.amount;
            }
            return { ...acc, balance };
          });

          return {
            lastDeletedTransaction: txToDelete,
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
          };
        }),

      restoreTransaction: (transaction) =>
        set((state) => {
          const exists = state.transactions.some((t) => t.id === transaction.id);
          if (exists) return state;

          let updatedAccounts = state.accounts.map((acc) => {
            let balance = acc.balance;
            if (acc.id === transaction.accountId) {
              if (transaction.type === 'expense' || transaction.type === 'transfer' || transaction.type === 'savings') balance -= transaction.amount;
              else if (transaction.type === 'income') balance += transaction.amount;
            }
            if (transaction.type === 'transfer' && transaction.destinationAccountId && acc.id === transaction.destinationAccountId) {
              balance += transaction.amount;
            }
            return { ...acc, balance };
          });

          return {
            transactions: [transaction, ...state.transactions],
            accounts: updatedAccounts,
          };
        }),

      restoreLastDeletedTransaction: () =>
        set((state) => {
          if (!state.lastDeletedTransaction) return state;
          const exists = state.transactions.some((t) => t.id === state.lastDeletedTransaction!.id);
          if (exists) return { lastDeletedTransaction: null };

          const tx = state.lastDeletedTransaction;
          let updatedAccounts = state.accounts.map((acc) => {
            let balance = acc.balance;
            if (acc.id === tx.accountId) {
              if (tx.type === 'expense' || tx.type === 'transfer' || tx.type === 'savings') balance -= tx.amount;
              else if (tx.type === 'income') balance += tx.amount;
            }
            if (tx.type === 'transfer' && tx.destinationAccountId && acc.id === tx.destinationAccountId) {
              balance += tx.amount;
            }
            return { ...acc, balance };
          });

          return {
            transactions: [tx, ...state.transactions],
            accounts: updatedAccounts,
            lastDeletedTransaction: null,
          };
        }),

      clearLastDeletedTransaction: () =>
        set({ lastDeletedTransaction: null }),

      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [
            ...state.subscriptions,
            { ...subscription, id: `s${Date.now()}` },
          ],
        })),

      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        })),

      deleteSubscription: (id) =>
        set((state) => {
          const subToDelete = state.subscriptions.find((s) => s.id === id) || null;
          return {
            lastDeletedSubscription: subToDelete,
            subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
          };
        }),

      restoreSubscription: (subscription) =>
        set((state) => {
          const exists = state.subscriptions.some((s) => s.id === subscription.id);
          if (exists) return state;
          return {
            subscriptions: [subscription, ...state.subscriptions],
          };
        }),

      restoreLastDeletedSubscription: () =>
        set((state) => {
          if (!state.lastDeletedSubscription) return state;
          const exists = state.subscriptions.some(
            (s) => s.id === state.lastDeletedSubscription!.id
          );
          if (exists) {
            return { lastDeletedSubscription: null };
          }
          return {
            subscriptions: [state.lastDeletedSubscription, ...state.subscriptions],
            lastDeletedSubscription: null,
          };
        }),

      clearLastDeletedSubscription: () =>
        set({ lastDeletedSubscription: null }),

      toggleSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, active: !sub.active } : sub
          ),
        })),
        
      paySubscription: (id) => 
        set((state) => {
          const sub = state.subscriptions.find(s => s.id === id);
          if (!sub || !sub.accountId || !sub.active) return state;

          const newTransaction: Transaction = {
            id: `t${Date.now()}`,
            type: 'expense',
            amount: sub.amount,
            payee: sub.name,
            date: new Date().toISOString(),
            accountId: sub.accountId,
            categoryId: sub.categoryId,
            note: `Auto-paid subscription: ${sub.name}`,
          };

          const updatedAccounts = state.accounts.map((acc) => 
            acc.id === sub.accountId ? { ...acc, balance: acc.balance - sub.amount } : acc
          );

          let nextDate = new Date(sub.nextChargeDate);
          if (sub.billingCycle === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (sub.billingCycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else if (sub.billingCycle === 'weekly') nextDate.setDate(nextDate.getDate() + 7);

          const updatedSubscriptions = state.subscriptions.map(s => 
            s.id === id ? { ...s, nextChargeDate: nextDate.toISOString() } : s
          );

          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
            subscriptions: updatedSubscriptions
          };
        }),

      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: `c${Date.now()}` },
          ],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          budgetGoals: state.budgetGoals.filter((bg) => bg.categoryId !== id),
          transactions: state.transactions.map((tx) =>
            tx.categoryId === id ? { ...tx, categoryId: undefined } : tx
          ),
        })),

      setBudgetGoal: (goal) =>
        set((state) => {
          const exists = state.budgetGoals.find(bg => bg.categoryId === goal.categoryId);
          if (exists) {
            return {
              budgetGoals: state.budgetGoals.map(bg =>
                bg.categoryId === goal.categoryId ? { ...bg, monthlyLimit: goal.monthlyLimit } : bg
              )
            };
          }
          return {
            budgetGoals: [...state.budgetGoals, { ...goal, id: `bg${Date.now()}` } as BudgetGoal]
          };
        }),

      deleteBudgetGoal: (idOrCategoryId) =>
        set((state) => ({
          budgetGoals: state.budgetGoals.filter(
            (bg) => bg.id !== idOrCategoryId && bg.categoryId !== idOrCategoryId
          ),
        })),

      addSavingsGoal: (goal) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, { ...goal, id: `sg${Date.now()}` }],
        })),

      updateSavingsGoal: (id, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((sg) =>
            sg.id === id ? { ...sg, ...updates } : sg
          ),
        })),

      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((sg) => sg.id !== id),
        })),

      contributeToSavingsGoal: (goalId, accountId, amount) => {
        let success = false;
        set((state) => {
          const goal = state.savingsGoals.find((g) => g.id === goalId);
          const account = state.accounts.find((a) => a.id === accountId);
          if (!goal || !account || amount <= 0 || account.balance < amount) {
            return state;
          }

          success = true;
          const updatedAccounts = state.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc
          );

          const updatedSavingsGoals = state.savingsGoals.map((sg) =>
            sg.id === goalId ? { ...sg, currentAmount: sg.currentAmount + amount } : sg
          );

          const newTransaction: Transaction = {
            id: `t${Date.now()}`,
            type: 'savings',
            amount: amount,
            payee: `Contributed to ${goal.name}`,
            date: new Date().toISOString(),
            accountId: accountId,
            savingsGoalId: goalId,
            note: `Savings Goal: ${goal.name}`,
          };

          return {
            accounts: updatedAccounts,
            savingsGoals: updatedSavingsGoals,
            transactions: [newTransaction, ...state.transactions],
          };
        });
        return success;
      },

      setCurrency: (currency) => set({ currency }),
      setRegion: (region) => set({ region, currency: region.defaultCurrency }),
      setRegionAndCurrency: (region, currency) => set({ region, currency }),
      setBiometricLockEnabled: (enabled) => set({ biometricLockEnabled: enabled }),

      reset: () =>
        set((state) => ({
          accounts: [],
          transactions: [],
          subscriptions: [],
          categories: MOCK_CATEGORIES,
          budgetGoals: [],
          savingsGoals: [],
          currency: state.currency,
          region: state.region,
          biometricLockEnabled: state.biometricLockEnabled,
        })),

      resetToDemo: () =>
        set((state) => ({
          accounts: MOCK_ACCOUNTS,
          transactions: MOCK_TRANSACTIONS,
          subscriptions: MOCK_SUBSCRIPTIONS,
          categories: MOCK_CATEGORIES,
          budgetGoals: MOCK_BUDGET_GOALS,
          savingsGoals: MOCK_SAVINGS_GOALS,
          currency: state.currency,
          region: state.region,
          biometricLockEnabled: state.biometricLockEnabled,
        })),

      restoreSnapshot: (snapshot) =>
        set({
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          subscriptions: snapshot.subscriptions,
          categories: snapshot.categories,
          budgetGoals: snapshot.budgetGoals,
          savingsGoals: snapshot.savingsGoals,
        }),
    }),
    {
      name: 'stackly-storage', // unique name
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState) {
          return {
            ...persistedState,
            categories: MOCK_CATEGORIES,
          };
        }
        return persistedState;
      },
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
