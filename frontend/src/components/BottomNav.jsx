import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Tv, CheckSquare, ArrowLeftRight, Wallet } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ads', label: 'Watch Ads', icon: Tv, badge: '+10' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'exchange', label: 'Swap', icon: ArrowLeftRight },
    { id: 'withdraw', label: 'Wallet', icon: Wallet }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 z-40">
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl px-2 py-2 shadow-2xl shadow-indigo-950/40 glow-card">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold shadow-md shadow-indigo-500/40 glow-primary scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-semibold'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.badge && !isActive && (
                    <span className="absolute -top-2 -right-3.5 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-black text-white rounded-full leading-tight shadow-sm shadow-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
