
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ChevronRight, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const Messages = () => {
  const { state, t } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const currentUser = state.user;

  if (!currentUser) return null;

  // 1. Find rides where current user is the driver
  const drivenRides = state.rides.filter(r => r.driverId === currentUser.id);

  // 2. Find rides where current user is a passenger
  const myBookingRideIds = state.bookings
    .filter(b => b.passengerId === currentUser.id)
    .map(b => b.rideId);
  
  const passengerRides = state.rides.filter(r => myBookingRideIds.includes(r.id));

  // 3. Combine and deduplicate rides
  const allMyRides = [...drivenRides, ...passengerRides].filter((ride, index, self) => 
    index === self.findIndex((r) => r.id === ride.id)
  );

  // 4. Sort by departure time (newest first)
  allMyRides.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());

  // 5. Filter based on tab
  const displayedRides = allMyRides.filter(ride => {
    const isFinished = ride.status === 'COMPLETED' || ride.status === 'CANCELLED';
    if (activeTab === 'active') {
      return !isFinished; // SCHEDULED or ONGOING
    } else {
      return isFinished; // COMPLETED or CANCELLED
    }
  });

  return (
    <div className="pt-6 px-4 min-h-full bg-white pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('messages.title')}</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Clock size={16} className="me-2" />
          {t('messages.tab.active')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <CheckCircle size={16} className="me-2" />
          {t('messages.tab.history')}
        </button>
      </div>

      <div className="space-y-1">
        {displayedRides.length > 0 ? (
          displayedRides.map(ride => {
            const isDriver = ride.driverId === currentUser.id;
            const rideDate = new Date(ride.departureTime);
            const formattedTime = rideDate.toLocaleDateString() === new Date().toLocaleDateString()
              ? rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : rideDate.toLocaleDateString();

            const lastMessage = state.messages
                .filter(m => m.rideId === ride.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return (
              <div 
                key={ride.id} 
                onClick={() => navigate(`/chat/${ride.id}`)}
                className="flex items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="relative me-4">
                  {isDriver ? (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                      <MessageSquare size={20} />
                    </div>
                  ) : (
                    <img 
                      src={ride.driverAvatar} 
                      alt={ride.driverName} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-100" 
                    />
                  )}
                  
                  <div className={`absolute bottom-0 end-0 w-3 h-3 border-2 border-white rounded-full ${
                    ride.status === 'ONGOING' ? 'bg-green-500' : 
                    ride.status === 'COMPLETED' ? 'bg-gray-400' : 'bg-indigo-500'
                  }`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate pe-2">
                      {t('messages.ride_to')} {ride.destination}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formattedTime}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate flex items-center">
                    {isDriver ? (
                      <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] me-2 uppercase tracking-wide">
                        DRIVER
                      </span>
                    ) : (
                      <span className="text-gray-400 me-1">
                        {ride.driverName}:
                      </span>
                    )}
                    <span className="truncate">
                      {lastMessage ? lastMessage.text : (
                        ride.status === 'SCHEDULED' ? (isDriver ? 'Waiting for passengers...' : 'Chat with driver') :
                        ride.status === 'ONGOING' ? 'Ride in progress' : 'Ride completed'
                      )}
                    </span>
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 ms-2 rtl:rotate-180 shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              {activeTab === 'active' ? <Clock size={24} /> : <CheckCircle size={24} />}
            </div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'active' ? 'No active conversations.' : 'No chat history.'}
            </p>
            {activeTab === 'active' && <p className="text-gray-400 text-xs mt-1">Book a ride to start chatting!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
