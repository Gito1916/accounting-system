import React, { useState } from 'react';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { ExpenseCategory } from '../types';

export const Expenses: React.FC = () => {
  const { expenses, addExpense, settings } = useStore();
  const [newExpense, setNewExpense] = useState({
    category: 'OTHER' as ExpenseCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      date: newExpense.date,
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      recordedBy: 'Admin'
    });

    setNewExpense({
      category: 'OTHER',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Expense Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Record New Expense">
           <form onSubmit={handleAddExpense} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
               <input 
                 type="date"
                 className="w-full px-3 py-2 border rounded"
                 value={newExpense.date}
                 onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
               <select 
                 className="w-full px-3 py-2 border rounded bg-white"
                 value={newExpense.category}
                 onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
               >
                 <option value="KITCHEN">Kitchen Supplies</option>
                 <option value="LAUNDRY">Laundry Supplies</option>
                 <option value="ROOMS">Room Amenities</option>
                 <option value="UTILITIES">Utilities (Water/Elec)</option>
                 <option value="SALARY">Salaries</option>
                 <option value="OTHER">Other</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
               <input 
                 type="text"
                 className="w-full px-3 py-2 border rounded"
                 placeholder="e.g. Vegetables purchase"
                 value={newExpense.description}
                 onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
               <input 
                 type="number"
                 className="w-full px-3 py-2 border rounded"
                 placeholder="0.00"
                 value={newExpense.amount}
                 onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
               />
             </div>
             <button type="submit" className="w-full py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">
               Record Expense
             </button>
           </form>
        </Card>

        <Card title="Recent Expenses" className="md:col-span-2">
          <div className="flex justify-between items-center mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <span className="text-red-800 font-bold uppercase text-xs">Total Expenses</span>
            <span className="text-2xl font-bold text-red-600">{settings.currencySymbol}{totalExpenses.toFixed(2)}</span>
          </div>
          
          <div className="overflow-x-auto max-h-[400px]">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-400">No expenses recorded.</td></tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id}>
                      <td className="px-4 py-3 text-slate-600">{exp.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">{exp.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{exp.description}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">
                        {settings.currencySymbol}{exp.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};