import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login, settings } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.OWNER);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    
    // Redirect based on role
    if (role === UserRole.KITCHEN) {
      navigate('/pos');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-3xl mx-auto mb-4">
             <i className="fas fa-building"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{settings.appName}</h1>
          <p className="text-slate-500">Property Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select User Role</label>
            <div className="relative">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-3 border border-slate-300 rounded-lg appearance-none bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={UserRole.OWNER}>Owner</option>
                <option value={UserRole.ADMIN}>Manager / Accountant</option>
                <option value={UserRole.FRONT_DESK}>Front Desk</option>
                <option value={UserRole.KITCHEN}>Kitchen Staff</option>
              </select>
              <div className="absolute right-4 top-4 text-slate-500 pointer-events-none">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * In a real app, this would be username/password.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};