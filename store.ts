import { create } from 'zustand';
import { 
  AppSettings, 
  Booking, 
  Guest, 
  LedgerEntry, 
  Room, 
  RoomStatus, 
  ServiceItem, 
  ServiceOrder, 
  BookingStatus,
  TransactionType,
  UserRole,
  Expense
} from './types';
import { DEFAULT_SETTINGS, SEED_MENU, SEED_ROOMS } from './constants';

interface AppState {
  // Data
  isAuthenticated: boolean;
  currentUserRole: UserRole | null; 
  settings: AppSettings;
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  ledger: LedgerEntry[];
  menu: ServiceItem[];
  orders: ServiceOrder[];
  expenses: Expense[];

  // Auth Actions
  login: (role: UserRole) => void;
  logout: () => void;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Room Management Actions
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;

  // Menu Management Actions
  addMenuItem: (item: ServiceItem) => void;
  deleteMenuItem: (itemId: string) => void;

  // Expense Actions
  addExpense: (expense: Expense) => void;

  addBooking: (booking: Booking, guest: Guest) => void;
  checkIn: (bookingId: string) => void;
  checkOut: (bookingId: string) => void;
  addLedgerEntry: (entry: LedgerEntry) => void;
  createOrder: (order: ServiceOrder) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  
  // Computed (Functions)
  getRoomBalance: (bookingId: string) => number;
}

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substr(2, 9);

// Mock Initial Data
const initialGuests: Guest[] = [
  { id: 'g-1', fullName: 'John Doe', email: 'john@example.com', phone: '555-0101', idNumber: 'AB123456' }
];

const initialBookings: Booking[] = [
  { 
    id: 'b-1', 
    roomId: '102', 
    guestId: 'g-1', 
    checkInDate: new Date().toISOString(), 
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(), 
    status: BookingStatus.CHECKED_IN, 
    totalAmount: 240, 
    createdAt: new Date().toISOString() 
  }
];

const initialLedger: LedgerEntry[] = [
  { 
    id: 'l-1', 
    bookingId: 'b-1', 
    roomId: '102', 
    date: new Date().toISOString(), 
    type: TransactionType.CHARGE_ROOM, 
    description: 'Room Charge - Night 1', 
    amount: 80, 
    createdBy: 'system', 
    isVoided: false 
  }
];

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  currentUserRole: null, 
  settings: DEFAULT_SETTINGS,
  rooms: SEED_ROOMS,
  bookings: initialBookings,
  guests: initialGuests,
  ledger: initialLedger,
  menu: SEED_MENU,
  orders: [],
  expenses: [],

  login: (role) => set({ isAuthenticated: true, currentUserRole: role }),
  logout: () => set({ isAuthenticated: false, currentUserRole: null }),

  updateSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),

  addRoom: (room) => set((state) => ({ 
    rooms: [...state.rooms, room] 
  })),

  updateRoom: (updatedRoom) => set((state) => ({
    rooms: state.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
  })),

  deleteRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(r => r.id !== roomId)
  })),

  addMenuItem: (item) => set((state) => ({
    menu: [...state.menu, item]
  })),

  deleteMenuItem: (itemId) => set((state) => ({
    menu: state.menu.filter(m => m.id !== itemId)
  })),

  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, expense]
  })),

  addBooking: (booking, guest) => set((state) => ({
    bookings: [...state.bookings, booking],
    guests: [...state.guests, guest],
    // If checking in immediately, update room status
    rooms: booking.status === BookingStatus.CHECKED_IN 
      ? state.rooms.map(r => r.id === booking.roomId ? { ...r, status: RoomStatus.OCCUPIED, currentBookingId: booking.id } : r)
      : state.rooms
  })),

  checkIn: (bookingId) => set((state) => {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return state;
    
    return {
      bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CHECKED_IN } : b),
      rooms: state.rooms.map(r => r.id === booking.roomId ? { ...r, status: RoomStatus.OCCUPIED, currentBookingId: booking.id } : r)
    };
  }),

  checkOut: (bookingId) => set((state) => {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return state;

    return {
      bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: BookingStatus.CHECKED_OUT } : b),
      rooms: state.rooms.map(r => r.id === booking.roomId ? { ...r, status: RoomStatus.DIRTY, currentBookingId: null } : r)
    };
  }),

  addLedgerEntry: (entry) => set((state) => ({
    ledger: [...state.ledger, entry]
  })),

  createOrder: (order) => set((state) => {
    // If charged to room, verify and add to ledger automatically
    if (order.paymentStatus === 'CHARGED_TO_ROOM' && order.roomId) {
      const room = state.rooms.find(r => r.id === order.roomId);
      if (room && room.currentBookingId) {
        const entry: LedgerEntry = {
          id: uuid(),
          bookingId: room.currentBookingId,
          roomId: room.id,
          date: new Date().toISOString(),
          type: TransactionType.CHARGE_SERVICE,
          description: `Kitchen/Laundry Order #${order.id.substr(0,4)}`,
          amount: order.total,
          referenceId: order.id,
          createdBy: 'staff',
          isVoided: false
        };
        return {
          orders: [...state.orders, order],
          ledger: [...state.ledger, entry]
        };
      }
    }
    return { orders: [...state.orders, order] };
  }),

  updateRoomStatus: (roomId, status) => set((state) => ({
    rooms: state.rooms.map(r => r.id === roomId ? { ...r, status } : r)
  })),

  getRoomBalance: (bookingId) => {
    const entries = get().ledger.filter(l => l.bookingId === bookingId && !l.isVoided);
    
    let balance = 0;
    entries.forEach(e => {
      if (e.type === TransactionType.PAYMENT || e.type === TransactionType.REFUND) {
        balance -= e.amount;
      } else {
        balance += e.amount;
      }
    });
    return balance;
  }
}));