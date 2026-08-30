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

  addAccount: (account: Omit<Account, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  lastDeletedSubscription: Subscription | null;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id'>>) => void;
  deleteSubscription: (id: string) => void;
  restoreSubscription: (subscription: Subscription) => void;
  restoreLastDeletedSubscription: () => void;
  clearLastDeletedSubscription: () => void;
  toggleSubscription: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;

  setBudgetGoal: (goal: Omit<BudgetGoal, 'id'> | BudgetGoal) => void;
  deleteBudgetGoal: (idOrCategoryId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<Omit<SavingsGoal, 'id'>>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsContribution: (id: string, amount: number) => void;
  contributeToSavingsGoal: (goalId: string, accountId: string, amount: number) => boolean;

  setCurrency: (currency: Currency) => void;
  setRegion: (region: Region) => void;
  setRegionAndCurrency: (region: Region, currency: Currency) => void;

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
      lastDeletedSubscription: null,

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
            let balance = acc.balance;

            // Handle from account (expense or transfer sender)
            if (acc.id === transaction.accountId) {
              if (transaction.type === 'expense' || transaction.type === 'transfer') {
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

      addSavingsContribution: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((sg) =>
            sg.id === id ? { ...sg, currentAmount: sg.currentAmount + amount } : sg
          ),
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
