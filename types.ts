// Enums for strict status control
export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  CHARGE_ROOM = 'CHARGE_ROOM',      // Nightly rate
  CHARGE_SERVICE = 'CHARGE_SERVICE', // Laundry, Kitchen, Extra
  PAYMENT = 'PAYMENT',              // Cash, Card
  REFUND = 'REFUND',
  CORRECTION = 'CORRECTION'         // Reversal
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  POS = 'POS'
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN', // Manager/Accountant
  FRONT_DESK = 'FRONT_DESK',
  KITCHEN = 'KITCHEN',
  LAUNDRY = 'LAUNDRY',
}

// Entity Interfaces

export interface Room {
  id: string;
  number: string;
  type: string;
  rate: number;
  status: RoomStatus;
  currentBookingId?: string | null;
}

export interface Guest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string; // Passport or National ID
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  checkInDate: string; // ISO Date
  checkOutDate: string; // ISO Date
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

// The Ledger / Room Tab Source of Truth
export interface LedgerEntry {
  id: string;
  bookingId: string;
  roomId: string; // Redundant but useful for indexing
  date: string; // ISO DateTime
  type: TransactionType;
  description: string;
  amount: number; // Positive for charges, Negative for payments
  referenceId?: string; // Link to Order ID or Payment ID
  createdBy: string; // User ID
  isVoided: boolean;
}

// Expenses
export type ExpenseCategory = 'KITCHEN' | 'LAUNDRY' | 'ROOMS' | 'UTILITIES' | 'SALARY' | 'OTHER';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  recordedBy: string;
}

// Kitchen & Laundry Orders
export interface ServiceItem {
  id: string;
  name: string;
  category: 'FOOD' | 'DRINK' | 'LAUNDRY' | 'OTHER';
  price: number;
}

export interface ServiceOrder {
  id: string;
  roomId: string; // Can be null if Walk-in (POS)
  items: { itemId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'DELIVERED';
  paymentStatus: 'PAID' | 'CHARGED_TO_ROOM';
  createdAt: string;
}

// App Settings (Persisted)
export interface AppSettings {
  appName: string;
  currencySymbol: string;
  taxRate: number; // Percentage
  primaryColor: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
}

// Stats for Dashboard
export interface DashboardStats {
  occupancyRate: number;
  todayRevenue: number;
  pendingOrders: number;
  roomsAvailable: number;
}