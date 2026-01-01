import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { TransactionType, LedgerEntry } from '../types';

export const RoomLedger: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { rooms, bookings, guests, ledger, addLedgerEntry, getRoomBalance, settings } = useStore();
  
  const room = rooms.find(r => r.id === roomId);
  const currentBooking = bookings.find(b => b.id === room?.currentBookingId);
  const guest = guests.find(g => g.id === currentBooking?.guestId);

  // Local state for modal/form
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');

  if (!room || !currentBooking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-700">Room not occupied or not found</h2>
        <button onClick={() => navigate('/rooms')} className="mt-4 text-blue-600 hover:underline">Back to Rooms</button>
      </div>
    );
  }

  const roomLedger = ledger.filter(l => l.bookingId === currentBooking.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const balance = getRoomBalance(currentBooking.id);

  const handlePayment = () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    const entry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      bookingId: currentBooking.id,
      roomId: room.id,
      date: new Date().toISOString(),
      type: TransactionType.PAYMENT,
      description: 'Cash Payment at Desk',
      amount: amount,
      createdBy: 'front_desk',
      isVoided: false
    };

    addLedgerEntry(entry);
    setPayAmount('');
    setShowPayModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
             <h1 className="text-2xl font-bold text-slate-800">Room {room.number} Ledger</h1>
             <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">ACTIVE</span>
          </div>
          <p className="text-slate-500 mt-1">Guest: <span className="font-semibold text-slate-700">{guest?.fullName}</span> • Check-out: {new Date(currentBooking.checkOutDate).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="text-right">
             <p className="text-xs text-slate-500 uppercase font-bold">Outstanding Balance</p>
             <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {settings.currencySymbol}{balance.toFixed(2)}
             </p>
           </div>
           <button 
             onClick={() => setShowPayModal(true)}
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105"
            >
             <i className="fas fa-credit-card mr-2"></i> Take Payment
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Table */}
        <Card title="Transaction History" className="lg:col-span-2">
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
                {roomLedger.map(entry => (
                  <tr key={entry.id} className={entry.isVoided ? 'opacity-50 line-through bg-gray-50' : ''}>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(entry.date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {entry.description}
                      {entry.referenceId && <span className="ml-2 text-xs text-blue-500 font-mono">#{entry.referenceId}</span>}
                    </td>
                    <td className="px-4 py-3">
                       <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                         entry.type === TransactionType.PAYMENT ? 'bg-green-100 text-green-700' : 
                         entry.type === TransactionType.CHARGE_ROOM ? 'bg-blue-100 text-blue-700' :
                         'bg-orange-100 text-orange-700'
                       }`}>
                         {entry.type.replace('CHARGE_', '')}
                       </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      entry.type === TransactionType.PAYMENT || entry.type === TransactionType.REFUND 
                        ? 'text-green-600' 
                        : 'text-slate-800'
                    }`}>
                      {entry.type === TransactionType.PAYMENT ? '-' : ''}
                      {settings.currencySymbol}{entry.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card title="Quick Charge">
            <div className="space-y-4">
               <button 
                 onClick={() => {
                   addLedgerEntry({
                     id: Math.random().toString(36).substr(2, 9),
                     bookingId: currentBooking.id,
                     roomId: room.id,
                     date: new Date().toISOString(),
                     type: TransactionType.CHARGE_ROOM,
                     description: 'Manual Night Charge',
                     amount: room.rate,
                     createdBy: 'user',
                     isVoided: false
                   });
                 }}
                 className="w-full py-2 px-4 border border-slate-300 rounded hover:bg-slate-50 flex justify-between items-center"
               >
                 <span>Add Night Charge</span>
                 <span className="font-bold">{settings.currencySymbol}{room.rate}</span>
               </button>
               
               <button className="w-full py-2 px-4 border border-slate-300 rounded hover:bg-slate-50 flex justify-between items-center text-slate-400 cursor-not-allowed">
                 <span>Minibar Restock</span>
                 <span className="text-xs">Unavailable</span>
               </button>
            </div>
          </Card>

          <Card title="Room Actions">
             <div className="space-y-2">
                <button 
                  onClick={() => navigate('/pos')}
                  className="w-full py-2 bg-orange-50 text-orange-700 rounded font-medium hover:bg-orange-100"
                >
                  <i className="fas fa-utensils mr-2"></i> Go to Kitchen POS
                </button>
                <button className="w-full py-2 text-red-600 hover:bg-red-50 rounded font-medium">
                  Check Out Guest
                </button>
             </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Receive Payment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">{settings.currencySymbol}</span>
                <input 
                  type="number" 
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handlePayment}
                className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};