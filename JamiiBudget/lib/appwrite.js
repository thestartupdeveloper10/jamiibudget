import { Client, Databases, Account } from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("671f626b0013b255de95") // Replace with your project ID
  .setPlatform('jamiibudget');


export const account = new Account(client);
export const databases = new Databases(client);
