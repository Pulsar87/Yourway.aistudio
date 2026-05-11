import React from 'react';
import { Clock, Users, Star } from 'lucide-react';
import { Ride } from '../types';
import { useApp } from '../store/AppContext';

interface RideCardProps {
  ride: Ride;
  onClick?: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onClick }) => {
  const { t } = useApp();
  const formattedDate = new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform duration-200 cursor-pointer mb-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={ride.driverAvatar} alt={ride.driverName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">{ride.driverName}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Star size={12} className="text-yellow-400 fill-current me-1" />
              {ride.driverRating} • {ride.distance}
            </div>
          </div>
        </div>
        <div className="text-end">
          <span className="block text-lg font-bold text-indigo-600">${ride.price}</span>
          <span className="text-xs text-gray-400">{t('ride.per_seat')}</span>
        </div>
      </div>

      <div className="relative ps-4 border-s-2 border-indigo-100 ms-2 space-y-4 my-4">
        <div className="relative">
          <div className="absolute -start-[21px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
          <p className="text-sm font-medium text-gray-900">{ride.origin}</p>
        </div>
        <div className="relative">
          <div className="absolute -start-[21px] top-1 w-3 h-3 bg-secondary rounded-full border-2 border-white"></div>
          <p className="text-sm font-medium text-gray-900">{ride.destination}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            <Clock size={14} className="me-1" />
            {formattedDate}
          </div>
          <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            <Users size={14} className="me-1" />
            {ride.availableSeats}/{ride.totalSeats} {t('ride.seats')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideCard;