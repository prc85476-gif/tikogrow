import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Megaphone, 
  ShieldCheck, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Award
} from 'lucide-react';

export default function TasksPage() {
  const { tasks, config, completeTask, loading } = useApp();

  const handleJoinAndVerify = (task) => {
    if (task.completed) return;

    if (task.link) {
      window.open(task.link, '_blank');
    }

    setTimeout(() => {
      completeTask(task.id);
    }, 700);
  };

  const getTaskVisual = (type) => {
    switch (type) {
      case 'telegram_channel':
        return {
          icon: <Megaphone className="w-6 h-6 text-white" />,
          gradient: 'from-blue-600 to-indigo-600',
          border: 'border-l-blue-600',
          glow: 'glow-primary'
        };
      case 'promoter_channel':
        return {
          icon: <Award className="w-6 h-6 text-white" />,
          gradient: 'from-purple-600 to-fuchsia-600',
          border: 'border-l-purple-600',
          glow: 'glow-purple'
        };
      case 'telegram_group':
        return {
          icon: <Users className="w-6 h-6 text-white" />,
          gradient: 'from-emerald-600 to-teal-600',
          border: 'border-l-emerald-600',
          glow: 'glow-emerald'
        };
      case 'daily_checkin':
        return {
          icon: <Calendar className="w-6 h-6 text-white" />,
          gradient: 'from-amber-500 to-orange-500',
          border: 'border-l-amber-500',
          glow: 'glow-amber'
        };
      default:
        return {
          icon: <CheckSquare className="w-6 h-6 text-white" />,
          gradient: 'from-indigo-600 to-blue-600',
          border: 'border-l-indigo-600',
          glow: 'glow-primary'
        };
    }
  };

  return (
    <div className="px-4 pt-3 pb-28 space-y-4 relative z-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2 drop-shadow-sm">
          <CheckSquare className="w-5 h-5 text-cyan-300" />
          <span>Task Directory</span>
        </h2>
        <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
          Verify channel subscriptions and ecosystem milestones to earn high-tier {config.coinName} allocations.
        </p>
      </div>

      {/* Task Summary Pill - White Card with Glow */}
      <div className="white-box rounded-3xl p-4 flex items-center justify-between glow-card">
        <div className="flex items-center space-x-2.5 text-xs text-slate-700 font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Active Milestones: <strong className="text-slate-950 font-black font-mono">{tasks.length}</strong></span>
        </div>
        <span className="text-[11px] text-emerald-800 font-black bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
          Instant Settlement
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3.5">
        {tasks.map((task) => {
          const isCompleted = task.completed;
          const visual = getTaskVisual(task.type);

          return (
            <div
              key={task.id}
              className={`white-box rounded-3xl p-4.5 border-l-4 ${visual.border} ${visual.glow} transition-all ${
                isCompleted ? 'opacity-85' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${visual.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                    {visual.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900">{task.title}</h4>
                      {task.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {task.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      {task.description}
                    </p>

                    <div className="mt-2.5 flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        +{task.reward} {config.coinName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {task.link ? (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-600 hover:text-indigo-600 flex items-center space-x-1 font-bold transition-colors"
                  >
                    <span>External Link</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    Automated Verification
                  </span>
                )}

                <button
                  onClick={() => handleJoinAndVerify(task)}
                  disabled={isCompleted || loading}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                      : `bg-gradient-to-r ${visual.gradient} text-white shadow-md shadow-indigo-500/30 glow-primary active:scale-95`
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>{task.link ? 'Verify & Claim' : 'Claim Reward'}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
