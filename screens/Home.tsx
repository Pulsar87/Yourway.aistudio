
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import RideCard from '../components/RideCard';
import PostRideModal from './PostRideModal';
import RideDetailsModal from './RideDetailsModal';
import { Ride } from '../types';

const Home = () => {
  const { state, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter Configuration
  const FILTERS = [
    { id: 'all', labelKey: 'home.filter.all' },
    { id: 'today', labelKey: 'home.filter.today' },
    { id: 'tomorrow', labelKey: 'home.filter.tomorrow' },
    { id: 'women_only', labelKey: 'feature.women_only' },
    { id: 'ac', labelKey: 'feature.ac' },
    { id: 'luggage', labelKey: 'feature.luggage' },
    { id: 'smoke_free', labelKey: 'feature.smoke_free' },
    { id: 'pets', labelKey: 'feature.pets' },
    { id: 'music', labelKey: 'feature.music' },
  ];

  // Helper to check if two dates are the same day
  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const filteredRides = state.rides.filter(ride => {
    // 1. Search Term Logic
    const matchesSearch = 
      ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.origin.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter Logic
    if (activeFilter === 'all') return true;

    const rideDate = new Date(ride.departureTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (activeFilter === 'today') {
      return isSameDate(rideDate, today);
    }

    if (activeFilter === 'tomorrow') {
      return isSameDate(rideDate, tomorrow);
    }

    // Feature Filters
    if (ride.features && ride.features.includes(activeFilter)) {
      return true;
    }

    return false;
  });

  return (
    <div className="pt-4 px-4 min-h-full bg-gray-50 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('home.title')}</h1>
          <p className="text-sm text-gray-500">{t('home.subtitle')}</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
          {state.user?.name.charAt(0)}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('home.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white ps-10 pe-4 py-3 rounded-xl shadow-sm border-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <button className="bg-white p-3 rounded-xl shadow-sm text-gray-600">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto no-scrollbar mb-6 pb-1">
        {FILTERS.map((filter) => (
          <button 
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {/* @ts-ignore */}
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      {/* Ride List */}
      <div className="space-y-4">
        <h2 className="font-bold text-gray-800 text-lg flex items-center">
          {t('home.available_rides')}
          {activeFilter !== 'all' && (
            <span className="ms-2 text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {filteredRides.length}
            </span>
          )}
        </h2>
        {filteredRides.length > 0 ? (
          filteredRides.map(ride => (
            <RideCard key={ride.id} ride={ride} onClick={() => setSelectedRide(ride)} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <SlidersHorizontal size={24} />
            </div>
            <p className="text-gray-900 font-medium">{t('home.no_rides')}</p>
            <p className="text-gray-500 text-sm mt-1">Try changing your filters</p>
            <button 
              onClick={() => {setActiveFilter('all'); setSearchTerm('');}}
              className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* FAB - Fixed position to stay visible during scroll, above bottom nav */}
      <button 
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-[80px] end-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 active:scale-95 transition-all z-40"
      >
        <Plus size={24} />
      </button>

      {isPostModalOpen && <PostRideModal onClose={() => setIsPostModalOpen(false)} />}
      
      {selectedRide && (
        <RideDetailsModal 
          ride={selectedRide} 
          onClose={() => setSelectedRide(null)} 
        />
      )}
    </div>
  );
};

export default Home;
