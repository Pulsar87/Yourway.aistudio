
import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Star, Wind, Music, CigaretteOff, PawPrint, VolumeX, Briefcase, Plus, Minus, Loader2, User } from 'lucide-react';
import { Ride, Booking } from '../types';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';

// Declare Leaflet globally since we loaded it via CDN
declare const L: any;

interface Props {
  ride: Ride;
  onClose: () => void;
}

const RideDetailsModal: React.FC<Props> = ({ ride, onClose }) => {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const isDriver = state.user?.id === ride.driverId;
  const existingBooking = state.bookings.find(b => b.rideId === ride.id && b.passengerId === state.user?.id);
  const isBooked = !!existingBooking;
  
  // Initialize seats: 0 if none available, otherwise 1
  const [selectedSeats, setSelectedSeats] = useState(ride.availableSeats > 0 ? 1 : 0);
  const [isBooking, setIsBooking] = useState(false);
  
  const isSoldOut = ride.availableSeats === 0;
  const isPastOrCompleted = ride.status === 'COMPLETED' || ride.status === 'CANCELLED';

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !ride.coordinates) return;

    // Wait for div to be available
    const mapInstance = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    // Custom Icons
    const startIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #6366f1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const endIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const startCoords = ride.coordinates.start;
    const endCoords = ride.coordinates.end;

    L.marker(startCoords, { icon: startIcon }).addTo(mapInstance);
    L.marker(endCoords, { icon: endIcon }).addTo(mapInstance);

    // Draw line
    const latlngs = [startCoords, endCoords];
    const polyline = L.polyline(latlngs, { color: '#6366f1', weight: 3, dashArray: '10, 10', opacity: 0.7 }).addTo(mapInstance);

    // Fit bounds
    mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => {
      mapInstance.remove();
    };
  }, [ride]);

  const getFeatureIcon = (feature: string) => {
    switch(feature) {
      case 'ac': return <Wind size={16} />;
      case 'music': return <Music size={16} />;
      case 'smoke_free': return <CigaretteOff size={16} />;
      case 'pets': return <PawPrint size={16} />;
      case 'quiet': return <VolumeX size={16} />;
      case 'luggage': return <Briefcase size={16} />;
      case 'women_only': return <User size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getFeatureLabel = (feature: string) => {
    // @ts-ignore
    return t(`feature.${feature}`) || feature;
  };

  const handleIncrement = () => {
    if (selectedSeats < ride.availableSeats) {
      setSelectedSeats(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedSeats > 1) {
      setSelectedSeats(prev => prev - 1);
    }
  };

  const handleBook = async () => {
    if (!state.user || isSoldOut || selectedSeats <= 0 || isDriver || isBooked) return;
    
    setIsBooking(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      rideId: ride.id,
      passengerId: state.user.id,
      seats: selectedSeats,
      totalPrice: ride.price * selectedSeats,
      status: 'CONFIRMED',
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    
    setIsBooking(false);
    onClose();
    navigate('/rides');
  };

  const totalPrice = (ride.price * selectedSeats).toFixed(2);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none h-full">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-md h-[90%] sm:h-auto sm:max-h-[90%] rounded-t-3xl sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 relative mx-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">{t('ride.details.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-32">
          
          {/* Map Container */}
          <div className="h-48 w-full bg-gray-100 relative z-0">
            <div ref={mapRef} className="w-full h-full" id="ride-map"></div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-[400]"></div>
          </div>

          <div className="p-5 space-y-6">
            {/* Route Visual */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-start relative">
                  {/* Timeline Line */}
                  <div className="absolute start-[5.5px] top-3 bottom-8 w-0.5 bg-gray-200"></div>

                  <div className="w-full space-y-6">
                    {/* Origin */}
                    <div className="flex items-start relative">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm ring-1 ring-indigo-100 mt-1.5 z-10 shrink-0 me-4"></div>
                      <div>
                          <p className="text-xs text-gray-500 mb-0.5">{new Date(ride.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          <p className="font-bold text-gray-900 text-lg leading-none">{ride.origin}</p>
                      </div>
                    </div>

                    {/* Stops */}
                    {ride.stops && ride.stops.map(stop => (
                      <div key={stop.id} className="flex items-start relative">
                          <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white mt-1.5 z-10 shrink-0 me-4.5 ms-0.5"></div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">{t('post.stop_label')}</p>
                            <p className="font-medium text-gray-700 text-sm">{stop.name}</p>
                          </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div className="flex items-start relative">
                      <div className="w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-sm ring-1 ring-emerald-100 mt-1.5 z-10 shrink-0 me-4"></div>
                      <div>
                          <p className="text-xs text-gray-500 mb-0.5">{ride.duration}</p>
                          <p className="font-bold text-gray-900 text-lg leading-none">{ride.destination}</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Price & Seat Selection - Only show if not driver and not past */}
            {!isDriver && !isPastOrCompleted && !isBooked && (
              <div className="flex gap-4">
                {/* Price Per Seat Card */}
                <div className="flex-1 bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-indigo-100">
                  <span className="text-2xl font-bold text-indigo-700">${ride.price}</span>
                  <span className="text-xs text-indigo-400 font-medium">{t('ride.per_seat')}</span>
                </div>

                {/* Seat Selector Card */}
                <div className={`flex-1 bg-white rounded-xl p-3 flex flex-col items-center justify-center border-2 ${isSoldOut ? 'border-gray-100 opacity-60' : 'border-indigo-100 shadow-sm'}`}>
                  <span className="text-xs text-gray-500 font-medium mb-2">{t('ride.select_seats')}</span>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <button 
                        onClick={handleDecrement}
                        disabled={selectedSeats <= 1 || isSoldOut}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-xl font-bold text-gray-900 min-w-[20px] text-center">{selectedSeats}</span>
                      <button 
                        onClick={handleIncrement}
                        disabled={selectedSeats >= ride.availableSeats || isSoldOut}
                        className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {isSoldOut ? t('ride.sold_out') : `${ride.availableSeats} ${t('ride.seats')} available`}
                  </div>
                </div>
              </div>
            )}
            
            {/* If booked, show booking summary */}
            {isBooked && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-green-800 font-bold text-sm">{t('rides.confirmed')}</p>
                <p className="text-green-600 text-xs mt-1">
                  {existingBooking.seats} {t('ride.seats')} • ${existingBooking.totalPrice}
                </p>
              </div>
            )}

            {/* Vehicle Info */}
            {ride.vehicle && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t('ride.vehicle_info')}</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">{ride.vehicle.model}</h4>
                        <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded border border-gray-200">{ride.vehicle.plate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-4 h-4 rounded-full border border-gray-300 me-2" style={{ backgroundColor: ride.vehicle.color?.toLowerCase() || '#ccc' }}></div>
                        {ride.vehicle.color}
                    </div>
                </div>
              </div>
            )}

            {/* Features / Amenities */}
            {ride.features && ride.features.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t('ride.features.title')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ride.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-indigo-500 me-2">
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{getFeatureLabel(feature)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Driver Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t('ride.driver_info')}</h3>
              <div className="flex items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="relative me-3">
                    <img src={ride.driverAvatar} className="w-12 h-12 rounded-full object-cover" alt="Driver" />
                    <div className="absolute -bottom-1 -end-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                        <Shield size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-900">{ride.driverName}</h4>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                          <Star size={12} className="text-yellow-500 fill-current me-1" />
                          <span className="text-xs font-bold text-yellow-700">{ride.driverRating}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('profile.verified')}</p>
                  </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{t('ride.about_ride')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                {ride.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action - Hide if driver or past */}
        {!isDriver && !isPastOrCompleted && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
             <button 
               onClick={handleBook}
               disabled={isSoldOut || isBooking || isBooked}
               className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center ${
                 (isSoldOut || isBooked)
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                   : 'bg-indigo-600 text-white shadow-indigo-200 active:scale-[0.98]'
               }`}
             >
               {isBooking ? (
                 <>
                   <Loader2 size={20} className="animate-spin me-2" />
                   {t('post.calc')}
                 </>
               ) : (
                 <span>
                   {isBooked 
                     ? t('rides.confirmed') 
                     : isSoldOut 
                       ? t('ride.sold_out') 
                       : `${t('ride.book_btn')} $${totalPrice}`}
                 </span>
               )}
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RideDetailsModal;
