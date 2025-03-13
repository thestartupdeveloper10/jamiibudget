import { Client, Databases, Account } from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
  .setPlatform('jamiibudget');

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
export const EXPENSES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID;
export const INCOME_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_INCOME_COLLECTION_ID;

// Collection attribute names - using constants to avoid typos
export const ATTRIBUTE_NAMES = {
  USER_ID: "userId",
  AMOUNT: "amount",
  CATEGORY: "category",
  DESCRIPTION: "description",
  DATE: "date",
  CREATED_AT: "createdAt"
}

export default client;