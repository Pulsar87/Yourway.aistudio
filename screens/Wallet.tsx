import React from 'react';
import { useApp } from '../store/AppContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';

const Wallet = () => {
  const { state, t } = useApp();
  const balance = state.user?.walletBalance || 0;

  return (
    <div className="pt-6 px-4 min-h-full bg-gray-50 pb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('wallet.title')}</h1>

      {/* Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
        <div className="absolute top-0 end-0 p-4 opacity-10">
          <CreditCard size={120} />
        </div>
        <p className="text-indigo-200 text-sm font-medium mb-1">{t('wallet.total_balance')}</p>
        <h2 className="text-4xl font-bold mb-6">${balance.toFixed(2)}</h2>
        
        <div className="flex space-x-3 rtl:space-x-reverse">
          <button className="flex-1 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-white/30 transition">
            <Plus size={16} className="me-2" /> {t('wallet.top_up')}
          </button>
          <button className="flex-1 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg flex items-center justify-center text-sm font-semibold hover:bg-white/30 transition">
            <ArrowUpRight size={16} className="me-2" /> {t('wallet.payout')}
          </button>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 mb-4">{t('wallet.recent_transactions')}</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {state.transactions.map(tItem => (
          <div key={tItem.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center me-3 ${
                tItem.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {tItem.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                    {tItem.description === 'Ride to Tech Park' ? `${t('wallet.debit')} Tech Park` : 
                     tItem.description === 'Wallet Top-up' ? t('wallet.credit') : 
                     tItem.description.includes('Earnings') ? `${t('wallet.earnings')}: ${tItem.description.split(':')[1]}` :
                     tItem.description}
                </p>
                <p className="text-xs text-gray-400">{tItem.date}</p>
              </div>
            </div>
            <span className={`font-bold ${tItem.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
              {tItem.type === 'CREDIT' ? '+' : '-'}${tItem.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wallet;