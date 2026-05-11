
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Ride, Booking, ChatSession, Transaction, Message } from '../types';
import { MOCK_RIDES, MOCK_USER, MOCK_CHATS, MOCK_TRANSACTIONS } from '../services/mockService';
import { translations, Language } from '../utils/translations';

interface AppState {
  user: User | null;
  rides: Ride[];
  bookings: Booking[];
  chats: ChatSession[];
  messages: Message[]; // Store all messages
  transactions: Transaction[];
  isLoading: boolean;
  language: Language;
}

type Action =
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_RIDE'; payload: Ride }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'REMOVE_RIDE'; payload: string }
  | { type: 'START_RIDE'; payload: string }
  | { type: 'COMPLETE_RIDE'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: Message };

// Mock Initial Messages
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', rideId: 'r1', senderId: 'u1', senderName: 'Alex Johnson', text: 'I will be leaving exactly on time!', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'm2', rideId: 'r1', senderId: 'u2', senderName: 'Passenger 1', text: 'Great, see you there.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

const initialState: AppState = {
  user: MOCK_USER,
  rides: MOCK_RIDES,
  bookings: [],
  chats: MOCK_CHATS,
  messages: MOCK_MESSAGES,
  transactions: MOCK_TRANSACTIONS,
  isLoading: false,
  language: 'ar', // Default language
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  t: (key: keyof typeof translations['en']) => string;
} | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_RIDE':
      return { ...state, rides: [action.payload, ...state.rides] };
    case 'ADD_BOOKING':
      // When booking, add the booking AND update the ride's seat count
      const updatedRides = state.rides.map(ride => {
        if (ride.id === action.payload.rideId) {
          return { 
            ...ride, 
            availableSeats: Math.max(0, ride.availableSeats - action.payload.seats) 
          };
        }
        return ride;
      });
      return { 
        ...state, 
        bookings: [...state.bookings, action.payload],
        rides: updatedRides
      };
    case 'REMOVE_RIDE':
      return {
        ...state,
        rides: state.rides.filter(r => r.id !== action.payload)
      };
    case 'START_RIDE':
      return {
        ...state,
        rides: state.rides.map(r => r.id === action.payload ? { ...r, status: 'ONGOING' } : r)
      };
    case 'COMPLETE_RIDE':
      return {
        ...state,
        rides: state.rides.map(r => r.id === action.payload ? { ...r, status: 'COMPLETED' } : r)
      };
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const t = (key: keyof typeof translations['en']) => {
    return translations[state.language][key] || key;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
