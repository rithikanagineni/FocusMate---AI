import React from 'react';
import { Camera, Mic, UploadCloud, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (action: 'camera' | 'voice' | 'upload' | 'ai_create') => void;
}

export const QuickActionCard: React.FC<QuickActionsProps> = ({ onSelectAction }) => {
  const actions = [
    {
      id: 'camera' as const,
      label: 'Capture',
      desc: 'Photo / Screenshot',
      icon: <Camera className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-100',
      iconBg: 'bg-purple-100',
    },
    {
      id: 'voice' as const,
      label: 'Voice',
      desc: 'Speak your tasks',
      icon: <Mic className="w-5 h-5 text-rose-500" />,
      bg: 'bg-rose-50 hover:bg-rose-100/80 border-rose-100',
      iconBg: 'bg-rose-100',
    },
    {
      id: 'upload' as const,
      label: 'Upload',
      desc: 'PDF / Docs / Notes',
      icon: <UploadCloud className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-100',
      iconBg: 'bg-blue-100',
    },
    {
      id: 'ai_create' as const,
      label: 'AI Create',
      desc: 'Type or Paste',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-100',
      iconBg: 'bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={() => onSelectAction(act.id)}
          className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all duration-200 active:scale-95 shadow-2xs ${act.bg}`}
        >
          <div className={`w-9 h-9 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0`}>
            {act.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 tracking-tight">{act.label}</div>
            <div className="text-[11px] text-slate-500 truncate">{act.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
