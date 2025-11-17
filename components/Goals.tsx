import React, { useState, useEffect } from 'react';
import Card from './Card';
import type { UserData, Goal } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface GoalsProps {
    userData: UserData;
    onUserDataChange: (data: UserData) => void;
    onDeleteGoal: (id: string) => void;
}

const GoalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id'> & { id?: string }) => void;
  goal: Goal | null;
}> = ({ isOpen, onClose, onSubmit, goal }) => {
    const [formData, setFormData] = useState({ name: '', targetAmount: '', currentAmount: '' });

    useEffect(() => {
        if (goal) {
            setFormData({ name: goal.name, targetAmount: goal.targetAmount.toString(), currentAmount: goal.currentAmount.toString() });
        } else {
            setFormData({ name: '', targetAmount: '', currentAmount: '' });
        }
    }, [goal, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...goal,
            name: formData.name,
            targetAmount: parseFloat(formData.targetAmount) || 0,
            currentAmount: parseFloat(formData.currentAmount) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
            <Card className="w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">{goal ? 'Edit' : 'Add'} Savings Goal</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Goal Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Vacation Fund" required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount</label>
                        <input type="number" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} placeholder="2000" required step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Current Amount</label>
                        <input type="number" value={formData.currentAmount} onChange={e => setFormData({ ...formData, currentAmount: e.target.value })} placeholder="500" required step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white" />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">{goal ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Goals: React.FC<GoalsProps> = ({ userData, onUserDataChange, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleOpenModal = (goal: Goal | null = null) => {
      setEditingGoal(goal);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingGoal(null);
  };

  const handleSaveGoal = (goal: Omit<Goal, 'id'> & { id?: string }) => {
      let updatedGoals: Goal[];
      if (goal.id) { // Update
          updatedGoals = userData.goals.map(g => g.id === goal.id ? { ...g, ...goal, id: g.id } : g);
      } else { // Add
          const newGoal: Goal = { ...goal, id: `goal_${Date.now()}` };
          updatedGoals = [...userData.goals, newGoal];
      }
      onUserDataChange({ ...userData, goals: updatedGoals });
  };
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Savings Goals</h2>
        <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Goal
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.goals.map(goal => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <Card key={goal.id}>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white mb-2">{goal.name}</h3>
                <div>
                  <button onClick={() => handleOpenModal(goal)} className="text-gray-400 hover:text-white p-1"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-400 p-1 ml-1"><TrashIcon className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-center my-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
              </div>
              <div className="text-center text-gray-300">
                <span className="font-bold text-white">${goal.currentAmount.toLocaleString()}</span> / ${goal.targetAmount.toLocaleString()}
              </div>
            </Card>
          );
        })}
      </div>
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
};

export default Goals;