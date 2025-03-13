import { ID } from "react-native-appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { toast } from "../lib/toast";
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add storage keys
const STORAGE_KEYS = {
  USER: '@user_data',
  SESSION_EXPIRY: '@session_expiry',
};

// Add session duration (e.g., 7 days)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

type User = {
  $id: string;
  email: string;
  // Add other user properties as needed
};

export type UserContextType = {
  current: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  toast: (message: string) => void;
};

export const UserContext = createContext<UserContextType>({
  current: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updatePassword: async () => {},
  toast: () => {},
});

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
          if (existingUser.email === email) {
            setUser(existingUser);
            await Promise.all([
              AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(existingUser)),
              AsyncStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, (Date.now() + SESSION_DURATION).toString())
            ]);
            toast('Already logged in');
            return;
          }
          await logout();
        }
      } catch (error) {
        // No existing session or session expired, continue with login
        console.log('No existing session, proceeding with login');
      }

      // Create new session
      await account.createEmailPasswordSession(email, password);
      
      // Get user details after successful session creation
      try {
        const loggedInUser = await account.get();
        setUser(loggedInUser);
        
        // Store user data and session expiry
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser)),
          AsyncStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, (Date.now() + SESSION_DURATION).toString())
        ]);
        
        toast('Welcome back! You are logged in');
      } catch (error) {
        console.error('Error getting user details:', error);
        throw new Error('Failed to get user details after login');
      }
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
      // Clear stored data
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY)
      ]);
      toast('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast('Failed to log out. Please try again.');
      throw error;
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      // Check for existing session before registration
      try {
        await account.deleteSession("current");
      } catch (error) {
        // No session to delete, continue
      }

      await account.create(ID.unique(), email, password, name);
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
      // Check for stored user data and session expiry
      const [storedUser, storedExpiry] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY)
      ]);

      if (storedUser && storedExpiry) {
        const expiryTime = parseInt(storedExpiry);
        
        // Check if session is still valid
        if (Date.now() < expiryTime) {
          try {
            // Verify the session with Appwrite
            const currentUser = await account.get();
            setUser(currentUser);
            return;
          } catch (error) {
            console.log('Session expired on Appwrite side, clearing local storage');
            // Session expired on Appwrite side, clear local storage
            await Promise.all([
              AsyncStorage.removeItem(STORAGE_KEYS.USER),
              AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY)
            ]);
            setUser(null);
          }
        } else {
          // Local session expired, clear storage
          await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEYS.USER),
            AsyncStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY)
          ]);
          setUser(null);
        }
      }

      // Try to get current session if exists
      try {
        const currentUser = await account.get();
        if (currentUser) {
          setUser(currentUser);
          // Store new session data
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser)),
            AsyncStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, (Date.now() + SESSION_DURATION).toString())
          ]);
        }
      } catch (error) {
        console.log('No active session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setUser(null);
    }
  }

  useEffect(() => {
    init();
  }, []);

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Use the existing account instance instead of creating a new one
      await account.updatePassword(newPassword, currentPassword);
      
      // Show success message
      Alert.alert('Success', 'Password updated successfully');
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 401) {
        throw new Error('Current password is incorrect');
      } else {
        throw new Error('Failed to update password. Please try again.');
      }
    }
  };

  const value = {
    current: user,
    login,
    logout,
    register,
    updatePassword,
    toast,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}