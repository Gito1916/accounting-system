import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { UserRole } from '../types';

const SidebarItem = ({ to, icon, label, onClick }: { to: string; icon: string; label: string; onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <i className={`fas fa-${icon} w-5 text-center`}></i>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, currentUserRole, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define Root Paths (Starting Pages) where Back button should NOT appear
  const ROOT_PATHS = ['/', '/bookings', '/pos', '/accounting', '/settings'];
  // We check if the current pathname is exactly one of the root paths
  const isRootPage = ROOT_PATHS.includes(location.pathname);

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    if (path.includes('pos')) return 'Kitchen & Laundry';
    if (path.includes('rooms')) return 'Room Detail';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUserRole) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <i className="fas fa-building text-lg"></i>
            </div>
            <h1 className="font-bold text-xl tracking-tight truncate">{settings.appName}</h1>
          </div>
          <div className="mt-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {/* Owner: Dashboard & Accounting */}
          {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
            <SidebarItem to="/" icon="chart-pie" label="Dashboard" />
          )}

          {/* Front Desk: Bookings, Kitchen. No Settings/Accounting */}
          {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.FRONT_DESK) && (
             <SidebarItem to="/bookings" icon="calendar-check" label="Bookings & Rooms" />
          )}

          {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.FRONT_DESK || currentUserRole === UserRole.KITCHEN) && (
             <SidebarItem to="/pos" icon="utensils" label="Kitchen / Laundry" />
          )}

          {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
            <SidebarItem to="/accounting" icon="file-invoice-dollar" label="Accounting" />
          )}

          {/* Settings: Owner and Admin */}
          {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
            <SidebarItem to="/settings" icon="cog" label="Settings" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {currentUserRole.substring(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{currentUserRole.toLowerCase().replace('_', ' ')}</p>
                <p className="text-xs text-green-400">● Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" 
            onClick={closeMobileMenu}
          ></div>
          
          {/* Menu */}
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-slate-900 text-white shadow-xl transform transition-transform">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="font-bold text-xl">{settings.appName}</div>
                <button onClick={closeMobileMenu} className="text-slate-400 hover:text-white">
                  <i className="fas fa-times text-xl"></i>
                </button>
             </div>
             <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
                   <SidebarItem to="/" icon="chart-pie" label="Dashboard" onClick={closeMobileMenu} />
                )}
                {(currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.FRONT_DESK) && (
                   <SidebarItem to="/bookings" icon="calendar-check" label="Bookings & Rooms" onClick={closeMobileMenu} />
                )}
                <SidebarItem to="/pos" icon="utensils" label="Kitchen / Laundry" onClick={closeMobileMenu} />
                {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
                   <SidebarItem to="/accounting" icon="file-invoice-dollar" label="Accounting" onClick={closeMobileMenu} />
                )}
                {(currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN) && (
                   <SidebarItem to="/settings" icon="cog" label="Settings" onClick={closeMobileMenu} />
                )}
             </nav>
             <div className="p-4 border-t border-slate-800">
               <button onClick={handleLogout} className="flex items-center space-x-2 text-red-400 font-bold">
                 <i className="fas fa-sign-out-alt"></i>
                 <span>Sign Out</span>
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center">
             {/* Mobile Hamburger */}
             <div className="md:hidden mr-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-slate-500 hover:text-slate-700 p-2 -ml-2"
                >
                  <i className="fas fa-bars text-xl"></i>
                </button>
             </div>
             
             {/* Dynamic Back Button or App Name/Title */}
             {!isRootPage ? (
               <div className="flex items-center">
                  <button 
                    onClick={() => navigate(-1)} 
                    className="mr-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <i className="fas fa-arrow-left text-sm"></i>
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 hidden md:block">{getPageTitle()}</h2>
                  <h2 className="text-lg font-bold text-slate-800 md:hidden">{getPageTitle()}</h2>
               </div>
             ) : (
               <>
                 <span className="md:hidden font-bold text-lg text-slate-800 truncate">{settings.appName}</span>
                 <h2 className="hidden md:block text-2xl font-bold text-slate-800">{getPageTitle()}</h2>
               </>
             )}
          </div>
          
          <div className="flex items-center space-x-4">
             <span className="hidden sm:flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
               <i className="fas fa-wifi mr-1"></i> SYNCED
             </span>
             <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors relative">
               <i className="fas fa-bell"></i>
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};