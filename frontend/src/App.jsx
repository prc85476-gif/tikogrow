import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import FoxBottomNav from './components/FoxBottomNav';
import Toast from './components/Toast';
import TaskSuccessModal from './components/TaskSuccessModal';
import AdvanceTaskModal from './components/AdvanceTaskModal';
import ErrorBoundary from './components/ErrorBoundary';

import FoxHomePage from './pages/FoxHomePage';
import FoxTasksPage from './pages/FoxTasksPage';
import FoxActivityPage from './pages/FoxActivityPage';
import FoxProfilePage from './pages/FoxProfilePage';
import AddTaskPage from './pages/AddTaskPage';
import FoxDepositPage from './pages/FoxDepositPage';
import StandaloneAdminPanel from './pages/StandaloneAdminPanel';

function isPanelRouteActive() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.startsWith('/panel') ||
    path.startsWith('/admin') ||
    search.includes('page=panel') ||
    search.includes('route=panel') ||
    hash.startsWith('#/panel') ||
    hash.startsWith('#panel')
  );
}

function FoxAppContent() {
  const { activeTab, theme } = useApp();

  // If visiting /panel, render standalone full-screen Admin Dashboard
  if (isPanelRouteActive()) {
    return (
      <>
        <StandaloneAdminPanel />
        <Toast />
      </>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <FoxHomePage />;
      case 'tasks':
        return <FoxTasksPage />;
      case 'activity':
        return <FoxActivityPage />;
      case 'profile':
        return <FoxProfilePage />;
      case 'add-task':
        return <AddTaskPage />;
      case 'deposit':
        return <FoxDepositPage />;
      default:
        return <FoxHomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light bg-[#F0F2F5] text-slate-900' : 'bg-[#0A0C10] text-white'} flex justify-center relative transition-colors duration-200`}>
      {/* Mobile Frame Container (Standard Telegram Mini App width) */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl">
        {/* Dynamic Screen Component */}
        <main className="flex-1">
          <ErrorBoundary>
            {renderActiveScreen()}
          </ErrorBoundary>
        </main>

        {/* Bottom Nav Bar */}
        <FoxBottomNav />

        {/* Toast Alerts */}
        <Toast />

        {/* Task Success Lottie Verified Animation Popup */}
        <TaskSuccessModal />

        {/* Advance Task Details & Screenshot Submission Window */}
        <AdvanceTaskModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <FoxAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
