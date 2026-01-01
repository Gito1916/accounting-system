import React, { useState } from 'react';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { ServiceItem } from '../types';
import { useNavigate } from 'react-router-dom';

export const POS: React.FC = () => {
  const { menu, rooms, createOrder, settings } = useStore();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{item: ServiceItem, qty: number}[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FOOD' | 'DRINK' | 'LAUNDRY'>('ALL');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: ServiceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.qty), 0);
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

  const handleSubmitOrder = (paymentMethod: 'PAY_NOW' | 'CHARGE_ROOM') => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CHARGE_ROOM' && !selectedRoomId) {
      alert('Please select a room to charge.');
      return;
    }

    createOrder({
      id: Math.random().toString(36).substr(2, 9),
      roomId: selectedRoomId || '',
      items: cart.map(c => ({ itemId: c.item.id, name: c.item.name, quantity: c.qty, price: c.item.price })),
      total: cartTotal,
      status: 'PENDING',
      paymentStatus: paymentMethod === 'CHARGE_ROOM' ? 'CHARGED_TO_ROOM' : 'PAID',
      createdAt: new Date().toISOString()
    });

    // Reset
    setCart([]);
    setSelectedRoomId('');
    setIsCartOpen(false);
    alert('Order created successfully!');
  };

  const filteredMenu = menu.filter(m => activeCategory === 'ALL' || m.category === activeCategory);
  const occupiedRooms = rooms.filter(r => r.currentBookingId);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] relative">
      
      {/* Header removed - now handled globally in Layout */}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden relative">
        {/* Left: Menu Grid */}
        <div className="flex-1 flex flex-col min-h-0 pb-20 lg:pb-0">
          {/* Category Filter */}
          <div className="mb-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
            {['ALL', 'FOOD', 'DRINK', 'LAUNDRY'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                  activeCategory === cat 
                  ? 'bg-slate-800 text-white scale-105' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Items' : cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenu.map(item => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between h-32 active:scale-95"
                >
                  <div className="font-bold text-slate-800 line-clamp-2">{item.name}</div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.category}</span>
                    <span className="text-lg font-bold text-blue-600">{settings.currencySymbol}{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Summary Bar (Sticky Bottom) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-bold flex justify-between items-center shadow-lg active:scale-[0.98] transition-transform"
           >
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full w-8 text-center">{totalItems}</div>
                <span>View Order</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Total:</span>
                <span className="text-xl">{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                <i className="fas fa-chevron-up ml-3 text-sm"></i>
              </div>
           </button>
        </div>

        {/* Backdrop for Mobile Modal */}
        {isCartOpen && (
           <div 
             className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
             onClick={() => setIsCartOpen(false)}
           />
        )}

        {/* Right: Cart (Responsive Modal/Sidebar) */}
        <Card className={`
           flex flex-col border-l border-slate-200 shadow-xl flex-shrink-0 bg-white
           lg:static lg:w-96 lg:h-full lg:translate-y-0 lg:z-auto lg:rounded-xl
           fixed bottom-0 left-0 right-0 h-[85vh] z-50 rounded-t-2xl transition-transform duration-300 ease-out
           ${isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
          <div className="p-4 border-b bg-slate-50 flex-shrink-0 flex justify-between items-center rounded-t-2xl lg:rounded-t-none">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <i className="fas fa-shopping-basket mr-2"></i> Current Order
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
            >
               <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 overscroll-contain">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <i className="fas fa-utensils text-4xl mb-3 opacity-20"></i>
                <p>Select items to start order</p>
              </div>
            ) : (
              cart.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center group p-2 rounded hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-800">{line.item.name}</div>
                    <div className="text-xs text-slate-500">{settings.currencySymbol}{line.item.price} x {line.qty}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                     <div className="font-bold">{settings.currencySymbol}{line.item.price * line.qty}</div>
                     <button onClick={() => removeFromCart(line.item.id)} className="text-slate-300 hover:text-red-500 p-1">
                       <i className="fas fa-times-circle text-lg"></i>
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t space-y-4 flex-shrink-0">
            <div className="flex justify-between items-center text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Charge to Room</label>
              <select 
                className="w-full p-2 border rounded bg-white text-sm"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">-- Select Guest Room --</option>
                {occupiedRooms.map(r => (
                  <option key={r.id} value={r.id}>Room {r.number} (Active)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-safe">
              <button 
                onClick={() => handleSubmitOrder('PAY_NOW')}
                disabled={cart.length === 0}
                className="py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 disabled:opacity-50"
              >
                Cash Paid
              </button>
              <button 
                onClick={() => handleSubmitOrder('CHARGE_ROOM')}
                disabled={cart.length === 0 || !selectedRoomId}
                className="py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Charge Room
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};