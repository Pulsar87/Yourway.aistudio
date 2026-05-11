
import React, { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import MyRides from './screens/MyRides';
import Messages from './screens/Messages';
import ChatWindow from './screens/ChatWindow';
import Wallet from './screens/Wallet';
import Profile from './screens/Profile';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { state, t } = useApp();

  useEffect(() => {
    // Dynamically set the direction attribute on the body or root
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.language;
    document.title = t('app.name');
  }, [state.language, t]);

  return (
    <div 
      className="max-w-md mx-auto bg-gray-50 h-screen flex flex-col relative shadow-2xl overflow-hidden" 
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex-1 overflow-y-auto no-scrollbar relative w-full">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rides" element={<MyRides />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:rideId" element={<ChatWindow />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
};

export default App;
