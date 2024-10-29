import { Client, Databases, Account } from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("671f626b0013b255de95")
  .setPlatform('jamiibudget');

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = "67208f64001c3ab4575d";
export const EXPENSES_COLLECTION_ID = "672092dd000749abf77d";
export const INCOME_COLLECTION_ID = "672092eb00359460683e";

// Collection attribute names - using constants to avoid typos
export const ATTRIBUTE_NAMES = {
  USER_ID: "userId",
  AMOUNT: "amount",
  CATEGORY: "category",
  DESCRIPTION: "description",
  DATE: "date",
  CREATED_AT: "createdAt"
}