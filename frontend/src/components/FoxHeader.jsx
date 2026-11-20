import React from 'react';
import { useApp } from '../context/AppContext';
import { Headphones, Plus } from 'lucide-react';

export default function FoxHeader() {
  const { user, setActiveTab } = useApp();

  return (
    <div className="pt-2 px-4 pb-2 select-none">
      {/* User Profile Row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-3">
          {/* Perfectly Round Circular Avatar with Orange Glow Ring */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#FF6128] via-[#FF7E40] to-[#FFA066] avatar-orange-glow flex items-center justify-center shrink-0 aspect-square shadow-lg shadow-[#FF6128]/30">
              <div className="w-full h-full rounded-full bg-[#12141A] flex items-center justify-center overflow-hidden border border-black/60 aspect-square relative">
                <img
                  src={user.photoUrl || user.photo_url || '/default_user.png'}
                  alt={user.firstName || user.username || 'Telegram Profile'}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="w-full h-full rounded-full bg-gradient-to-tr from-[#0088cc] via-[#24A1DE] to-[#34B7F1] items-center justify-center text-white font-extrabold text-lg select-none hidden"
                >
                  {(user.firstName || user.username || 'M').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Name & Level Badge */}
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight leading-tight">
              {user.firstName || user.username || 'Member'}
            </h3>

            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-[#FF6128] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                {user.level || 'LV.1'}
              </span>

              {/* Small Progress Line */}
              <div className="w-14 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="w-2/5 h-full bg-[#FF6128] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Buttons: Add Task & Globe */}
        <div className="flex items-center space-x-2">
          {/* Add Task Button */}
          <button
            onClick={() => setActiveTab('add-task')}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF6128] via-[#FF7533] to-[#FFA03A] text-white text-xs font-black shadow-md shadow-[#FF6128]/25 flex items-center space-x-1 cursor-pointer active:scale-95 transition-all hover:brightness-110 shrink-0"
            title="Add New Task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Task</span>
          </button>

          {/* Customer Support Button (@InspectorDm) */}
          <button
            onClick={() => {
              if (window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink('https://t.me/InspectorDm');
              } else {
                window.open('https://t.me/InspectorDm', '_blank');
              }
            }}
            className="w-10 h-10 rounded-xl bg-[#12141A] border border-[#FF6128]/40 hover:border-[#FF6128] flex items-center justify-center text-[#FF6128] transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
            title="Customer Support (@InspectorDm)"
          >
            <Headphones className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
