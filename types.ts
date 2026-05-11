
export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rating: number;
  avatarUrl: string;
  walletBalance: number;
  isVerified: boolean;
  vehicle?: {
    model: string;
    plate: string;
    color: string;
  };
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  origin: string;
  destination: string;
  departureTime: string; // ISO String
  price: number;
  totalSeats: number;
  availableSeats: number;
  description: string;
  distance: string;
  duration: string;
  coordinates: {
    start: [number, number];
    end: [number, number];
  };
  vehicle: {
    model: string;
    plate: string;
    color: string;
  };
  features: string[];
  stops?: { 
    id: string; 
    name: string; 
    coordinates?: [number, number]; 
  }[];
  status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seats: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
}

export interface Message {
  id: string;
  rideId: string; // Added to link message to a ride
  senderId: string;
  senderName: string;
  text: string;
  audioUrl?: string; // URL to the audio blob/file
  timestamp: string;
  isSystem?: boolean;
}

export interface ChatSession {
  id: string;
  rideId: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  rideDetails: {
    origin: string;
    dest: string;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  date: string;
}
