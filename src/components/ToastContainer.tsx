import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { CheckCircle2, AlertCircle, Info, DollarSign, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const store = useGameStore();

  if (store.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[70] flex flex-col-reverse gap-1.5 max-w-[280px] sm:max-w-xs pointer-events-none select-none">
      {store.toasts.map((t) => {
        let borderColor = 'border-slate-700/60';
        let bgColor = 'bg-slate-900/90';
        let Icon = Info;
        let iconColor = 'text-cyan-400';

        if (t.type === 'success') {
          borderColor = 'border-emerald-500/50';
          bgColor = 'bg-slate-950/90';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (t.type === 'error') {
          borderColor = 'border-rose-500/60';
          bgColor = 'bg-rose-950/90';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (t.type === 'money') {
          borderColor = 'border-amber-500/50';
          bgColor = 'bg-slate-950/90';
          Icon = DollarSign;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-md shadow-lg shadow-black/50 text-white animate-fadeIn`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
            <div className="flex flex-col flex-1 min-w-0 pr-1">
              <span className="font-extrabold text-[11px] text-white leading-tight truncate">
                {t.title}
              </span>
              {t.message && (
                <span className="text-[10px] text-slate-300 leading-tight truncate">
                  {t.message}
                </span>
              )}
            </div>
            <button
              onClick={() => store.removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition shrink-0"
              aria-label="Đóng"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
