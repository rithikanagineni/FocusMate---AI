import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-fade-in border border-amber-300">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — On-device local AI & cached plan active.</span>
    </div>
  );
};
