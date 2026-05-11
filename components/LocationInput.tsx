
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { searchLocations } from '../services/mapService';
import { useApp } from '../store/AppContext';

interface LocationInputProps {
  label: string; // Placeholder/Label
  value: string;
  onChange: (value: string, coords?: [number, number]) => void;
  iconColor?: string;
  required?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, value, onChange, iconColor = "text-indigo-500", required }) => {
  const { t } = useApp();
  const [suggestions, setSuggestions] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const results = await searchLocations(text);
      setSuggestions(results);
      setIsLoading(false);
    }, 800); // 800ms debounce
  };

  const handleSelectLocation = (item: { name: string; lat: number; lon: number }) => {
    onChange(item.name, [item.lat, item.lon]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('', undefined);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative z-20">
      <div className="relative">
        <MapPin className={`absolute start-3 top-3.5 ${iconColor}`} size={18} />
        <input
          required={required}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          className={`w-full ps-10 pe-10 py-3 bg-gray-50 rounded-xl border focus:ring-1 transition-all outline-none ${
            showSuggestions && suggestions.length > 0 
              ? 'rounded-b-none border-indigo-500 ring-indigo-500' 
              : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          placeholder={label}
        />
        
        {isLoading && (
          <div className="absolute end-3 top-3.5 text-gray-400">
             <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        
        {!isLoading && value && (
          <button 
            type="button"
            onClick={handleClear}
            className="absolute end-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-indigo-500 rounded-b-xl shadow-lg max-h-60 overflow-y-auto z-50">
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectLocation(item)}
              className="w-full text-start px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start transition-colors"
            >
              <MapPin size={16} className="mt-0.5 me-2 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 leading-tight">{item.name}</span>
            </button>
          ))}
          <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-400 text-end">
            Powered by OSM
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
