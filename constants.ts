import { AppSettings, Room, RoomStatus, ServiceItem } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Apartments',
  currencySymbol: '$',
  taxRate: 10,
  primaryColor: '#0f172a',
  address: '123 Hospitality Lane, City Center',
  checkInTime: '14:00',
  checkOutTime: '11:00',
};

export const SEED_ROOMS: Room[] = [
  { id: '101', number: '101', type: 'Studio', rate: 80, status: RoomStatus.VACANT },
  { id: '102', number: '102', type: 'Studio', rate: 80, status: RoomStatus.OCCUPIED, currentBookingId: 'b-1' },
  { id: '103', number: '103', type: '1-Bedroom', rate: 120, status: RoomStatus.DIRTY },
  { id: '201', number: '201', type: 'Penthouse', rate: 250, status: RoomStatus.VACANT },
  { id: '202', number: '202', type: '2-Bedroom', rate: 180, status: RoomStatus.MAINTENANCE },
];

export const SEED_MENU: ServiceItem[] = [
  { id: 'f-1', name: 'Club Sandwich', category: 'FOOD', price: 12 },
  { id: 'f-2', name: 'Caesar Salad', category: 'FOOD', price: 10 },
  { id: 'd-1', name: 'Cappuccino', category: 'DRINK', price: 4 },
  { id: 'd-2', name: 'Fresh Juice', category: 'DRINK', price: 5 },
  { id: 'l-1', name: 'Shirt Press', category: 'LAUNDRY', price: 3 },
  { id: 'l-2', name: 'Full Load Wash', category: 'LAUNDRY', price: 15 },
];
