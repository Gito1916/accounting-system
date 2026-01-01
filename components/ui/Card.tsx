import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          {title && <h3 className="font-semibold text-lg text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const StatCard: React.FC<{ label: string; value: string; icon: string; trend?: string; color?: string }> = ({ label, value, icon, trend, color = 'blue' }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          {trend && <p className="text-xs text-green-600 mt-2 font-medium"><i className="fas fa-arrow-up mr-1"></i> {trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center text-${color}-600`}>
          <i className={`fas fa-${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};
