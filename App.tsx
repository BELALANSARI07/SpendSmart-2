import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Insights from './components/Insights';
import Coach from './components/Coach';
import Login from './components/Login';
import ConfirmationModal from './components/ConfirmationModal';
import type { Page, UserData } from './types';
import { getDeepFinancialAnalysis } from './services/geminiService';
import { loadUserData, saveUserData } from './services/dataService';

const DeepAnalysisModal: React.FC<{ onClose: () => void; analysis: string; isLoading: boolean }> = ({ onClose, analysis, isLoading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Deep Financial Analysis</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto pr-2">
                {isLoading && (
                    <div className="text-center py-10">
                        <p className="text-lg">AI is performing a deep analysis of your financial data...</p>
                        <p className="text-sm text-gray-400 mt-2">This may take a moment.</p>
                    </div>
                )}
                {analysis && (
                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white">
                         <p className="whitespace-pre-wrap">{analysis}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [deepAnalysisResult, setDeepAnalysisResult] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  useEffect(() => {
    const loggedInEmail = localStorage.getItem('spendsmart-user');
    if (loggedInEmail) {
      setCurrentUserEmail(loggedInEmail);
      setUserData(loadUserData(loggedInEmail));
    }
  }, []);

  const handleLogin = useCallback((email: string) => {
    const lowerCaseEmail = email.toLowerCase().trim();
    localStorage.setItem('spendsmart-user', lowerCaseEmail);
    setCurrentUserEmail(lowerCaseEmail);
    setUserData(loadUserData(lowerCaseEmail));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('spendsmart-user');
    setCurrentUserEmail(null);
    setUserData(null);
  }, []);

  const updateUserData = (newUserData: UserData) => {
    // Recalculate budget spent amounts based on transactions for consistency
    const updatedBudgets = newUserData.budgetCategories.map(cat => {
        const spent = newUserData.transactions
            .filter(t => t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...cat, spent };
    });

    const finalUserData = { ...newUserData, budgetCategories: updatedBudgets };

    setUserData(finalUserData);
    saveUserData(finalUserData.email, finalUserData);
  };
  
  const handleDeepDive = useCallback(async () => {
    if (!userData) return;

    setShowDeepAnalysis(true);
    setIsAnalysisLoading(true);
    setDeepAnalysisResult('');
    
    // Use a subset of real user data for analysis to keep it concise
    const analysisData = JSON.stringify({
        monthlyIncome: userData.monthlyIncome,
        transactions: userData.transactions.slice(0, 20), // up to 20 most recent transactions
        budgets: userData.budgetCategories,
        goals: userData.goals,
    }, null, 2);
    
    const result = await getDeepFinancialAnalysis(analysisData);
    setDeepAnalysisResult(result);
    setIsAnalysisLoading(false);
  }, [userData]);

  const closeConfirmation = () => {
    setConfirmationModal({ ...confirmationModal, isOpen: false });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
      setConfirmationModal({ isOpen: true, title, message, onConfirm });
  };

  const handleDeleteTransaction = (id: string) => {
      showConfirmation(
          'Delete Transaction?',
          'Are you sure you want to permanently delete this transaction?',
          () => {
              if (!userData) return;
              const updatedTransactions = userData.transactions.filter(t => t.id !== id);
              updateUserData({ ...userData, transactions: updatedTransactions });
          }
      );
  };

  const handleDeleteCategory = (id: string) => {
      if (!userData) return;
      const categoryToDelete = userData.budgetCategories.find(c => c.id === id);
      if (!categoryToDelete) return;

      showConfirmation(
          'Delete Budget Category?',
          `This will delete the "${categoryToDelete.name}" category and re-assign its transactions to "Uncategorized". This action cannot be undone.`,
          () => {
              const updatedCategories = userData.budgetCategories.filter(c => c.id !== id);
              const updatedTransactions = userData.transactions.map(t => 
                  t.category === categoryToDelete.name 
                  ? { ...t, category: 'Uncategorized' } 
                  : t
              );
              updateUserData({ 
                  ...userData, 
                  budgetCategories: updatedCategories, 
                  transactions: updatedTransactions 
              });
          }
      );
  };

  const handleDeleteGoal = (id: string) => {
      showConfirmation(
          'Delete Savings Goal?',
          'Are you sure you want to delete this savings goal?',
          () => {
              if (!userData) return;
              const updatedGoals = userData.goals.filter(g => g.id !== id);
              updateUserData({ ...userData, goals: updatedGoals });
          }
      );
  };


  const renderPage = () => {
    if (!userData) {
      // This should ideally not be shown as the main app is not rendered, but as a safeguard.
      return <div className="flex items-center justify-center h-full"><p>Loading user data...</p></div>;
    }
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userData={userData} onDeepDive={handleDeepDive} onUserDataChange={updateUserData} />;
      case 'expenses':
        return <Expenses userData={userData} onUserDataChange={updateUserData} onDeleteTransaction={handleDeleteTransaction} />;
      case 'budget':
        return <Budget userData={userData} onUserDataChange={updateUserData} onDeleteCategory={handleDeleteCategory} />;
      case 'goals':
        return <Goals userData={userData} onUserDataChange={updateUserData} onDeleteGoal={handleDeleteGoal} />;
      case 'insights':
        return <Insights />;
      case 'coach':
        return <Coach />;
      default:
        return <Dashboard userData={userData} onDeepDive={handleDeepDive} onUserDataChange={updateUserData} />;
    }
  };

  if (!currentUserEmail) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen font-sans bg-gray-900">
      <div className="hidden md:flex">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          userEmail={currentUserEmail}
          onLogout={handleLogout}
        />
      </div>
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      {showDeepAnalysis && (
        <DeepAnalysisModal 
          onClose={() => setShowDeepAnalysis(false)} 
          analysis={deepAnalysisResult}
          isLoading={isAnalysisLoading}
        />
      )}
      <ConfirmationModal 
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
    </div>
  );
};

export default App;