import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (isInstalled || installedSuccess) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
        <Check className="w-3.5 h-3.5" /> Installed
      </span>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) setInstalledSuccess(true);
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          aria-label="Install FocusMate App"
          className={
            variant === 'full'
              ? 'w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95'
              : 'flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold py-1.5 px-3 rounded-full border border-purple-200 transition-colors shadow-xs'
          }
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold py-1.5 px-3 rounded-full border border-purple-200"
        >
          <Share className="w-3 h-3" />
          <span>Install on iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                FM
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Install FocusMate</h3>
                <p className="text-xs text-slate-500">Add to your iPhone Home Screen</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" /> at the bottom of Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">3</span>
                <span>Launch FocusMate from your Home Screen for the full fullscreen native experience!</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
