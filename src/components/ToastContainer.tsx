import React from 'react';
import { useGameStore, ToastMessage } from '../stores/gameStore';
import { CheckCircle2, AlertCircle, Info, DollarSign, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const store = useGameStore();

  if (store.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-3 right-3 sm:left-auto sm:right-6 z-[70] flex flex-col-reverse gap-2 sm:max-w-sm pointer-events-none select-none">
      {store.toasts.map((t) => {
        let borderColor = 'border-slate-700';
        let bgColor = 'bg-slate-900/95';
        let Icon = Info;
        let iconColor = 'text-cyan-400';

        if (t.type === 'success') {
          borderColor = 'border-emerald-500/60';
          bgColor = 'bg-emerald-950/90';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (t.type === 'error') {
          borderColor = 'border-rose-500/60';
          bgColor = 'bg-rose-950/90';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (t.type === 'money') {
          borderColor = 'border-amber-500/60';
          bgColor = 'bg-amber-950/90';
          Icon = DollarSign;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-md shadow-xl text-white animate-fadeIn`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-extrabold text-xs text-white leading-tight">{t.title}</span>
              <span className="text-[11px] text-slate-300 mt-0.5 leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => store.removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

