/**
 * Runtime types are not required in JavaScript. This file provides JSDoc typedefs
 * to help editors with intellisense if needed.
 */

/**
 * @typedef {'dashboard'|'expenses'|'budget'|'goals'|'insights'|'coach'} Page
 */

/**
 * @typedef {{ id: string, date: string, description: string, amount: number, category: string }} Transaction
 */

/**
 * @typedef {{ id: string, name: string, allocated: number, spent: number }} BudgetCategory
 */

/**
 * @typedef {{ id: string, name: string, targetAmount: number, currentAmount: number }} Goal
 */

/**
 * @typedef {{ email: string, monthlyIncome: number, transactions: Transaction[], budgetCategories: BudgetCategory[], goals: Goal[] }} UserData
 */

/**
 * @typedef {{ role: 'user'|'model', text: string }} ChatMessage
 */

/**
 * @typedef {{ web?: { uri: string, title?: string } }} GroundingChunk
 */

export default {};
