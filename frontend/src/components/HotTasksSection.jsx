import React from 'react';
import { useApp } from '../context/AppContext';
import TaskCardItem from './TaskCardItem';
import { Link2, ChevronDown, Flame, HelpCircle } from 'lucide-react';

export default function HotTasksSection() {
  const { tasks, setActiveTab } = useApp();

  return (
    <div className="px-4 mt-4 space-y-3 pb-4">
      {/* LINK ACCOUNTS Row */}
      <div className="foxtask-card rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Orange Linked Chain Icon */}
          <Link2 className="w-4 h-4 text-[#FF6128]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            LINK ACCOUNTS <strong className="text-gray-300">7</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-black">
          <div className="flex items-center space-x-1 text-[#FBBF24]">
            <img src="/fn_coin.png" alt="Coin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            <span>+10</span>
          </div>

          <div className="flex items-center space-x-1 text-[#00DF8F]">
            <img src="/usdt.png" alt="USDT" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            <span>+0.1</span>
          </div>

          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* HOT TASKS Header */}
      <div className="flex items-center space-x-2 pt-2">
        <Flame className="w-5 h-5 text-[#FF6128] fill-[#FF6128]" />
        <h3 className="text-xs font-black uppercase tracking-wider text-white">
          HOT TASKS
        </h3>
      </div>

      {/* Drip tasks notification banner */}
      <div className="foxtask-card rounded-2xl p-3.5 flex items-center justify-between border border-white/5">
        <div className="flex items-center space-x-2.5 text-xs text-gray-300 font-bold">
          <div className="w-6 h-6 rounded-full bg-[#20150F] flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-[#FF6128] fill-[#FF6128]" />
          </div>
          <span>1 drip tasks releasing soon</span>
        </div>

        <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300" />
      </div>

      {/* Task Items (First 3 Hot Tasks) */}
      <div className="space-y-2.5">
        {tasks.slice(0, 3).map((task) => (
          <TaskCardItem key={task.id} task={task} />
        ))}
      </div>

      {/* View All Tasks -> */}
      <div className="text-center pt-2 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className="text-sm font-black text-[#FF6128] hover:text-[#FF7A40] transition-colors cursor-pointer inline-flex items-center space-x-1"
        >
          <span>View All Tasks</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

