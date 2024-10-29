import { ID } from "react-native-appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { toast } from "../lib/toast";

type User = {
  $id: string;
  email: string;
  // Add other user properties as needed
};

type UserContextType = {
  current: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string,username:string) => Promise<void>;
  toast: (message: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    try {
      // First, check if there's an existing session
      try {
        const existingUser = await account.get();
        if (existingUser) {
          // If the existing session is for the same user, just return
          if (existingUser.email === email) {
            setUser(existingUser);
            toast('Already logged in');
            return;
          }
          // If it's a different user, logout first
          await logout();
        }
      } catch (error) {
        // No existing session, continue with login
      }

      // Proceed with login
      const session = await account.createEmailPasswordSession(email, password);
      const loggedInUser = await account.get();
      setUser(loggedInUser);
      toast('Welcome back! You are logged in');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast(error.message || 'Failed to log in. Please check your credentials.');
      } else {
        toast('Failed to log in. Please check your credentials.');
      }
      throw error;
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast('Failed to log out. Please try again.');
      throw error;
    }
  }

  async function register(email: string, password: string,username: string) {
    try {
      // Check for existing session before registration
      try {
        await account.deleteSession("current");
      } catch (error) {
        // No session to delete, continue
      }

      await account.create(ID.unique(), email, password,username);
      await login(email, password);
      toast('Account successfully created');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast(error.message || 'Failed to create account. Please try again.');
      } else {
        toast('Failed to create account. Please try again.');
      }
      throw error;
    }
  }

  async function init() {
    try {
      const loggedInUser = await account.get();
      setUser(loggedInUser);
      // Don't show toast on initial load
    } catch (error) {
      console.error('Initialization error:', error);
      setUser(null);
    }
  }

  useEffect(() => {
    init();
  }, []);

  const value = {
    current: user,
    login,
    logout,
    register,
    toast,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}