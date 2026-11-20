import React from 'react';
import { useApp } from '../context/AppContext';
import TopBalanceCard from '../components/TopBalanceCard';
import { 
  Play, 
  Megaphone, 
  ShieldCheck, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Zap,
  Award,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const { config, tasks, ads, setActiveTab, startWatchingAd, completeTask } = useApp();

  const officialTask = tasks.find((t) => t.id === 'task_official') || {
    id: 'task_official',
    title: 'Official Channel Subscription',
    reward: 50,
    link: config.officialChannel,
    completed: false
  };

  const promoterTask = tasks.find((t) => t.id === 'task_promoter') || {
    id: 'task_promoter',
    title: 'Institutional Promoter Partner',
    reward: 75,
    link: config.promoterChannel,
    completed: false
  };

  const dailyTask = tasks.find((t) => t.id === 'task_daily') || {
    id: 'task_daily',
    title: 'Daily Streak Bonus',
    reward: 25,
    completed: false
  };

  const handleTaskAction = (task) => {
    if (task.completed) return;
    if (task.link) {
      window.open(task.link, '_blank');
    }
    setTimeout(() => {
      completeTask(task.id);
    }, 600);
  };

  return (
    <div className="pb-28">
      {/* Top Distinct Colored Balance Box */}
      <TopBalanceCard />

      {/* Main Content: White Box Cards with Colorful Accents & Ambient Glow */}
      <div className="px-4 space-y-4 relative z-10">
        
        {/* CARD 1: Daily Streak Box - White Card with Colorful Amber/Gold Gradient */}
        <div className="white-box rounded-3xl p-4 flex items-center justify-between glow-amber border-l-4 border-l-amber-500">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  24h Daily Check-In
                </h4>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  +{dailyTask.reward} {config.coinName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Claim tier bonus every 24 hours</p>
            </div>
          </div>

          <button
            onClick={() => handleTaskAction(dailyTask)}
            disabled={dailyTask.completed}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              dailyTask.completed
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/30 glow-amber'
            }`}
          >
            {dailyTask.completed ? 'Claimed' : 'Claim'}
          </button>
        </div>

        {/* SECTION 2: Telegram Channel Tasks (White Box Cards with Colorful Gradients) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-100 drop-shadow-sm">
                Verified Telegram Tasks
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-cyan-300 hover:text-white font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {/* CARD: Official Channel - White Box with Blue Gradient Accent */}
            <div className="white-box rounded-3xl p-4.5 glow-primary border-l-4 border-l-blue-600">
              <div className="flex items-start justify-between">
                <div className="flex space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {officialTask.title}
                      </h4>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                        Official
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Subscribe to our primary ecosystem announcements channel.
                    </p>
                    <div className="mt-2.5 flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        +{officialTask.reward} {config.coinName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Verified Partner
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={officialTask.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:text-indigo-600 flex items-center space-x-1 font-bold transition-colors"
                >
                  <span>Open Official Channel</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <button
                  onClick={() => handleTaskAction(officialTask)}
                  disabled={officialTask.completed}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer transition-all ${
                    officialTask.completed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/30 glow-primary'
                  }`}
                >
                  {officialTask.completed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Subscribe & Claim</span>
                  )}
                </button>
              </div>
            </div>

            {/* CARD: Promoter Channel - White Box with Purple Gradient Accent */}
            <div className="white-box rounded-3xl p-4.5 glow-purple border-l-4 border-l-purple-600">
              <div className="flex items-start justify-between">
                <div className="flex space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/30">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {promoterTask.title}
                      </h4>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                        Promoter
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Subscribe to our verified institutional partner channel.
                    </p>
                    <div className="mt-2.5 flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        +{promoterTask.reward} {config.coinName}
                      </span>
                      <span className="text-[11px] text-purple-700 font-extrabold bg-purple-50 px-2 py-0.5 rounded">
                        High Yield
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={promoterTask.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:text-purple-600 flex items-center space-x-1 font-bold transition-colors"
                >
                  <span>Open Partner Channel</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <button
                  onClick={() => handleTaskAction(promoterTask)}
                  disabled={promoterTask.completed}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer transition-all ${
                    promoterTask.completed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                      : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-md shadow-purple-500/30 glow-purple'
                  }`}
                >
                  {promoterTask.completed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Subscribe & Claim</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Watch Ads & Earn 10 Coins - White Box Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-100 drop-shadow-sm">
                Sponsor Impressions • 10 {config.coinName} Each
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('ads')}
              className="text-xs text-amber-300 hover:text-white font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {ads.slice(0, 2).map((ad) => (
              <div
                key={ad.id}
                className="white-box rounded-3xl p-4 flex items-center justify-between border-l-4 border-l-cyan-500 glow-cyan"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/30">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">{ad.title}</h5>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[11px] text-slate-500 font-semibold">{ad.sponsor}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-amber-700 font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        +{ad.reward || 10} {config.coinName}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startWatchingAd(ad)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-black shadow-md flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start ({ad.duration}s)</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Fast Swap & BEP-20 Cashout Info - White Box with Emerald Glow */}
        <div className="white-box rounded-3xl p-4.5 border-l-4 border-l-emerald-500 glow-emerald">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">USDT BEP-20 Cashout</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Automated settlement • 0% Fee</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('exchange')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-500/30 flex items-center space-x-1.5 cursor-pointer glow-emerald"
            >
              <span>Instant Swap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
