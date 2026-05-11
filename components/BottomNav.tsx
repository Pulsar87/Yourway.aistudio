
import React from 'react';
import { Home, MapPin, MessageSquare, Wallet, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const BottomNav = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { id: 'home', icon: Home, label: t('nav.feed'), path: '/' },
    { id: 'rides', icon: MapPin, label: t('nav.rides'), path: '/rides' },
    { id: 'messages', icon: MessageSquare, label: t('nav.chat'), path: '/messages' },
    { id: 'wallet', icon: Wallet, label: t('nav.wallet'), path: '/wallet' },
    { id: 'profile', icon: UserIcon, label: t('nav.profile'), path: '/profile' },
  ];

  return (
    <div className="bg-white border-t border-gray-200 pb-safe-area z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
