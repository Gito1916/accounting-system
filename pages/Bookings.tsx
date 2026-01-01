import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { BookingStatus, RoomStatus } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Bookings: React.FC = () => {
  const { bookings, guests, rooms, checkIn, checkOut, addBooking, updateRoomStatus } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'LIST' | 'CALENDAR' | 'ROOMS'>('LIST');
  
  const [filter, setFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    email: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  // Auto-open modal if navigated from dashboard
  useEffect(() => {
    if (location.search.includes('new=true')) {
      setIsModalOpen(true);
      // Clean up URL
      navigate('/bookings', { replace: true });
    }
  }, [location, navigate]);

  const getGuestName = (guestId: string) => {
    return guests.find(g => g.id === guestId)?.fullName || 'Unknown';
  };

  const getRoomNumber = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.number || 'N/A';
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.roomId || !newBooking.guestName) return;

    const guestId = Math.random().toString(36).substr(2, 9);
    const bookingId = Math.random().toString(36).substr(2, 9);
    const room = rooms.find(r => r.id === newBooking.roomId);
    
    // Create Guest
    const guest = {
      id: guestId,
      fullName: newBooking.guestName,
      email: newBooking.email,
      phone: '',
      idNumber: ''
    };

    // Calculate nights
    const start = new Date(newBooking.checkInDate);
    const end = new Date(newBooking.checkOutDate);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const totalAmount = (room?.rate || 0) * nights;

    // Create Booking
    addBooking({
      id: bookingId,
      roomId: newBooking.roomId,
      guestId: guestId,
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      status: BookingStatus.CONFIRMED,
      totalAmount: totalAmount,
      createdAt: new Date().toISOString()
    }, guest);

    setIsModalOpen(false);
    setNewBooking({
      guestName: '',
      email: '',
      roomId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    });

    alert('Booking Created Successfully!');
  };

  const filteredBookings = bookings.filter(b => filter === 'ALL' || b.status === filter);
  const availableRooms = rooms.filter(r => r.status === RoomStatus.VACANT || r.status === RoomStatus.DIRTY);

  // --- Calendar Logic ---
  const getCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const calendarDates = getCalendarDates();

  const isRoomBookedOnDate = (roomId: string, dateStr: string) => {
    const date = new Date(dateStr);
    return bookings.find(b => {
      if (b.status === BookingStatus.CANCELLED || b.status === BookingStatus.CHECKED_OUT) return false;
      const start = new Date(b.checkInDate.split('T')[0]);
      const end = new Date(b.checkOutDate.split('T')[0]);
      return b.roomId === roomId && date >= start && date < end;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Tab Switcher */}
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('LIST')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'LIST' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Reservations List
          </button>
          <button 
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'CALENDAR' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Availability Calendar
          </button>
          <button 
            onClick={() => setActiveTab('ROOMS')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ROOMS' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Room Status
          </button>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center w-full md:w-auto justify-center"
        >
          <i className="fas fa-plus mr-2"></i> Create Booking
        </button>
      </div>

      {/* --- LIST VIEW --- */}
      {activeTab === 'LIST' && (
        <>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {['ALL', BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border whitespace-nowrap ${
                  filter === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {getGuestName(booking.guestId).charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{getGuestName(booking.guestId)}</div>
                            <div className="text-xs text-slate-500">ID: {booking.id.substring(0,6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-bold">
                          {getRoomNumber(booking.roomId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{new Date(booking.checkInDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">to {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === BookingStatus.CHECKED_IN ? 'bg-green-100 text-green-800' :
                          booking.status === BookingStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' :
                          booking.status === BookingStatus.CHECKED_OUT ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link to={`/rooms/${booking.roomId}/tab`} className="text-blue-600 hover:text-blue-900 font-semibold">
                          Tab
                        </Link>
                        {booking.status === BookingStatus.CONFIRMED && (
                          <button onClick={() => checkIn(booking.id)} className="text-green-600 hover:text-green-900 font-semibold ml-2">
                            In
                          </button>
                        )}
                        {booking.status === BookingStatus.CHECKED_IN && (
                          <button onClick={() => checkOut(booking.id)} className="text-orange-600 hover:text-orange-900 font-semibold ml-2">
                            Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <i className="fas fa-inbox text-4xl mb-3"></i>
                <p>No bookings found with this filter.</p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* --- CALENDAR VIEW --- */}
      {activeTab === 'CALENDAR' && (
         <Card className="overflow-hidden">
            <div className="overflow-x-auto">
               <table className="min-w-full border-collapse">
                 <thead>
                   <tr>
                     <th className="p-3 border-b border-r bg-slate-50 text-left min-w-[100px]">Room</th>
                     {calendarDates.map(date => (
                       <th key={date} className="p-2 border-b bg-slate-50 text-center min-w-[60px]">
                         <div className="text-xs text-slate-500">{new Date(date).toLocaleDateString(undefined, {weekday: 'short'})}</div>
                         <div className="text-sm font-bold">{new Date(date).getDate()}</div>
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                    {rooms.map(room => (
                      <tr key={room.id} className="hover:bg-slate-50">
                        <td className="p-3 border-r font-bold text-slate-700 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {room.number}
                          <div className="text-xs text-slate-400 font-normal">{room.type}</div>
                        </td>
                        {calendarDates.map(date => {
                          const booking = isRoomBookedOnDate(room.id, date);
                          return (
                            <td key={date} className="p-1 border relative h-16">
                              {booking && (
                                <div 
                                  className={`w-full h-full rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer ${
                                    booking.status === BookingStatus.CHECKED_IN ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  title={`Guest: ${getGuestName(booking.guestId)}`}
                                  onClick={() => navigate(`/rooms/${booking.roomId}/tab`)}
                                >
                                  {getGuestName(booking.guestId).charAt(0)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
         </Card>
      )}

      {/* --- ROOM STATUS VIEW --- */}
      {activeTab === 'ROOMS' && (
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {rooms.map(room => (
              <div 
                key={room.id} 
                className={`p-4 rounded-lg border flex flex-col items-center justify-center transition-all relative ${
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
                <div className="mt-3 flex gap-2">
                  {room.status === RoomStatus.DIRTY && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, RoomStatus.VACANT)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Clean
                    </button>
                  )}
                  {room.status === RoomStatus.VACANT && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, RoomStatus.MAINTENANCE)}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Maint.
                    </button>
                  )}
                  {room.status === RoomStatus.MAINTENANCE && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, RoomStatus.VACANT)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">New Reservation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newBooking.email}
                  onChange={(e) => setNewBooking({...newBooking, email: e.target.value})}
                  placeholder="guest@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
                <select 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newBooking.roomId}
                  onChange={(e) => setNewBooking({...newBooking, roomId: e.target.value})}
                >
                  <option value="">Select a Room</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>{r.number} - {r.type} (${r.rate})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Check In</label>
                   <input 
                      required
                      type="date" 
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newBooking.checkInDate}
                      onChange={(e) => setNewBooking({...newBooking, checkInDate: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
                   <input 
                      required
                      type="date" 
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newBooking.checkOutDate}
                      onChange={(e) => setNewBooking({...newBooking, checkOutDate: e.target.value})}
                   />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};