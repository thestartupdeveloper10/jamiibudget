import { create } from 'zustand';

// Types for our database structure
export type TransactionData = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
};

// Type for category totals
export type CategoryTotals = {
  [key: string]: {
    amount: number;
    count: number;
    percentage?: number;
  };
};

// Define the store type
type TransactionStore = {
  expenses: TransactionData[];
  income: TransactionData[];
  lastFetched: number | null;
  setTransactions: (expenses: TransactionData[], income: TransactionData[]) => void;
  invalidateCache: () => void;
  shouldRefresh: boolean;
  setShouldRefresh: (value: boolean) => void;
};

// Create the store
export const useTransactionStore = create<TransactionStore>((set) => ({
  expenses: [],
  income: [],
  lastFetched: null,
  setTransactions: (expenses, income) => 
    set({ expenses, income, lastFetched: Date.now() }),
  invalidateCache: () => set({ lastFetched: null }),
  shouldRefresh: false,
  setShouldRefresh: (value) => set({ shouldRefresh: value }),
})); 