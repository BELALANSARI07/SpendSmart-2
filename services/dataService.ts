import type { UserData } from '../types';

// Provides a default set of data for a new user to demonstrate features.
const getInitialUserData = (email: string): UserData => ({
  email,
  monthlyIncome: 5000,
  transactions: [
    { id: '1', date: '2024-07-20', description: 'Grocery Store', amount: 75.42, category: 'Groceries' },
    { id: '2', date: '2024-07-20', description: 'Electric Bill', amount: 120.00, category: 'Utilities' },
    { id: '3', date: '2024-07-19', description: 'Gas Station', amount: 45.30, category: 'Transport' },
    { id: '4', date: '2024-07-18', description: 'Restaurant', amount: 55.00, category: 'Food' },
  ],
  budgetCategories: [
    { id: '1', name: 'Groceries', allocated: 800, spent: 75.42 },
    { id: '2', name: 'Utilities', allocated: 400, spent: 120.00 },
    { id: '3', name: 'Transport', allocated: 200, spent: 45.30 },
    { id: '4', name: 'Entertainment', allocated: 200, spent: 0 },
    { id: '5', name: 'Food', allocated: 300, spent: 55.00 },
  ],
  goals: [
    { id: '1', name: 'Vacation Fund', targetAmount: 2000, currentAmount: 1250 },
    { id: '2', name: 'New Laptop', targetAmount: 1500, currentAmount: 500 },
    { id: '3', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 4800 },
  ],
});

/**
 * Loads user data from localStorage.
 * If no data is found for the given email, returns initial default data.
 * @param email The user's email address.
 * @returns The user's data.
 */
export const loadUserData = (email: string): UserData => {
  try {
    const rawData = localStorage.getItem(`spendsmart-data-${email}`);
    if (rawData) {
      const parsedData = JSON.parse(rawData);
      // Basic validation to ensure the loaded data has the expected structure
      if (parsedData.email && parsedData.transactions && parsedData.budgetCategories && parsedData.goals) {
        // Add monthlyIncome with a fallback for backward compatibility
        parsedData.monthlyIncome = parsedData.monthlyIncome ?? 5000;
        return parsedData as UserData;
      }
    }
  } catch (error) {
    console.error("Failed to load or parse user data from localStorage", error);
  }
  // Return initial data if loading fails or data is invalid
  return getInitialUserData(email);
};

/**
 * Saves user data to localStorage.
 * @param email The user's email address.
 * @param data The user's data object to save.
 */
export const saveUserData = (email: string, data: UserData): void => {
  try {
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(`spendsmart-data-${email}`, stringifiedData);
  } catch (error) {
    console.error("Failed to save user data to localStorage", error);
  }
};