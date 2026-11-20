import React, { useEffect } from 'react';
import FoxHeader from '../components/FoxHeader';
import BalanceBoxes from '../components/BalanceBoxes';
import DailyCheckinBox from '../components/DailyCheckinBox';
import HotTasksSection from '../components/HotTasksSection';
import { useApp } from '../context/AppContext';

export default function FoxHomePage() {
  const { fetchTasks, fetchAdvanceTasks } = useApp();

  useEffect(() => {
    if (fetchTasks) fetchTasks();
    if (fetchAdvanceTasks) fetchAdvanceTasks();
  }, []);

  return (
    <div className="pb-24">
      {/* 1. Header (FoxTask + User Profile) */}
      <FoxHeader />

      {/* 2. Three Balance Boxes (USDT, FN coin, Done) + Live Withdraw Ticker */}
      <BalanceBoxes />

      {/* 3. Daily Check-in Card (+2 FN Coin) */}
      <DailyCheckinBox />

      {/* 4. HOT TASKS Section (Link Accounts + Hot Tasks List) */}
      <HotTasksSection />
    </div>
  );
}
