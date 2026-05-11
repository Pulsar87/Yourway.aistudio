
import { Ride, User, UserRole, ChatSession, Transaction } from '../types';

// Mock Current User
export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: UserRole.DRIVER,
  rating: 4.8,
  avatarUrl: 'https://picsum.photos/200',
  walletBalance: 145.50,
  isVerified: true,
  vehicle: {
    model: 'Tesla Model 3',
    plate: 'ABC-1234',
    color: 'White'
  }
};

// Mock Rides
export const MOCK_RIDES: Ride[] = [
  {
    id: 'r1',
    driverId: 'u1', // Changed to u1 (Current User)
    driverName: 'Alex Johnson', // Match current user
    driverAvatar: 'https://picsum.photos/200', // Match current user
    driverRating: 4.8,
    origin: 'Riyadh Park Mall',
    destination: 'King Khalid Airport',
    departureTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    price: 12.50,
    totalSeats: 4,
    availableSeats: 3,
    description: 'Quiet ride, AC on. Leaving promptly.',
    distance: '25 km',
    duration: '30 min',
    // Real coordinates: Riyadh Park -> KKIA
    coordinates: { start: [24.7555, 46.6304], end: [24.9576, 46.6988] },
    vehicle: {
      model: 'Tesla Model 3',
      plate: 'ABC-1234',
      color: 'White'
    },
    features: ['ac', 'quiet', 'smoke_free'],
    stops: [{ id: 's1', name: 'KAFD' }],
    status: 'SCHEDULED'
  },
  {
    id: 'r2',
    driverId: 'u3',
    driverName: 'Mike Ross',
    driverAvatar: 'https://picsum.photos/202',
    driverRating: 4.6,
    origin: 'Olaya Towers',
    destination: 'Princess Nourah Univ',
    departureTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    price: 8.00,
    totalSeats: 3,
    availableSeats: 1,
    description: 'Listening to jazz. Students welcome.',
    distance: '18 km',
    duration: '25 min',
    // Real coordinates: Olaya -> PNU
    coordinates: { start: [24.6968, 46.6805], end: [24.8469, 46.7250] },
    vehicle: {
      model: 'Honda Civic',
      plate: 'KLS-9012',
      color: 'Blue'
    },
    features: ['music', 'luggage'],
    status: 'SCHEDULED'
  },
  {
    id: 'r3',
    driverId: 'u4',
    driverName: 'Emily Blunt',
    driverAvatar: 'https://picsum.photos/203',
    driverRating: 5.0,
    origin: 'Digital City',
    destination: 'Boulevard City',
    departureTime: new Date(Date.now() + 18000000).toISOString(), // 5 hours from now
    price: 25.00,
    totalSeats: 4,
    availableSeats: 4,
    description: 'Plenty of trunk space for luggage.',
    distance: '12 km',
    duration: '20 min',
    // Real coordinates: Digital City -> Boulevard
    coordinates: { start: [24.7393, 46.6396], end: [24.7683, 46.6077] },
    vehicle: {
      model: 'Ford Explorer',
      plate: 'BXC-3344',
      color: 'Black'
    },
    features: ['ac', 'luggage', 'pets', 'music'],
    stops: [
      { id: 's2', name: 'Hotel Grand' },
      { id: 's3', name: 'Convention Center' }
    ],
    status: 'SCHEDULED'
  }
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    rideId: 'r1',
    participants: ['u1', 'u2'],
    lastMessage: 'I will be at the pick-up point in 5 mins.',
    lastMessageTime: new Date(Date.now() - 300000).toISOString(),
    rideDetails: { origin: 'Downtown', dest: 'Tech Park' }
  },
  {
    id: 'c2',
    rideId: 'r_old_1',
    participants: ['u1', 'u5'],
    lastMessage: 'Thanks for the ride!',
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    rideDetails: { origin: 'Home', dest: 'Office' }
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 12.50, type: 'DEBIT', description: 'Ride to Tech Park', date: '2023-10-25' },
  { id: 't2', amount: 50.00, type: 'CREDIT', description: 'Wallet Top-up', date: '2023-10-24' },
  { id: 't3', amount: 24.00, type: 'CREDIT', description: 'Earnings: Ride #4421', date: '2023-10-22' },
];
