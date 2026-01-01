import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { RoomLedger } from './pages/RoomLedger';
import { POS } from './pages/POS';
import { Accounting } from './pages/Accounting';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useStore } from './store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/rooms" element={<Navigate to="/bookings" replace />} />
        <Route path="/rooms/:roomId/tab" element={<ProtectedRoute><RoomLedger /></ProtectedRoute>} />
        <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
        <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;