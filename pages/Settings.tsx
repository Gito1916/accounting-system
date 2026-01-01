import React, { useState } from 'react';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { RoomStatus, UserRole } from '../types';

export const Settings: React.FC = () => {
  const { settings, rooms, menu, updateSettings, addRoom, deleteRoom, addMenuItem, deleteMenuItem } = useStore();
  const [formData, setFormData] = useState(settings);
  
  // Room Management State
  const [newRoom, setNewRoom] = useState({ number: '', type: '', rate: '' });
  
  // Menu Management State
  const [newMenu, setNewMenu] = useState({ name: '', price: '', category: 'FOOD' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings saved successfully. Changes applied system-wide.');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.number || !newRoom.type || !newRoom.rate) return;

    addRoom({
      id: Math.random().toString(36).substr(2, 9),
      number: newRoom.number,
      type: newRoom.type,
      rate: parseFloat(newRoom.rate),
      status: RoomStatus.VACANT
    });
    setNewRoom({ number: '', type: '', rate: '' });
  };

  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.name || !newMenu.price) return;
    addMenuItem({
      id: Math.random().toString(36).substr(2, 9),
      name: newMenu.name,
      price: parseFloat(newMenu.price),
      category: newMenu.category as any
    });
    setNewMenu({ name: '', price: '', category: 'FOOD' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
      
      <Card title="Branding & Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Software Name</label>
            <input 
              name="appName"
              type="text" 
              value={formData.appName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">This appears in the sidebar and document headers.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color (Hex)</label>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: formData.primaryColor }}></div>
              <input 
                name="primaryColor"
                type="text" 
                value={formData.primaryColor}
                onChange={handleChange}
                className="flex-1 border rounded-lg px-3 py-2 font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Room Management">
        <div className="space-y-6">
           <form onSubmit={handleAddRoom} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room #</label>
               <input 
                 required
                 value={newRoom.number}
                 onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 placeholder="e.g. 101"
               />
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
               <input 
                 required
                 value={newRoom.type}
                 onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 placeholder="e.g. Deluxe"
               />
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rate</label>
               <input 
                 required
                 type="number"
                 value={newRoom.rate}
                 onChange={(e) => setNewRoom({...newRoom, rate: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 placeholder="0.00"
               />
             </div>
             <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 h-[42px]">
               Add
             </button>
           </form>

           <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50 sticky top-0">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Room</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rate</th>
                   <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                 {rooms.map(room => (
                   <tr key={room.id}>
                     <td className="px-4 py-3 font-bold text-slate-800">{room.number}</td>
                     <td className="px-4 py-3 text-slate-600">{room.type}</td>
                     <td className="px-4 py-3 text-slate-600">{settings.currencySymbol}{room.rate}</td>
                     <td className="px-4 py-3 text-right">
                       <button 
                         onClick={() => deleteRoom(room.id)}
                         disabled={room.status !== RoomStatus.VACANT}
                         className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                         title={room.status !== RoomStatus.VACANT ? "Cannot delete occupied room" : "Delete Room"}
                       >
                         <i className="fas fa-trash"></i>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </Card>

      <Card title="Kitchen & Laundry Menu">
         <div className="space-y-6">
           <form onSubmit={handleAddMenuItem} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
               <input 
                 required
                 value={newMenu.name}
                 onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 placeholder="e.g. Burger"
               />
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
               <select 
                 value={newMenu.category}
                 onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
                 className="w-full px-3 py-2 border rounded bg-white"
               >
                 <option value="FOOD">Food</option>
                 <option value="DRINK">Drink</option>
                 <option value="LAUNDRY">Laundry</option>
                 <option value="OTHER">Other</option>
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
               <input 
                 required
                 type="number"
                 value={newMenu.price}
                 onChange={(e) => setNewMenu({...newMenu, price: e.target.value})}
                 className="w-full px-3 py-2 border rounded"
                 placeholder="0.00"
               />
             </div>
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 h-[42px]">
               Add
             </button>
           </form>

           <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50 sticky top-0">
                 <tr>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                   <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                 {menu.map(item => (
                   <tr key={item.id}>
                     <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                     <td className="px-4 py-3 text-slate-600"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{item.category}</span></td>
                     <td className="px-4 py-3 text-slate-600">{settings.currencySymbol}{item.price}</td>
                     <td className="px-4 py-3 text-right">
                       <button 
                         onClick={() => deleteMenuItem(item.id)}
                         className="text-red-500 hover:text-red-700"
                       >
                         <i className="fas fa-trash"></i>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      </Card>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};