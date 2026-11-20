import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Target, Calendar, User } from 'lucide-react';

export default function FoxBottomNav() {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'tasks', label: 'TASKS', icon: Target },
    { id: 'activity', label: 'ACTIVITY', icon: Calendar },
    { id: 'profile', label: 'PROFILE', icon: User }
  ];

  return (
    <>
      {/* Bottom Sticky Navigation (4 Tabs: HOME, TASKS, ACTIVITY, PROFILE) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0A0C10]/95 backdrop-blur-md border-t border-white/5 py-2 px-2 z-50 select-none">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform ${
                      isActive
                        ? 'text-[#FF6128] scale-105 stroke-[2.2]'
                        : 'text-gray-500 group-hover:text-gray-300 stroke-[1.8]'
                    }`}
                  />
                </div>

                <span
                  className={`text-[10px] font-black tracking-wider mt-1 ${
                    isActive ? 'text-[#FF6128]' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {item.label}
                </span>

                {/* Orange Horizontal Line Indicator for Active Tab */}
                <div
                  className={`h-0.5 rounded-full transition-all mt-1 ${
                    isActive ? 'w-6 bg-[#FF6128]' : 'w-0 bg-transparent'
                  }`}
                ></div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
