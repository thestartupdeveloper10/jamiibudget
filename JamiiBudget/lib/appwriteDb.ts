import { ID, Query } from "react-native-appwrite";
import { 
  databases, 
  DATABASE_ID, 
  EXPENSES_COLLECTION_ID, 
  INCOME_COLLECTION_ID,
  ATTRIBUTE_NAMES 
} from "./appwrite";

// Types remain the same...
export type ExpenseCategory = 
  | "food"
  | "shopping"
  | "transport"
  | "bills"
  | "entertainment"
  | "education"
  | "other";

export type IncomeCategory = 
  | "salary"
  | "freelance"
  | "investment"
  | "business"
  | "other";

export interface Transaction {
  $id?: string;
  [ATTRIBUTE_NAMES.USER_ID]: string;
  [ATTRIBUTE_NAMES.AMOUNT]: number;
  [ATTRIBUTE_NAMES.CATEGORY]: string;
  [ATTRIBUTE_NAMES.DESCRIPTION]: string;
  [ATTRIBUTE_NAMES.DATE]: string;
  [ATTRIBUTE_NAMES.CREATED_AT]?: string;
}

const formatTransactionData = (data: Omit<Transaction, "$id" | "createdAt">) => ({
  [ATTRIBUTE_NAMES.USER_ID]: data.userId,
  [ATTRIBUTE_NAMES.AMOUNT]: data.amount,
  [ATTRIBUTE_NAMES.CATEGORY]: data.category,
  [ATTRIBUTE_NAMES.DESCRIPTION]: data.description,
  [ATTRIBUTE_NAMES.DATE]: data.date,
  [ATTRIBUTE_NAMES.CREATED_AT]: new Date().toISOString(),
});

// Helper function to validate userId
const validateUserId = (userId: string | undefined): string => {
  if (!userId) {
    throw new Error('User must be logged in to perform this action');
  }
  return userId;
};

export const ExpenseDB = {
  async create(expense: Omit<Transaction, "$id" | "createdAt">): Promise<Transaction> {
    try {
      validateUserId(expense.userId);
      const response = await databases.createDocument(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        ID.unique(),
        formatTransactionData(expense)
      );
      return response as Transaction;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  async listByUser(userId?: string): Promise<Transaction[]> {
    try {
      if (!userId) {
        return []; // Return empty array when user is not logged in
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        [
          Query.equal(ATTRIBUTE_NAMES.USER_ID, userId),
          Query.orderDesc(ATTRIBUTE_NAMES.DATE),
        ]
      );
      return response.documents as Transaction[];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      if (error instanceof Error && error.message.includes('Equal queries require')) {
        return []; // Return empty array for invalid query
      }
      throw error;
    }
  },

  async getByDateRange(
    userId?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<Transaction[]> {
    try {
      if (!userId) {
        return []; // Return empty array when user is not logged in
      }

      const queries = [Query.equal(ATTRIBUTE_NAMES.USER_ID, userId)];
      
      if (startDate) {
        queries.push(Query.greaterThanEqual(ATTRIBUTE_NAMES.DATE, startDate));
      }
      
      if (endDate) {
        queries.push(Query.lessThanEqual(ATTRIBUTE_NAMES.DATE, endDate));
      }

      queries.push(Query.orderDesc(ATTRIBUTE_NAMES.DATE));

      const response = await databases.listDocuments(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        queries
      );
      return response.documents as Transaction[];
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      if (error instanceof Error && error.message.includes('Equal queries require')) {
        return []; // Return empty array for invalid query
      }
      throw error;
    }
  },

  async update(expenseId: string, expense: Partial<Transaction>): Promise<Transaction> {
    try {
      if (expense.userId) {
        validateUserId(expense.userId);
      }
      const response = await databases.updateDocument(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        expenseId,
        expense
      );
      return response as Transaction;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  async delete(expenseId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        expenseId
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  }
};

export const IncomeDB = {
  async create(income: Omit<Transaction, "$id" | "createdAt">): Promise<Transaction> {
    try {
      validateUserId(income.userId);
      const response = await databases.createDocument(
        DATABASE_ID,
        INCOME_COLLECTION_ID,
        ID.unique(),
        formatTransactionData(income)
      );
      return response as Transaction;
    } catch (error) {
      console.error("Error creating income:", error);
      throw error;
    }
  },

  async listByUser(userId?: string): Promise<Transaction[]> {
    try {
      if (!userId) {
        return []; // Return empty array when user is not logged in
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        INCOME_COLLECTION_ID,
        [
          Query.equal(ATTRIBUTE_NAMES.USER_ID, userId),
          Query.orderDesc(ATTRIBUTE_NAMES.DATE),
        ]
      );
      return response.documents as Transaction[];
    } catch (error) {
      console.error("Error fetching income:", error);
      if (error instanceof Error && error.message.includes('Equal queries require')) {
        return []; // Return empty array for invalid query
      }
      throw error;
    }
  },

  async getByDateRange(
    userId?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<Transaction[]> {
    try {
      if (!userId) {
        return []; // Return empty array when user is not logged in
      }

      const queries = [Query.equal(ATTRIBUTE_NAMES.USER_ID, userId)];
      
      if (startDate) {
        queries.push(Query.greaterThanEqual(ATTRIBUTE_NAMES.DATE, startDate));
      }
      
      if (endDate) {
        queries.push(Query.lessThanEqual(ATTRIBUTE_NAMES.DATE, endDate));
      }

      queries.push(Query.orderDesc(ATTRIBUTE_NAMES.DATE));

      const response = await databases.listDocuments(
        DATABASE_ID,
        INCOME_COLLECTION_ID,
        queries
      );
      return response.documents as Transaction[];
    } catch (error) {
      console.error("Error fetching income by date range:", error);
      if (error instanceof Error && error.message.includes('Equal queries require')) {
        return []; // Return empty array for invalid query
      }
      throw error;
    }
  },

  async update(incomeId: string, income: Partial<Transaction>): Promise<Transaction> {
    try {
      if (income.userId) {
        validateUserId(income.userId);
      }
      const response = await databases.updateDocument(
        DATABASE_ID,
        INCOME_COLLECTION_ID,
        incomeId,
        income
      );
      return response as Transaction;
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },

  async delete(incomeId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        INCOME_COLLECTION_ID,
        incomeId
      );
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  }
};