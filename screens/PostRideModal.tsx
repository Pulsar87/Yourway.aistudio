
import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { generateRideDescription } from '../services/geminiService';
import { Ride } from '../types';
import LocationInput from '../components/LocationInput';

interface Props {
  onClose: () => void;
}

const AVAILABLE_FEATURES = ['ac', 'music', 'smoke_free', 'pets', 'quiet', 'luggage', 'women_only'];

const PostRideModal: React.FC<Props> = ({ onClose }) => {
  const { state, dispatch, t } = useApp();
  
  // Location State with Coordinates
  const [origin, setOrigin] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number]>([0, 0]);
  
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<[number, number]>([0, 0]);
  
  // Stops state now includes coordinates
  const [stops, setStops] = useState<{id: string, value: string, coords?: [number, number]}[]>([]);
  
  // Date & Time State
  const now = new Date();
  const future = new Date(now.getTime() + 60 * 60 * 1000); // Default to 1 hour from now
  const [date, setDate] = useState(future.toISOString().split('T')[0]);
  const [time, setTime] = useState(future.toTimeString().slice(0, 5));

  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('3');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Features State
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const handleGenerateDescription = async () => {
    if (!origin || !destination) return;
    setIsGenerating(true);
    const desc = await generateRideDescription(origin, destination, state.language);
    setDescription(desc);
    setIsGenerating(false);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleAddStop = () => {
    setStops([...stops, { id: Date.now().toString(), value: '' }]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter(s => s.id !== id));
  };

  const handleStopChange = (id: string, value: string, coords?: [number, number]) => {
    setStops(stops.map(s => s.id === id ? { ...s, value, coords } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return;

    // Use vehicle from profile, or fallback defaults if profile is incomplete
    const userVehicle = state.user.vehicle || {
      model: 'Generic Car',
      plate: 'NEW-RIDE',
      color: 'White'
    };

    // Combine date and time
    const departureDateTime = new Date(`${date}T${time}`);

    const newRide: Ride = {
      id: `r${Date.now()}`,
      driverId: state.user.id,
      driverName: state.user.name,
      driverAvatar: state.user.avatarUrl,
      driverRating: state.user.rating,
      origin,
      destination,
      departureTime: departureDateTime.toISOString(),
      price: parseFloat(price),
      totalSeats: parseInt(seats),
      availableSeats: parseInt(seats),
      description,
      distance: t('post.calc'),
      duration: t('post.calc'),
      // Use real coordinates selected from OSM
      coordinates: { start: originCoords, end: destCoords },
      vehicle: userVehicle,
      features: selectedFeatures,
      stops: stops
        .filter(s => s.value.trim() !== '')
        .map(s => ({ id: s.id, name: s.value, coordinates: s.coords }))
    };

    dispatch({ type: 'ADD_RIDE', payload: newRide });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center h-full pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90%] flex flex-col pointer-events-auto relative mx-auto">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{t('post.title')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-5 space-y-6">
            
            {/* Route Section */}
            <div className="space-y-3 relative">
              
              {/* Origin Input */}
              <div className="relative z-30">
                <LocationInput
                    label={t('post.from')}
                    value={origin}
                    onChange={(val, coords) => {
                    setOrigin(val);
                    if (coords) setOriginCoords(coords);
                    }}
                    iconColor="text-indigo-500"
                    required
                />
              </div>

              {/* Stops */}
              {stops.map((stop, index) => (
                <div key={stop.id} className="relative z-20 flex items-start animate-in slide-in-from-top-2 duration-200 group">
                  {/* Stop Indicator Dot */}
                  <div className="absolute start-3 top-3.5 w-[18px] flex justify-center z-10 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  
                  {/* Location Input wrapper to handle flex growth properly */}
                  <div className="flex-1">
                      <LocationInput
                        label={t('post.stop_label')}
                        value={stop.value}
                        onChange={(val, coords) => handleStopChange(stop.id, val, coords)}
                        iconColor="text-transparent" // Hide default icon, we use the custom dot above
                      />
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleRemoveStop(stop.id)}
                    className="absolute end-10 top-1 p-2 text-gray-400 hover:text-red-500 transition-colors z-30"
                    style={{ right: '10px' }} // Fallback for RTL/LTR issues if needed, though Tailwind end-10 works
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="text-xs font-semibold text-indigo-600 flex items-center hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  <Plus size={14} className="me-1" />
                  {t('post.add_stop')}
                </button>
              </div>

              {/* Destination Input */}
              <div className="relative z-10">
                <LocationInput
                    label={t('post.to')}
                    value={destination}
                    onChange={(val, coords) => {
                    setDestination(val);
                    if (coords) setDestCoords(coords);
                    }}
                    iconColor="text-secondary"
                    required
                />
              </div>
              
              {/* Connector Line visual */}
              <div className="absolute start-[19px] top-6 bottom-12 w-0.5 bg-gray-200 -z-0 pointer-events-none"></div>
            </div>

            {/* Date & Time */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t('post.date')}</label>
                <div className="relative">
                  <Calendar className="absolute start-3 top-3 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    className="w-full ps-10 pe-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t('post.time')}</label>
                <div className="relative">
                  <Clock className="absolute start-3 top-3 text-gray-400" size={18} />
                  <input
                    type="time"
                    required
                    className="w-full ps-10 pe-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Price & Seats */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t('post.price')}</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t('post.seats')}</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none appearance-none"
                  value={seats}
                  onChange={e => setSeats(e.target.value)}
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Amenities Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('ride.features.title')}</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FEATURES.map(feature => {
                  const isSelected = selectedFeatures.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {/* @ts-ignore */}
                      {t(`feature.${feature}`) || feature}
                      {isSelected && <Check size={12} className="ms-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('post.desc')}</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={!origin || !destination || isGenerating}
                  className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin me-1" /> : <Sparkles size={12} className="me-1" />}
                  {t('post.ai_btn')}
                </button>
              </div>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none h-24 resize-none"
                placeholder={t('post.placeholder')}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              {t('post.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostRideModal;
