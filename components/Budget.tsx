import React, { useState, useEffect } from 'react';
import Card from './Card';
import type { UserData, BudgetCategory } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';


interface BudgetProps {
    userData: UserData;
    onUserDataChange: (data: UserData) => void;
    onDeleteCategory: (id: string) => void;
}

const BudgetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<BudgetCategory, 'id' | 'spent'> & { id?: string }) => void;
  category: BudgetCategory | null;
}> = ({ isOpen, onClose, onSubmit, category }) => {
    const [formData, setFormData] = useState({ name: '', allocated: '' });

    useEffect(() => {
        if (category) {
            setFormData({ name: category.name, allocated: category.allocated.toString() });
        } else {
            setFormData({ name: '', allocated: '' });
        }
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...category,
            name: formData.name,
            allocated: parseFloat(formData.allocated) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">{category ? 'Edit' : 'Add'} Budget Category</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Groceries" required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Allocated Amount</label>
                        <input type="number" value={formData.allocated} onChange={e => setFormData({ ...formData, allocated: e.target.value })} placeholder="0.00" required step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">{category ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const Budget: React.FC<BudgetProps> = ({ userData, onUserDataChange, onDeleteCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

  const handleOpenModal = (category: BudgetCategory | null = null) => {
      setEditingCategory(category);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingCategory(null);
  };

  const handleSaveCategory = (category: Omit<BudgetCategory, 'id' | 'spent'> & { id?: string }) => {
      let updatedCategories: BudgetCategory[];
      if (category.id) { // Update
          updatedCategories = userData.budgetCategories.map(c => c.id === category.id ? { ...c, name: category.name, allocated: category.allocated } : c);
      } else { // Add
          const newCategory: BudgetCategory = {
              ...category,
              id: `cat_${Date.now()}`,
              spent: 0,
          };
          updatedCategories = [...userData.budgetCategories, newCategory];
      }
      onUserDataChange({ ...userData, budgetCategories: updatedCategories });
  };
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Budget</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Category
        </button>
      </div>
      <Card>
        <div className="space-y-4">
          {userData.budgetCategories.map(cat => {
            const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
            const progressBarColor = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-primary-500';
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex-grow">
                    <span className="font-semibold text-white">{cat.name}</span>
                    <p className="text-sm text-gray-400">${cat.spent.toFixed(2)} / ${cat.allocated.toFixed(2)}</p>
                  </div>
                   <div>
                      <button onClick={() => handleOpenModal(cat)} className="text-gray-400 hover:text-white p-1"><EditIcon className="w-5 h-5"/></button>
                      <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-400 p-1 ml-2"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
       <BudgetModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default Budget;