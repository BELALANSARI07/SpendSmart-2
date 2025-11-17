export type Page = 'dashboard' | 'expenses' | 'budget' | 'goals' | 'insights' | 'coach';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface UserData {
    email: string;
    monthlyIncome: number;
    transactions: Transaction[];
    budgetCategories: BudgetCategory[];
    goals: Goal[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}