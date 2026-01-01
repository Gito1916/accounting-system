import React from 'react';
import { useStore } from '../store';
import { StatCard, Card } from '../components/ui/Card';
import { RoomStatus, TransactionType, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { rooms, bookings, settings, currentUserRole, ledger } = useStore();
  const navigate = useNavigate();

  // Access Control
  if (currentUserRole !== UserRole.OWNER && currentUserRole !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-md">You do not have permission to view the financial dashboard. Please contact an administrator.</p>
      </div>
    );
  }

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Real Revenue Calculation (Transactions from Today)
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = ledger
    .filter(l => l.date.startsWith(today) && !l.isVoided && (l.type === TransactionType.CHARGE_ROOM || l.type === TransactionType.CHARGE_SERVICE))
    .reduce((sum, l) => sum + l.amount, 0);

  const upcomingCheckins = bookings.filter(b => {
    return b.checkInDate.startsWith(today);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Sales" 
          value={`${settings.currencySymbol}${todayRevenue.toFixed(2)}`} 
          icon="dollar-sign" 
          color="green"
        />
        <StatCard 
          label="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          icon="bed" 
          color="blue"
        />
        <StatCard 
          label="Arrivals Today" 
          value={upcomingCheckins.length.toString()} 
          icon="suitcase" 
          color="orange"
        />
        <StatCard 
          label="Maintenance" 
          value={rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length.toString()} 
          icon="tools" 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Room Status Overview" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {rooms.map(room => (
              <div 
                key={room.id} 
                onClick={() => room.currentBookingId && navigate(`/rooms/${room.id}/tab`)}
                className={`p-4 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                room.status === RoomStatus.OCCUPIED ? 'bg-red-50 border-red-200' :
                room.status === RoomStatus.VACANT ? 'bg-green-50 border-green-200' :
                room.status === RoomStatus.DIRTY ? 'bg-yellow-50 border-yellow-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-xl font-bold text-slate-800">{room.number}</span>
                <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${
                   room.status === RoomStatus.OCCUPIED ? 'bg-red-200 text-red-800' :
                   room.status === RoomStatus.VACANT ? 'bg-green-200 text-green-800' :
                   room.status === RoomStatus.DIRTY ? 'bg-yellow-200 text-yellow-800' :
                   'bg-gray-200 text-gray-800'
                }`}>
                  {room.status}
                </span>
                <span className="text-xs text-slate-500 mt-2">{room.type}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
             <button 
               onClick={() => navigate('/bookings?new=true')}
               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors"
             >
               <i className="fas fa-plus-circle mr-2"></i> New Booking
             </button>
             <button 
               onClick={() => navigate('/bookings')}
               className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center justify-center transition-colors"
             >
               <i className="fas fa-search mr-2"></i> Find Reservation
             </button>
             <button 
               onClick={() => navigate('/bookings')}
               className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center justify-center transition-colors"
             >
               <i className="fas fa-clipboard-list mr-2"></i> Housekeeping Report
             </button>
          </div>
        </Card>
      </div>
    </div>
  );
};