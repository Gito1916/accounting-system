import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, StatCard } from '../components/ui/Card';
import { TransactionType, UserRole, ExpenseCategory } from '../types';
import { useNavigate } from 'react-router-dom';

export const Accounting: React.FC = () => {
  const { ledger, settings, currentUserRole, expenses, addExpense } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPENSES' | 'LEDGER'>('OVERVIEW');

  // Expense Form State
  const [newExpense, setNewExpense] = useState({
    category: 'OTHER' as ExpenseCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Access Control
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md">You do not have permission to view accounting records.</p>
        <button onClick={() => navigate('/bookings')} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          Go to Bookings
        </button>
      </div>
    );
  }

  // --- Financial Calculations ---

  // Total Revenue (Accrued)
  const totalRevenue = ledger
    .filter(l => (l.type === TransactionType.CHARGE_ROOM || l.type === TransactionType.CHARGE_SERVICE) && !l.isVoided)
    .reduce((sum, l) => sum + l.amount, 0);

  // Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit
  const netProfit = totalRevenue - totalExpenses;

  // Cash Flow (Collected)
  const totalCollected = ledger
    .filter(l => l.type === TransactionType.PAYMENT && !l.isVoided)
    .reduce((sum, l) => sum + l.amount, 0);

  const accountsReceivable = totalRevenue - totalCollected;

  // Profit over Time Logic
  const getProfitForPeriod = (startDate: Date) => {
    const rev = ledger
        .filter(l => {
            const d = new Date(l.date);
            return d >= startDate && !l.isVoided && 
                   (l.type === TransactionType.CHARGE_ROOM || l.type === TransactionType.CHARGE_SERVICE);
        })
        .reduce((sum, l) => sum + l.amount, 0);
    
    const exp = expenses
        .filter(e => {
            const d = new Date(e.date);
            return d >= startDate;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    return rev - exp;
  };

  const now = new Date();
  
  // Weekly (Last 7 Days)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0,0,0,0);
  const weeklyProfit = getProfitForPeriod(startOfWeek);

  // Monthly (This Month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyProfit = getProfitForPeriod(startOfMonth);

  // Yearly (This Year)
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const yearlyProfit = getProfitForPeriod(startOfYear);

  // --- Handlers ---
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      date: newExpense.date,
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      recordedBy: currentUserRole || 'Admin'
    });

    setNewExpense({
      category: 'OTHER',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    alert('Expense recorded.');
  };

  // Sort Transactions
  const sortedTransactions = [...ledger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Accounting & Finance</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'EXPENSES' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Expenses
          </button>
          <button 
            onClick={() => setActiveTab('LEDGER')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'LEDGER' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            General Ledger
          </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              label="Total Revenue" 
              value={`${settings.currencySymbol}${totalRevenue.toFixed(2)}`} 
              icon="chart-line" 
              color="blue"
            />
            <StatCard 
              label="Total Expenses" 
              value={`${settings.currencySymbol}${totalExpenses.toFixed(2)}`} 
              icon="receipt" 
              color="red"
            />
            <StatCard 
              label="Net Profit" 
              value={`${settings.currencySymbol}${netProfit.toFixed(2)}`} 
              icon="coins" 
              color={netProfit >= 0 ? 'green' : 'red'}
            />
            <StatCard 
              label="Acc. Receivable" 
              value={`${settings.currencySymbol}${accountsReceivable.toFixed(2)}`} 
              icon="hand-holding-usd" 
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Profit Analysis">
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-slate-600 font-medium">Last 7 Days</span>
                   <span className={`font-bold ${weeklyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {settings.currencySymbol}{weeklyProfit.toFixed(2)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-slate-600 font-medium">This Month</span>
                   <span className={`font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {settings.currencySymbol}{monthlyProfit.toFixed(2)}
                   </span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-slate-600 font-medium">This Year</span>
                   <span className={`font-bold ${yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {settings.currencySymbol}{yearlyProfit.toFixed(2)}
                   </span>
                 </div>
               </div>
            </Card>

            <Card title="Cash Flow" className="md:col-span-2">
               <div className="flex items-center justify-between h-full p-4">
                 <div className="text-center flex-1 border-r border-slate-100">
                    <p className="text-sm text-slate-500 uppercase font-bold">Inflow (Collections)</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{settings.currencySymbol}{totalCollected.toFixed(2)}</p>
                 </div>
                 <div className="text-center flex-1">
                    <p className="text-sm text-slate-500 uppercase font-bold">Outflow (Expenses)</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{settings.currencySymbol}{totalExpenses.toFixed(2)}</p>
                 </div>
               </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'EXPENSES' && (
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
              <div className="overflow-x-auto max-h-[500px]">
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
      )}

      {activeTab === 'LEDGER' && (
        <Card title="General Ledger (All Transactions)">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map(entry => (
                    <tr key={entry.id} className={entry.isVoided ? 'opacity-50 line-through bg-gray-50' : ''}>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3">
                         <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                           entry.type === TransactionType.PAYMENT ? 'bg-green-100 text-green-700' : 
                           entry.type === TransactionType.CHARGE_ROOM ? 'bg-blue-100 text-blue-700' :
                           entry.type === TransactionType.CHARGE_SERVICE ? 'bg-purple-100 text-purple-700' :
                           'bg-gray-100 text-gray-700'
                         }`}>
                           {entry.type.replace('CHARGE_', '')}
                         </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                        entry.type === TransactionType.PAYMENT ? 'text-green-600' : 'text-slate-800'
                      }`}>
                        {entry.type === TransactionType.PAYMENT ? '+' : ''}
                        {settings.currencySymbol}{entry.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};