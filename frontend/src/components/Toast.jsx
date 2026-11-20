import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast.visible) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-300 bg-white text-slate-800 shadow-emerald-500/20',
    error: 'border-rose-300 bg-white text-slate-800 shadow-rose-500/20',
    info: 'border-indigo-300 bg-white text-slate-800 shadow-indigo-500/20'
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm transition-all duration-300 animate-bounce-short">
      <div
        className={`flex items-center space-x-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
          borders[toast.type] || borders.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <div className="text-xs font-bold text-slate-900 flex-1 leading-snug">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
