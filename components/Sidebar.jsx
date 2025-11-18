import React from 'react';
import DashboardIcon from './icons/DashboardIcon';
import ExpensesIcon from './icons/ExpensesIcon';
import BudgetIcon from './icons/BudgetIcon';
import GoalsIcon from './icons/GoalsIcon';
import InsightsIcon from './icons/InsightsIcon';
import CoachIcon from './icons/CoachIcon';
import SparklesIcon from './icons/SparklesIcon';
import LogoutIcon from './icons/LogoutIcon';

const navItems = [
  { page: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { page: 'expenses', label: 'Expenses', icon: ExpensesIcon },
  { page: 'budget', label: 'Budget', icon: BudgetIcon },
  { page: 'goals', label: 'Goals', icon: GoalsIcon },
  { page: 'insights', label: 'Insights', icon: InsightsIcon },
  { page: 'coach', label: 'AI Coach', icon: CoachIcon },
];

const Sidebar = ({ currentPage, setCurrentPage, userEmail, onLogout }) => {
  return (
    <aside className="bg-gray-900 text-gray-200 w-64 p-4 flex-shrink-0 border-r border-gray-700 flex flex-col h-full">
      <div className="flex items-center mb-8 shrink-0">
        <SparklesIcon className="w-8 h-8 text-primary-400 mr-2" />
        <h1 className="text-2xl font-bold text-white">SpendSmart AI</h1>
      </div>
      <nav className="flex-grow overflow-y-auto">
        <ul>
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`w-full text-left flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                  currentPage === item.page
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto shrink-0 border-t border-gray-700 pt-4">
         <div className="px-3 pb-2">
            <p className="text-sm font-medium text-white truncate" title={userEmail}>{userEmail}</p>
         </div>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-800"
        >
          <LogoutIcon className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
