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
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  toggleSubscription: (id: string) => void;
  postSubscription: (id: string, accountId: string) => void;
  checkAndAutoPostDueSubscriptions: () => void;

  setBudgetGoal: (goal: Omit<BudgetGoal, 'id'> | BudgetGoal) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  addSavingsContribution: (id: string, amount: number) => void;

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

      toggleSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, active: !sub.active } : sub
          ),
        })),

      postSubscription: (id, accountId) =>
        set((state) => {
          const subscription = state.subscriptions.find(s => s.id === id);
          if (!subscription) return state;

          const newTransaction: Transaction = {
            id: `t${Date.now()}`,
            type: 'expense',
            amount: subscription.amount,
            payee: subscription.name,
            categoryId: subscription.categoryId,
            date: new Date().toISOString(),
            accountId: accountId,
          };

          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === accountId) {
              return { ...acc, balance: acc.balance - subscription.amount };
            }
            return acc;
          });

          const nextDate = new Date(subscription.nextChargeDate);
          if (subscription.billingCycle === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }

          const updatedSubscriptions = state.subscriptions.map(s => 
            s.id === id ? { ...s, nextChargeDate: nextDate.toISOString() } : s
          );

          return {
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
            subscriptions: updatedSubscriptions,
          };
        }),

      checkAndAutoPostDueSubscriptions: () =>
        set((state) => {
          if (state.accounts.length === 0) return state;
          const now = new Date().getTime();
          const dueSubs = state.subscriptions.filter(
            (sub) => sub.active && new Date(sub.nextChargeDate).getTime() <= now
          );

          if (dueSubs.length === 0) return state;

          const defaultAccountId = state.accounts[0].id;
          const newTransactions: Transaction[] = [];
          let updatedAccounts = [...state.accounts];
          const updatedSubscriptions = [...state.subscriptions];

          dueSubs.forEach((sub, idx) => {
            newTransactions.push({
              id: `t${Date.now() + idx}`,
              type: 'expense',
              amount: sub.amount,
              payee: sub.name,
              categoryId: sub.categoryId,
              date: new Date().toISOString(),
              accountId: defaultAccountId,
            });

            updatedAccounts = updatedAccounts.map((acc) =>
              acc.id === defaultAccountId
                ? { ...acc, balance: acc.balance - sub.amount }
                : acc
            );

            const nextDate = new Date(sub.nextChargeDate);
            if (sub.billingCycle === 'monthly') {
              nextDate.setMonth(nextDate.getMonth() + 1);
            } else {
              nextDate.setFullYear(nextDate.getFullYear() + 1);
            }

            const subIdx = updatedSubscriptions.findIndex((s) => s.id === sub.id);
            if (subIdx !== -1) {
              updatedSubscriptions[subIdx] = {
                ...updatedSubscriptions[subIdx],
                nextChargeDate: nextDate.toISOString(),
              };
            }
          });

          return {
            transactions: [...newTransactions, ...state.transactions],
            accounts: updatedAccounts,
            subscriptions: updatedSubscriptions,
          };
        }),

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

      addSavingsGoal: (goal) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, { ...goal, id: `sg${Date.now()}` }]
        })),

      addSavingsContribution: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map(sg =>
            sg.id === id ? { ...sg, currentAmount: sg.currentAmount + amount } : sg
          )
        })),

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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
