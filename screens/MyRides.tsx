
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import RideCard from '../components/RideCard';
import RideDetailsModal from './RideDetailsModal';
import { Ride } from '../types';
import { Calendar, History, Trash2, Play, Activity, CheckCircle, AlertTriangle, X } from 'lucide-react';

const MyRides = () => {
  const { state, dispatch, t } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'start' | 'complete' | 'remove' | null;
    rideId: string | null;
  }>({ isOpen: false, type: null, rideId: null });

  // Filter rides where user is driver OR user has a confirmed booking
  const bookedRideIds = state.bookings
    .filter(b => b.passengerId === state.user?.id)
    .map(b => b.rideId);

  const myRides = state.rides.filter(ride => 
    ride.driverId === state.user?.id || bookedRideIds.includes(ride.id)
  );

  const displayedRides = myRides.filter(ride => {
    const status = ride.status || 'SCHEDULED';
    const departureTime = new Date(ride.departureTime).getTime();
    const now = new Date().getTime();
    const isPast = departureTime < now;

    if (activeTab === 'upcoming') {
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      if (status === 'ONGOING') return true;
      if (status === 'SCHEDULED' && !isPast) return true;
      return false;
    } else {
      if (status === 'COMPLETED' || status === 'CANCELLED') return true;
      if (status === 'SCHEDULED' && isPast) return true;
      return false;
    }
  });

  const promptConfirm = (type: 'start' | 'complete' | 'remove', rideId: string) => {
    setConfirmModal({ isOpen: true, type, rideId });
  };

  const executeAction = () => {
    const { type, rideId } = confirmModal;
    if (!rideId || !type) return;

    if (type === 'start') {
      dispatch({ type: 'START_RIDE', payload: rideId });
    } else if (type === 'complete') {
      dispatch({ type: 'COMPLETE_RIDE', payload: rideId });
      setActiveTab('history');
    } else if (type === 'remove') {
      dispatch({ type: 'REMOVE_RIDE', payload: rideId });
    }
    
    setConfirmModal({ isOpen: false, type: null, rideId: null });
  };

  return (
    <div className="pt-6 px-4 min-h-full bg-gray-50 pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('rides.title')}</h1>

      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Calendar size={16} className="me-2" />
          {t('rides.tab.upcoming')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          <History size={16} className="me-2" />
          {t('rides.tab.history')}
        </button>
      </div>

      <div className="space-y-6">
        {displayedRides.length > 0 ? (
          displayedRides.map(ride => {
            const isDriver = ride.driverId === state.user?.id;
            const isOngoing = ride.status === 'ONGOING';
            const isCompleted = ride.status === 'COMPLETED';
            const isCancelled = ride.status === 'CANCELLED';
            
            const userBookings = state.bookings.filter(b => b.rideId === ride.id && b.passengerId === state.user?.id);
            const totalBookedSeats = userBookings.reduce((sum, booking) => sum + booking.seats, 0);

            return (
              <div key={ride.id} className="relative">
                <div className={`absolute top-4 end-4 text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm border flex items-center ${
                  isOngoing 
                    ? 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse' 
                    : isCompleted
                      ? 'bg-gray-100 text-gray-600 border-gray-200'
                      : isCancelled
                        ? 'bg-red-100 text-red-600 border-red-200'
                        : isDriver 
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                          : 'bg-green-100 text-green-700 border-green-200'
                }`}>
                  {isOngoing && <Activity size={10} className="me-1" />}
                  {isOngoing 
                    ? t('ride.status.ongoing')
                    : isCompleted
                      ? 'DONE'
                      : isCancelled
                        ? 'CANCELLED'
                        : isDriver 
                          ? 'DRIVER' 
                          : `${t('rides.confirmed')} • ${totalBookedSeats} ${t('ride.seats')}`
                  }
                </div>
                
                <RideCard 
                  ride={ride} 
                  onClick={() => setSelectedRide(ride)}
                />
                
                {/* Driver Actions */}
                {isDriver && activeTab === 'upcoming' && (
                  <div className="flex gap-3 -mt-2 mb-4">
                    {isOngoing ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          promptConfirm('complete', ride.id);
                        }}
                        className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        <CheckCircle size={16} className="me-2" />
                        {t('ride.action.complete')}
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          promptConfirm('start', ride.id);
                        }}
                        className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        <Play size={16} className="me-2" />
                        {t('ride.action.start')}
                      </button>
                    )}
                    
                    {!isOngoing && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          promptConfirm('remove', ride.id);
                        }}
                        className="flex items-center justify-center bg-white text-red-600 border border-gray-200 hover:bg-red-50 py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'upcoming' ? <Calendar className="text-gray-400" /> : <History className="text-gray-400" />}
            </div>
            <p className="text-gray-500 font-medium">{t('rides.empty_history')}</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 relative z-10">
            <button 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                confirmModal.type === 'remove' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                {confirmModal.type === 'remove' ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmModal.type === 'start' && t('ride.action.start')}
                {confirmModal.type === 'complete' && t('ride.action.complete')}
                {confirmModal.type === 'remove' && t('ride.action.cancel')}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {confirmModal.type === 'start' && t('ride.confirm.start')}
                {confirmModal.type === 'complete' && t('ride.confirm.complete')}
                {confirmModal.type === 'remove' && t('ride.confirm.cancel')}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeAction}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg ${
                    confirmModal.type === 'remove' 
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRide && (
        <RideDetailsModal 
          ride={selectedRide} 
          onClose={() => setSelectedRide(null)} 
        />
      )}
    </div>
  );
};

export default MyRides;
