import React, { useState, useEffect } from 'react';
import Card from './Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SparklesIcon from './icons/SparklesIcon';
import type { UserData } from '../types';
import EditIcon from './icons/EditIcon';

interface DashboardProps {
    userData: UserData;
    onDeepDive: () => void;
    onUserDataChange: (data: UserData) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#d946ef'];

const IncomeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentIncome: number;
    onSave: (newIncome: number) => void;
}> = ({ isOpen, onClose, currentIncome, onSave }) => {
    const [income, setIncome] = useState(currentIncome.toString());

    useEffect(() => {
        if(isOpen) {
            setIncome(currentIncome.toString());
        }
    }, [isOpen, currentIncome]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIncome = parseFloat(income);
        if (!isNaN(newIncome)) {
            onSave(newIncome);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Update Monthly Income</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Income Amount</label>
                        <input 
                            type="number" 
                            value={income} 
                            onChange={e => setIncome(e.target.value)} 
                            placeholder="5000" 
                            required 
                            step="0.01" 
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" 
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ userData, onDeepDive, onUserDataChange }) => {
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const totalIncome = userData.monthlyIncome;
    const totalExpenses = userData.transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalSavings = totalIncome - totalExpenses;

    const summaryData = [
        { name: 'Expenses', value: totalExpenses },
        { name: 'Net Savings', value: totalSavings },
    ];
    
    const handleSaveIncome = (newIncome: number) => {
        onUserDataChange({ ...userData, monthlyIncome: newIncome });
        setIsIncomeModalOpen(false);
    };

    const expenseData = userData.budgetCategories
      .map(cat => ({
        name: cat.name,
        value: cat.spent,
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <button 
          onClick={onDeepDive}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Get Deep Financial Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <div className="flex justify-between items-center">
                <h3 className="text-gray-400">Monthly Income</h3>
                <button onClick={() => setIsIncomeModalOpen(true)} className="text-gray-400 hover:text-white p-1">
                    <EditIcon className="w-5 h-5"/>
                </button>
            </div>
            <p className="text-3xl font-bold text-white">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </Card>
        {summaryData.map(item => (
          <Card key={item.name}>
            <h3 className="text-gray-400">{item.name}</h3>
            <p className={`text-3xl font-bold ${item.name === 'Expenses' ? 'text-red-400' : item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {item.name === 'Expenses' ? '-' : ''}${Math.abs(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-white">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.2)'}} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-white">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <IncomeModal 
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        currentIncome={totalIncome}
        onSave={handleSaveIncome}
      />
    </div>
  );
};

export default Dashboard;