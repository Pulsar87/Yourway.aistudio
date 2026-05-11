import React from 'react';
import { useApp } from '../store/AppContext';
import { Shield, Car, Settings, LogOut, Star, Award, ChevronRight, Globe } from 'lucide-react';

const Profile = () => {
  const { state, dispatch, t } = useApp();
  const user = state.user;

  if (!user) return null;

  const toggleLanguage = () => {
    const newLang = state.language === 'en' ? 'ar' : 'en';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  const MenuLink = ({ icon: Icon, label, subtitle, onClick }: { icon: any, label: string, subtitle?: string, onClick?: () => void }) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 first:rounded-t-xl last:rounded-b-xl">
      <div className="flex items-center">
        <div className="text-gray-400 me-3">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 rtl:rotate-180" />
    </div>
  );

  return (
    <div className="pt-6 px-4 min-h-full bg-gray-50 pb-6">
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-3">
          <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
          {user.isVerified && (
            <div className="absolute bottom-0 end-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified">
              <Shield size={14} fill="currentColor" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <div className="flex items-center mt-1 text-gray-500 text-sm">
          <Star size={14} className="text-yellow-400 fill-current me-1" />
          <span>{user.rating} {t('profile.rating')}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ms-1">{t('profile.account')}</h3>
          <div className="rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden">
             <MenuLink icon={Shield} label={t('profile.verification')} subtitle={t('profile.verified')} />
             <MenuLink icon={Car} label={t('profile.vehicle')} subtitle={user.vehicle?.model} />
             <MenuLink icon={Award} label={t('profile.achievements')} subtitle="Super Driver" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ms-1">{t('profile.settings')}</h3>
          <div className="rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden">
             <MenuLink icon={Settings} label={t('profile.preferences')} />
             <MenuLink 
               icon={Globe} 
               label={t('profile.language')} 
               subtitle={state.language === 'en' ? 'English' : 'العربية'} 
               onClick={toggleLanguage}
             />
             <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer text-red-600">
               <div className="flex items-center">
                 <LogOut size={20} className="me-3" />
                 <span className="text-sm font-medium">{t('profile.logout')}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;