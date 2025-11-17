import React, { useState, useCallback, useEffect } from 'react';
import Card from './Card';
import { analyzeReceipt } from '../services/geminiService';
import type { UserData, Transaction } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface ExpensesProps {
    userData: UserData;
    onUserDataChange: (data: UserData) => void;
    onDeleteTransaction: (id: string) => void;
}

const ReceiptAnalysisResult: React.FC<{ data: any }> = ({ data }) => (
  <Card className="mt-4 bg-gray-700/50">
    <h4 className="font-semibold text-lg mb-2 text-white">Receipt Analysis</h4>
    <p className="text-gray-300"><strong>Merchant:</strong> {data.merchant}</p>
    <p className="text-gray-300"><strong>Date:</strong> {data.date}</p>
    <p className="text-gray-300"><strong>Total:</strong> ${data.total}</p>
    <h5 className="font-semibold mt-2 text-white">Items:</h5>
    <ul className="list-disc list-inside text-sm text-gray-300">
      {data.items?.map((item: any, index: number) => (
        <li key={index}>{item.name} - ${item.price}</li>
      ))}
    </ul>
     <p className="text-sm text-green-400 mt-2">This transaction has been automatically added to your list.</p>
  </Card>
);

const TransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  transaction: Transaction | null;
  categories: string[];
}> = ({ isOpen, onClose, onSubmit, transaction, categories }) => {
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        amount: '',
        category: ''
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount.toString(),
                category: transaction.category
            });
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                category: categories[0] || ''
            });
        }
    }, [transaction, isOpen, categories]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...transaction,
            ...formData,
            amount: parseFloat(formData.amount) || 0,
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">{transaction ? 'Edit' : 'Add'} Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g., Grocery Store" required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                        <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">{transaction ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const Expenses: React.FC<ExpensesProps> = ({ userData, onUserDataChange, onDeleteTransaction }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyzeReceipt = useCallback(async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const resultString = await analyzeReceipt(selectedFile);
      const resultJson = JSON.parse(resultString);
      setAnalysisResult(resultJson);

      // Auto-add the transaction
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        date: resultJson.date || new Date().toISOString().split('T')[0],
        description: resultJson.merchant || 'Scanned Receipt',
        amount: parseFloat(resultJson.total) || 0,
        category: 'Uncategorized' // Future improvement: guess category from merchant/items
      };
      
      if (newTransaction.amount > 0) {
          const updatedTransactions = [newTransaction, ...userData.transactions];
          onUserDataChange({ ...userData, transactions: updatedTransactions });
      }

    } catch (apiError) {
      setError("Failed to analyze receipt. The AI may have returned an unexpected format. Please try again.");
      console.error(apiError);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile, userData, onUserDataChange]);

  const handleOpenModal = (transaction: Transaction | null = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingTransaction(null);
  };

  const handleSaveTransaction = (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
      let updatedTransactions: Transaction[];
      if (transaction.id) { // Update existing
          updatedTransactions = userData.transactions.map(t => t.id === transaction.id ? { ...t, ...transaction, id: t.id } : t);
      } else { // Add new
          const newTransaction: Transaction = {
              ...transaction,
              id: `tx_${Date.now()}`
          };
          updatedTransactions = [newTransaction, ...userData.transactions];
      }
      onUserDataChange({ ...userData, transactions: updatedTransactions });
  };
  
  const categoryNames = userData.budgetCategories.map(c => c.name).concat('Uncategorized');

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-3xl font-bold text-white">Expenses</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4 text-white">Analyze Receipt</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
          />
          <button
            onClick={handleAnalyzeReceipt}
            disabled={!selectedFile || isAnalyzing}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {error && <p className="text-red-400 mt-2">{error}</p>}
        {isAnalyzing && <div className="mt-4 text-center text-gray-300">AI is reading your receipt...</div>}
        {analysisResult && <ReceiptAnalysisResult data={analysisResult} />}
      </Card>
      
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Transaction
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 text-right font-medium">Amount</th>
                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3"><span className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs">{t.category}</span></td>
                  <td className="p-3 text-right font-medium text-red-400">-${t.amount.toFixed(2)}</td>
                  <td className="p-3 text-center">
                      <button onClick={() => handleOpenModal(t)} className="text-gray-400 hover:text-white p-1"><EditIcon className="w-5 h-5"/></button>
                      <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-400 p-1 ml-2"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTransaction}
        transaction={editingTransaction}
        categories={[...new Set(categoryNames)]}
      />
    </div>
  );
};

export default Expenses;