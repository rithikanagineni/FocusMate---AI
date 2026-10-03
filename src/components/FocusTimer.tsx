import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  Settings,
  Pause,
  Play,
  Square,
  Calendar,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Upload,
  Music,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Headphones,
  Sliders,
  Trash2,
  Plus,
  Minus,
  Clock,
  Camera,
  CameraOff,
  AlertTriangle,
  Eye,
  BookOpen,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Award,
  BarChart2,
  CheckCircle2
} from 'lucide-react';
import {
  soundEngine,
  AlarmSoundType,
  AmbientSoundType
} from '../services/soundEngine';

interface FocusTimerProps {
  taskTitle?: string;
  initialMinutes?: number;
  onFinish: (
    durationMinutes: number,
    markCompleted?: boolean,
    sessionMeta?: {
      distractionScore: number;
      tabSwitches: number;
      lookAwayEvents: number;
      absenceEvents: number;
      pauseReasons: string[];
    }
  ) => void;
  onExit: () => void;
}

const STORAGE_KEY_ALARM_TYPE = 'focusmate_alarm_type';
const STORAGE_KEY_CUSTOM_ALARM = 'focusmate_custom_alarm_data';
const STORAGE_KEY_CUSTOM_NAME = 'focusmate_custom_alarm_name';
const STORAGE_KEY_AMBIENT_TYPE = 'focusmate_ambient_type';
const STORAGE_KEY_ALARM_VOL = 'focusmate_alarm_volume';
const STORAGE_KEY_AMBIENT_VOL = 'focusmate_ambient_volume';

const TIME_PRESETS = [
  { label: '5m', minutes: 5, desc: 'Quick Sprint' },
  { label: '10m', minutes: 10, desc: 'Short Task' },
  { label: '15m', minutes: 15, desc: 'Standard' },
  { label: '25m', minutes: 25, desc: 'Pomodoro' },
  { label: '45m', minutes: 45, desc: 'Deep Work' },
  { label: '60m', minutes: 60, desc: '1 Hour' },
  { label: '90m', minutes: 90, desc: 'Flow State' },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  taskTitle = 'Focused Task Session',
  initialMinutes = 25,
  onFinish,
  onExit,
}) => {
  // Timer States - NOTE: isActive starts FALSE as requested (does not start automatically)
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Camera & Proctoring States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'denied'>('idle');
  const [showCameraRequiredModal, setShowCameraRequiredModal] = useState(false);
  const [gazeStatus, setGazeStatus] = useState<'screen' | 'desk' | 'away' | 'none'>('screen');
  const [distractionAlert, setDistractionAlert] = useState<{ message: string; type: string } | null>(null);

  // Distraction & Proctoring Stats
  const [distractionStats, setDistractionStats] = useState({
    tabSwitches: 0,
    lookAwayEvents: 0,
    absenceEvents: 0,
    distractionHistory: [] as Array<{ time: string; reason: string }>,
  });

  // Pause Reason States
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('');
  const [pauseLogs, setPauseLogs] = useState<Array<{ time: string; reason: string }>>([]);

  // Session Report & Task Completion Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [needMoreTimePrompt, setNeedMoreTimePrompt] = useState(false);
  const [extensionMessage, setExtensionMessage] = useState<string | null>(null);

  // Alarm & Audio States
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings Loaded from localStorage
  const [alarmType, setAlarmType] = useState<AlarmSoundType>(() => {
    return (localStorage.getItem(STORAGE_KEY_ALARM_TYPE) as AlarmSoundType) || 'digital_chime';
  });
  const [customAlarmData, setCustomAlarmData] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_ALARM);
  });
  const [customAlarmName, setCustomAlarmName] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_NAME);
  });
  const [ambientType, setAmbientType] = useState<AmbientSoundType>(() => {
    return (localStorage.getItem(STORAGE_KEY_AMBIENT_TYPE) as AmbientSoundType) || 'none';
  });
  const [alarmVolume, setAlarmVolume] = useState<number>(() => {
    const v = localStorage.getItem(STORAGE_KEY_ALARM_VOL);
    return v ? parseFloat(v) : 0.85;
  });
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    const v = localStorage.getItem(STORAGE_KEY_AMBIENT_VOL);
    return v ? parseFloat(v) : 0.35;
  });

  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastAlertTimeRef = useRef<number>(0);

  // Format MM:SS helper
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Trigger Distraction Danger Alert (sound + warning banner)
  const triggerDistractionAlert = useCallback((reason: string, type: 'tab' | 'away' | 'absence') => {
    const now = Date.now();
    // Throttle danger buzzer sound to once every 1.4s so it sounds promptly without stuttering
    if (now - lastAlertTimeRef.current > 1400) {
      lastAlertTimeRef.current = now;
      soundEngine.playDangerAlert(1.0);
    }

    setDistractionAlert({ message: reason, type });
    setTimeout(() => {
      setDistractionAlert(null);
    }, 2800);

    const timeString = formatTime(totalSeconds - secondsLeft);
    setDistractionStats((prev) => ({
      ...prev,
      tabSwitches: type === 'tab' ? prev.tabSwitches + 1 : prev.tabSwitches,
      lookAwayEvents: type === 'away' ? prev.lookAwayEvents + 1 : prev.lookAwayEvents,
      absenceEvents: type === 'absence' ? prev.absenceEvents + 1 : prev.absenceEvents,
      distractionHistory: [
        ...prev.distractionHistory,
        { time: timeString, reason: `${reason} (${type})` },
      ],
    }));
  }, [totalSeconds, secondsLeft]);

  // Request & Start Camera (Mandatory for Focus Mode)
  const startCamera = async (): Promise<boolean> => {
    try {
      setCameraStatus('starting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 480 },
          height: { ideal: 360 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraStatus('active');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return true;
    } catch (err) {
      console.warn('Camera access denied or error:', err);
      setCameraStatus('denied');
      setShowCameraRequiredModal(true);
      return false;
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setCameraStatus('idle');
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 1. Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      // Time is up! Trigger alarm & show completion report!
      setIsActive(false);
      setIsAlarmRinging(true);
      soundEngine.stopAmbient();
      soundEngine.startAlarm(alarmType, customAlarmData || undefined, alarmVolume);
      setShowReportModal(true);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft, alarmType, customAlarmData, alarmVolume]);

  // 2. Tab Switching & Window Blur Distraction Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        triggerDistractionAlert('⚠️ Tab Switched! Stay focused on your task.', 'tab');
      }
    };

    const handleWindowBlur = () => {
      if (isActive) {
        triggerDistractionAlert('⚠️ Focus Lost! Return to the FocusMate window.', 'tab');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, triggerDistractionAlert]);

  // 3. Camera Frame AI Gaze & Attention Analyzer (Every 450ms for responsive detection)
  useEffect(() => {
    let proctorInterval: any = null;

    if (isActive && cameraStatus === 'active' && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      proctorInterval = setInterval(async () => {
        if (!video.videoWidth || !video.videoHeight || !ctx) return;

        // Try native Browser FaceDetector first if supported (Chrome/Edge on-device detection)
        if ('FaceDetector' in window) {
          try {
            const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
            const detectedFaces = await detector.detect(video);

            if (!detectedFaces || detectedFaces.length === 0) {
              setGazeStatus('none');
              triggerDistractionAlert('⚠️ Distraction: No face detected! Face the camera.', 'absence');
              return;
            }

            const face = detectedFaces[0];
            const box = face.boundingBox;
            const cx = (box.x + box.width / 2) / video.videoWidth;
            const cy = (box.y + box.height / 2) / video.videoHeight;
            const aspect = box.width / box.height;

            // When face is turned sideways: box aspect ratio narrows or cx shifts significantly
            if (aspect < 0.65 || cx < 0.33 || cx > 0.67) {
              setGazeStatus('away');
              triggerDistractionAlert('⚠️ Distraction: Face turned to the side! Look at screen or notes.', 'away');
              return;
            }

            if (cy > 0.58) {
              // Looking down at desk / notebook - ALLOWED!
              setGazeStatus('desk');
              return;
            }

            setGazeStatus('screen');
            return;
          } catch (e) {
            // Fall back to Canvas Pixel Analysis below
          }
        }

        // High-Precision Canvas Pixel & YCbCr Skin Symmetry Analyzer
        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(video, 0, 0, 160, 120);

        try {
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let skinPixelCount = 0;
          let skinLeft = 0;
          let skinRight = 0;
          let skinTop = 0;
          let skinBottom = 0;
          let sumX = 0;
          let sumY = 0;

          // Sample pixels across frame (step by 4 = 1200 sample pixels)
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // YCbCr skin chrominance calculation
            const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            // Universal human skin tone boundaries
            const isSkin =
              cb >= 77 &&
              cb <= 135 &&
              cr >= 130 &&
              cr <= 180 &&
              yVal >= 30 &&
              yVal <= 245 &&
              r > g &&
              r > b &&
              Math.abs(r - g) >= 8;

            if (isSkin) {
              skinPixelCount++;
              const pixelIndex = i / 4;
              const px = pixelIndex % 160;
              const py = Math.floor(pixelIndex / 160);

              sumX += px;
              sumY += py;

              if (px < 80) skinLeft++;
              else skinRight++;

              if (py < 60) skinTop++;
              else skinBottom++;
            }
          }

          // 1. Check if face is missing / not in camera frame
          // If fewer than 32 skin pixels found (~2.6% of frame): NO FACE AVAILABLE!
          if (skinPixelCount < 32) {
            setGazeStatus('none');
            triggerDistractionAlert('⚠️ Distraction: No face detected! Face the camera.', 'absence');
            return;
          }

          const centerX = sumX / skinPixelCount / 160; // 0.0 to 1.0
          const centerY = sumY / skinPixelCount / 120; // 0.0 to 1.0

          // Calculate left-vs-right symmetry of detected face
          const sideRatio = Math.max(skinLeft, skinRight) / (Math.min(skinLeft, skinRight) + 2);

          // 2. Check if face is turned to the side or looking away
          // Side ratio > 1.85 means one cheek is turned away from camera, or centroid is shifted
          if (sideRatio > 1.85 || centerX < 0.34 || centerX > 0.66 || centerY < 0.18) {
            setGazeStatus('away');
            triggerDistractionAlert('⚠️ Distraction: Face turned to the side! Look at screen or notes.', 'away');
            return;
          }

          // 3. Check if looking down at desk / notes (ALLOWED as requested)
          if (centerY > 0.54) {
            setGazeStatus('desk');
            return;
          }

          // 4. Looking directly at screen (ALLOWED)
          setGazeStatus('screen');
        } catch (e) {
          // ignore canvas read errors
        }
      }, 450);
    }

    return () => {
      if (proctorInterval) clearInterval(proctorInterval);
    };
  }, [isActive, cameraStatus, triggerDistractionAlert]);

  // 4. Ambient Sound Controller Effect
  useEffect(() => {
    if (isActive && ambientType !== 'none') {
      soundEngine.startAmbient(ambientType, ambientVolume);
    } else {
      soundEngine.stopAmbient();
    }

    return () => {
      soundEngine.stopAmbient();
    };
  }, [isActive, ambientType, ambientVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      soundEngine.stopAlarm();
      soundEngine.stopAmbient();
    };
  }, []);

  // Preset Time Selector
  const handleSelectPreset = (minutes: number) => {
    if (isActive) {
      const confirmReset = window.confirm(
        'Timer is currently running. Do you want to restart with the new time?'
      );
      if (!confirmReset) return;
    }
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setTotalSeconds(minutes * 60);
    setIsActive(false);
    setHasStarted(false);
  };

  // Adjust time by +/- minutes
  const handleAdjustMinutes = (delta: number) => {
    const currentM = Math.floor(secondsLeft / 60);
    const newM = Math.max(1, Math.min(180, currentM + delta));
    setSelectedMinutes(newM);
    setSecondsLeft(newM * 60);
    setTotalSeconds(newM * 60);
    setIsActive(false);
    setHasStarted(false);
  };

  // Start Focus Mode with MANDATORY Camera Check
  const handleStartTimer = async () => {
    if (isAlarmRinging) {
      handleStopAlarm();
      return;
    }

    // Check camera permission first
    if (!cameraStream) {
      const cameraGranted = await startCamera();
      if (!cameraGranted) {
        // Stop right here - focus mode is NOT allowed without active camera
        setShowCameraRequiredModal(true);
        return;
      }
    }

    setHasStarted(true);
    setIsActive(true);
  };

  // Initiate Pause: Opens Pause Reason Modal (Mandatory accountability)
  const handleInitiatePause = () => {
    if (isAlarmRinging) {
      handleStopAlarm();
      return;
    }
    if (isActive) {
      setShowPauseModal(true);
    }
  };

  // Confirm Pause with Reason
  const handleConfirmPause = () => {
    const reason = pauseReasonInput.trim() || 'General break / grabbing study materials';
    const timeFormatted = formatTime(totalSeconds - secondsLeft);

    setPauseLogs((prev) => [
      ...prev,
      { time: timeFormatted, reason }
    ]);

    setIsActive(false);
    setShowPauseModal(false);
    setPauseReasonInput('');
  };

  // Stop Alarm function
  const handleStopAlarm = () => {
    soundEngine.stopAlarm();
    setIsAlarmRinging(false);
  };

  // End Session manually and show Report
  const handleEnd = () => {
    handleStopAlarm();
    soundEngine.stopAmbient();
    stopCamera();
    setShowReportModal(true);
  };

  // User confirms task is finished: Auto-marks task completed in system and finishes!
  const handleConfirmTaskCompleted = () => {
    handleStopAlarm();
    soundEngine.stopAmbient();
    stopCamera();
    setShowReportModal(false);
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    onFinish(elapsedMinutes, true, {
      distractionScore: calculateFocusScore(),
      tabSwitches: distractionStats.tabSwitches,
      lookAwayEvents: distractionStats.lookAwayEvents,
      absenceEvents: distractionStats.absenceEvents,
      pauseReasons: pauseLogs.map((p) => p.reason),
    });
  };

  // User says task is NOT finished yet: Reopens the timer to do it again until completed!
  const handleExtendFocusSession = async (extraMinutes: number) => {
    handleStopAlarm();
    setNeedMoreTimePrompt(false);
    setShowReportModal(false);

    // Keep camera proctoring active
    if (!cameraStream) {
      await startCamera();
    }

    const newSeconds = extraMinutes * 60;
    setSelectedMinutes(extraMinutes);
    setSecondsLeft(newSeconds);
    setTotalSeconds(newSeconds);
    setHasStarted(true);
    setIsActive(true);

    setExtensionMessage(
      `Timer restarted (+${extraMinutes}m). Focusing on "${taskTitle}" until completed!`
    );
    setTimeout(() => {
      setExtensionMessage(null);
    }, 5000);
  };

  // Final Complete after reviewing Report (exits without marking completed)
  const handleCompleteAndExit = (markCompleted = false) => {
    handleStopAlarm();
    soundEngine.stopAmbient();
    stopCamera();
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    setShowReportModal(false);
    onFinish(elapsedMinutes, markCompleted, {
      distractionScore: calculateFocusScore(),
      tabSwitches: distractionStats.tabSwitches,
      lookAwayEvents: distractionStats.lookAwayEvents,
      absenceEvents: distractionStats.absenceEvents,
      pauseReasons: pauseLogs.map((p) => p.reason),
    });
  };

  // Repeat Session
  const handleRestart = () => {
    handleStopAlarm();
    setSecondsLeft(totalSeconds);
    setIsActive(false);
    setHasStarted(false);
    setShowReportModal(false);
    setDistractionStats({
      tabSwitches: 0,
      lookAwayEvents: 0,
      absenceEvents: 0,
      distractionHistory: [],
    });
    setPauseLogs([]);
  };

  // Custom Audio File Upload
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      alert('Please upload a valid audio file (.mp3, .wav, .ogg, .m4a)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAlarmData(dataUrl);
      setCustomAlarmName(file.name);
      setAlarmType('custom');

      localStorage.setItem(STORAGE_KEY_CUSTOM_ALARM, dataUrl);
      localStorage.setItem(STORAGE_KEY_CUSTOM_NAME, file.name);
      localStorage.setItem(STORAGE_KEY_ALARM_TYPE, 'custom');
    };
    reader.readAsDataURL(file);
  };

  // Remove custom audio
  const handleRemoveCustomAudio = () => {
    setCustomAlarmData(null);
    setCustomAlarmName(null);
    setAlarmType('digital_chime');
    localStorage.removeItem(STORAGE_KEY_CUSTOM_ALARM);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_NAME);
    localStorage.setItem(STORAGE_KEY_ALARM_TYPE, 'digital_chime');
  };

  // Preview Alarm Sound
  const handlePreviewAlarm = (type: AlarmSoundType) => {
    if (previewingSound === type) {
      soundEngine.stopAlarm();
      setPreviewingSound(null);
    } else {
      setPreviewingSound(type);
      soundEngine.previewSound(type, customAlarmData || undefined, alarmVolume);
      setTimeout(() => {
        setPreviewingSound(null);
      }, 3500);
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem(STORAGE_KEY_ALARM_TYPE, alarmType);
    localStorage.setItem(STORAGE_KEY_AMBIENT_TYPE, ambientType);
    localStorage.setItem(STORAGE_KEY_ALARM_VOL, alarmVolume.toString());
    localStorage.setItem(STORAGE_KEY_AMBIENT_VOL, ambientVolume.toString());
    soundEngine.stopAlarm();
    setPreviewingSound(null);
    setIsSettingsOpen(false);
  };

  // Calculate Focus Integrity Score (0 to 100%)
  const calculateFocusScore = () => {
    const totalDistractions =
      distractionStats.tabSwitches * 12 +
      distractionStats.lookAwayEvents * 6 +
      distractionStats.absenceEvents * 15 +
      pauseLogs.length * 4;

    return Math.max(20, Math.min(100, Math.round(100 - totalDistractions)));
  };

  // SVG Circle Progress Math
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#F8F9FE] text-slate-800 animate-fade-in min-h-[580px] max-w-xl mx-auto w-full relative">
      {/* Hidden Proctor Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            onClick={() => {
              handleStopAlarm();
              soundEngine.stopAmbient();
              stopCamera();
              onExit();
            }}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
            title="Exit Focus Mode"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
              <span>Focus Mode</span>
              {cameraStatus === 'active' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Camera Monitoring Active" />
              )}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {isActive ? 'AI Attention Monitoring Live' : 'Select duration & press Start'}
            </p>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 -mr-1 text-slate-600 hover:text-purple-600 rounded-2xl hover:bg-purple-50 transition border border-slate-200 bg-white shadow-xs"
            title="Focus & Alarm Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Time Presets Selector (5m, 10m, 15m, 25m, 45m, 60m) */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
            <span>Select Focus Duration:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-1)}
                className="w-5 h-5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition"
                title="Decrease 1 min"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes(1)}
                className="w-5 h-5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs transition"
                title="Increase 1 min"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TIME_PRESETS.map((preset) => {
              const isSelected = selectedMinutes === preset.minutes;
              return (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => handleSelectPreset(preset.minutes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex flex-col items-center border active:scale-95 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white hover:bg-purple-50 text-slate-600 border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className={`text-[9px] font-normal ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                    {preset.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SESSION EXTENSION NOTIFICATION BANNER */}
        {extensionMessage && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{extensionMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setExtensionMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* DISTRACTION DANGER FLASH BANNER */}
        {distractionAlert && (
          <div className="mb-3 p-3 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-2 animate-bounce border border-rose-400">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <ShieldAlert className="w-5 h-5 text-yellow-300 shrink-0 animate-pulse" />
              <span>{distractionAlert.message}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-800/80 px-2 py-0.5 rounded-md">
              Warning
            </span>
          </div>
        )}

        {/* 2. Scenic Dark Focus Card with Camera HUD Overlay */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#13122D] via-[#1E1B4B] to-[#31103F] p-5 text-white shadow-xl flex flex-col items-center justify-center min-h-[340px]">
          {/* Starry Sky Backdrop */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-6 left-8 w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-purple-200 rounded-full" />
            <div className="absolute top-20 left-16 w-1 h-1 bg-white rounded-full" />
            <div className="absolute bottom-16 right-8 w-1 h-1 bg-purple-300 rounded-full" />
          </div>

          {/* Mountains Landscape Graphic at bottom of card */}
          <div className="absolute bottom-0 inset-x-0 h-24 pointer-events-none opacity-50">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0 100 L 0 50 L 50 20 L 100 60 L 150 15 L 210 70 L 260 30 L 300 55 L 300 100 Z" fill="#0C0A1E" />
              <path d="M 0 100 L 0 70 L 60 40 L 120 75 L 180 35 L 240 80 L 300 50 L 300 100 Z" fill="#1A1235" opacity="0.6" />
            </svg>
          </div>

          {/* Live Camera Picture-in-Picture & Proctor HUD */}
          <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-1.5">
            <div
              className={`w-24 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden border-2 bg-black/60 shadow-lg relative backdrop-blur-xs transition-all ${
                cameraStatus === 'active' && (gazeStatus === 'away' || gazeStatus === 'none')
                  ? 'border-rose-500 ring-2 ring-rose-500/80 animate-pulse'
                  : 'border-white/20'
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover mirror ${
                  cameraStatus !== 'active' ? 'hidden' : ''
                }`}
                style={{ transform: 'scaleX(-1)' }}
              />

              {cameraStatus !== 'active' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-white/50 text-[10px]">
                  <CameraOff className="w-4 h-4 mb-1 text-rose-400" />
                  <span>Cam Off</span>
                </div>
              )}

              {/* Status Indicator Chip */}
              {cameraStatus === 'active' && (
                <div className="absolute bottom-1 inset-x-1 flex items-center justify-center">
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                      gazeStatus === 'screen'
                        ? 'bg-emerald-600/90 text-white'
                        : gazeStatus === 'desk'
                        ? 'bg-sky-600/90 text-white'
                        : 'bg-rose-600 text-white animate-pulse'
                    }`}
                  >
                    {gazeStatus === 'screen' && <Eye className="w-2.5 h-2.5" />}
                    {gazeStatus === 'desk' && <BookOpen className="w-2.5 h-2.5" />}
                    {gazeStatus === 'away' && <AlertTriangle className="w-2.5 h-2.5" />}
                    {gazeStatus === 'none' && <CameraOff className="w-2.5 h-2.5" />}
                    <span>
                      {gazeStatus === 'screen'
                        ? 'Screen'
                        : gazeStatus === 'desk'
                        ? 'Desk/Notes'
                        : gazeStatus === 'away'
                        ? 'Turned Away'
                        : 'No Face!'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Proctoring Badge */}
            <div className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-purple-200 border border-white/10 backdrop-blur-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${cameraStatus === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{cameraStatus === 'active' ? 'Proctoring Active' : 'Camera Required'}</span>
            </div>
          </div>

          {/* Circular Countdown Timer */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-4 z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#3730A3"
                strokeWidth="8"
                fill="none"
                opacity="0.4"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="url(#timerGrad)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white font-mono">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[11px] font-semibold text-purple-200 mt-1 flex items-center gap-1">
                {isActive ? (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Focusing
                  </span>
                ) : hasStarted ? (
                  <span className="text-amber-300">Paused</span>
                ) : (
                  <span className="text-purple-300">Ready to Start</span>
                )}
              </span>
            </div>
          </div>

          {/* Active Task Pill */}
          <div className="relative z-10 w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-purple-500/80 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{taskTitle}</div>
                <div className="flex items-center gap-1.5 text-[9px] text-purple-200">
                  <span>{selectedMinutes}m Target</span>
                  <span>•</span>
                  <span>
                    {gazeStatus === 'desk'
                      ? '✍️ Desk Notes View'
                      : gazeStatus === 'screen'
                      ? '💻 Screen View'
                      : '👀 Proctor Active'}
                  </span>
                </div>
              </div>
            </div>

            {ambientType !== 'none' && (
              <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-lg border border-purple-400/30 shrink-0">
                🎧 Audio On
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. ALARM RINGING ACTIVE BANNER (With prominent Stop Alarm button) */}
      {isAlarmRinging && (
        <div className="my-3 p-4 bg-rose-50 border-2 border-rose-500 rounded-3xl shadow-xl flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-spin">
              <Bell className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-rose-900">Focus Time Complete! 🔔</h4>
              <p className="text-[10px] text-rose-700">Alarm is ringing...</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStopAlarm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-rose-600/30 active:scale-95 transition flex items-center gap-1.5"
          >
            <BellOff className="w-4 h-4" />
            <span>STOP ALARM</span>
          </button>
        </div>
      )}

      {/* 4. Controls: Start / Pause (with reason required) / Reset / End */}
      <div className="pt-4 flex items-center justify-center gap-4">
        {/* Reset / Restart */}
        <button
          onClick={handleRestart}
          className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs flex items-center justify-center transition active:scale-95"
          title="Restart Session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Main Play / Pause Button */}
        {isActive ? (
          <button
            type="button"
            onClick={handleInitiatePause}
            className="h-14 px-6 rounded-full text-white shadow-lg flex items-center justify-center gap-2 transition active:scale-95 font-bold text-sm bg-slate-900 hover:bg-slate-800 shadow-slate-900/30"
            title="Pause Focus (Reason required)"
          >
            <Pause className="w-5 h-5 fill-white" />
            <span>Pause Focus</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartTimer}
            className={`h-14 px-6 rounded-full text-white shadow-lg flex items-center justify-center gap-2 transition active:scale-95 font-bold text-sm ${
              isAlarmRinging
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 animate-pulse'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/30'
            }`}
            title={isAlarmRinging ? 'Stop Alarm' : 'Start Focus'}
          >
            {isAlarmRinging ? (
              <>
                <BellOff className="w-5 h-5 fill-white" />
                <span>STOP ALARM</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white ml-0.5" />
                <span>{hasStarted ? 'Resume Focus' : 'Start Focus (Camera On)'}</span>
              </>
            )}
          </button>
        )}

        {/* End & View Report */}
        <button
          onClick={handleEnd}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-500/20 flex items-center justify-center transition active:scale-95"
          title="Finish & Generate Focus Report"
        >
          <Square className="w-4 h-4 fill-white" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. CAMERA REQUIRED BLOCKING MODAL                         */}
      {/* ========================================================= */}
      {showCameraRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Camera Required for Focus Mode
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                To prevent slacking or unmonitored distractions, your webcam must remain turned on during Focus Mode.
                Focus mode cannot run without camera verification.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 text-left space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-900">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>What is permitted:</span>
              </div>
              <p>• Looking directly at the screen</p>
              <p>• Looking down at desk / reading notebooks</p>
              <p className="text-rose-700 font-bold">• Looking away or switching tabs triggers alert sounds!</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCameraRequiredModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowCameraRequiredModal(false);
                  const ok = await startCamera();
                  if (ok) {
                    setHasStarted(true);
                    setIsActive(true);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                Enable Camera & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PAUSE REASON MODAL (Mandatory Accountability)          */}
      {/* ========================================================= */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pause Focus Session</h3>
                  <p className="text-[10px] text-slate-400">Explain why you need to pause</p>
                </div>
              </div>

              <button
                onClick={() => setShowPauseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              To keep you disciplined, explain what you are stepping away for:
            </p>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                '📚 Grabbing textbook or notes',
                '✏️ Getting stationery / calculator',
                '💧 Water or restroom break',
                '❓ Question regarding assignment',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setPauseReasonInput(chip)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border text-left transition ${
                    pauseReasonInput === chip
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Custom Reason:
              </label>
              <input
                type="text"
                value={pauseReasonInput}
                onChange={(e) => setPauseReasonInput(e.target.value)}
                placeholder="e.g. Fetching lab worksheet..."
                className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Continue Focusing
              </button>
              <button
                type="button"
                onClick={handleConfirmPause}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. FOCUS & ATTENTION PROCTORING REPORT MODAL              */}
      {/* ========================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Session Focus & Proctoring Report
              </h3>
              <p className="text-xs text-slate-400">
                {taskTitle} • {formatTime(totalSeconds - secondsLeft)} Elapsed
              </p>
            </div>

            {/* TASK COMPLETION PROMPT CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  Did you complete "{taskTitle}"?
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Marking completed will automatically update your task list and record your progress.
                </p>
              </div>

              {/* Action Buttons: Yes, Completed vs No, Need More Time */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmTaskCompleted}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition flex flex-col items-center justify-center gap-1 group"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Yes, Completed!</span>
                  <span className="text-[9px] font-normal text-emerald-100">Auto-mark task done</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNeedMoreTimePrompt(!needMoreTimePrompt)}
                  className={`p-3 rounded-2xl font-bold text-xs shadow-md active:scale-95 transition flex flex-col items-center justify-center gap-1 border ${
                    needMoreTimePrompt
                      ? 'bg-amber-600 text-white border-amber-600 shadow-amber-600/25'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200 shadow-amber-500/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${needMoreTimePrompt ? 'bg-white/20' : 'bg-amber-100'}`}>
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>No, Need More Time</span>
                  <span className={`text-[9px] font-normal ${needMoreTimePrompt ? 'text-amber-100' : 'text-amber-600'}`}>
                    Reopen timer & continue
                  </span>
                </button>
              </div>

              {/* If "Need More Time": Time Selector */}
              {needMoreTimePrompt && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-amber-200 text-left space-y-2 animate-fade-in shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>How much more time do you need?</span>
                    <span className="text-[10px] text-amber-600 font-normal">Timer will resume</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 25].map((extra) => (
                      <button
                        key={extra}
                        type="button"
                        onClick={() => handleExtendFocusSession(extra)}
                        className="py-2.5 px-1 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex flex-col items-center"
                      >
                        <span>+{extra}m</span>
                        <span className="text-[8px] font-normal opacity-80">More</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExtendFocusSession(selectedMinutes)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition"
                  >
                    Repeat previous {selectedMinutes}m focus block
                  </button>
                </div>
              )}
            </div>

            {/* Score Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider block">
                  Focus Integrity Score
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {calculateFocusScore()}%
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    calculateFocusScore() >= 85
                      ? 'bg-emerald-100 text-emerald-700'
                      : calculateFocusScore() >= 70
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {calculateFocusScore() >= 85
                    ? 'Grade A • High Focus'
                    : calculateFocusScore() >= 70
                    ? 'Grade B • Moderate'
                    : 'Grade C • High Distraction'}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tab Switches</span>
                <span className={`text-base font-black ${distractionStats.tabSwitches > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {distractionStats.tabSwitches}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Looked Away</span>
                <span className={`text-base font-black ${distractionStats.lookAwayEvents > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {distractionStats.lookAwayEvents}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pauses Logged</span>
                <span className="text-base font-black text-slate-800">
                  {pauseLogs.length}
                </span>
              </div>
            </div>

            {/* Proctor Feedback Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>AI Proctor Evaluation:</span>
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {distractionStats.tabSwitches === 0 && distractionStats.lookAwayEvents === 0
                  ? 'Outstanding discipline! You stayed locked onto your screen and study desk throughout the entire session without wandering.'
                  : `You completed your focus session with ${distractionStats.tabSwitches} tab switch(es) and ${distractionStats.lookAwayEvents} look-away incident(s). Desk note reading was recognized and accepted.`}
              </p>
            </div>

            {/* Pauses Logged List */}
            {pauseLogs.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Logged Pause Reasons ({pauseLogs.length}):
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {pauseLogs.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-800">{p.reason}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleCompleteAndExit(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Exit (Keep Incomplete)
              </button>
              <button
                type="button"
                onClick={handleConfirmTaskCompleted}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Mark Completed & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. FOCUS SETTINGS MODAL                                   */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Focus & Alarm Settings</h3>
                  <p className="text-[10px] text-slate-400">Configure alarm sound, custom music, and ambience</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.stopAlarm();
                  setPreviewingSound(null);
                  setIsSettingsOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden Audio Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*,.mp3,.wav,.ogg,.m4a"
              className="hidden"
              onChange={handleCustomAudioUpload}
            />

            {/* Section A: Alarm Sound Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Alarm Sound on Completion:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'digital_chime', name: 'Digital Chime', icon: Bell },
                  { id: 'zen_bell', name: 'Zen Bell', icon: Sparkles },
                  { id: 'classic_beep', name: 'Classic Beep', icon: Clock },
                  { id: 'melodic_gong', name: 'Melodic Gong', icon: Music },
                ].map((sound) => {
                  const isSelected = alarmType === sound.id;
                  const Icon = sound.icon;
                  return (
                    <div
                      key={sound.id}
                      className={`p-2.5 rounded-2xl border transition flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                          : 'border-slate-200 bg-white hover:border-purple-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setAlarmType(sound.id as AlarmSoundType)}
                        className="flex items-center gap-2 text-left min-w-0 flex-1"
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-800 truncate">{sound.name}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePreviewAlarm(sound.id as AlarmSoundType)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition ${
                          previewingSound === sound.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 hover:bg-purple-100 text-slate-600'
                        }`}
                        title="Preview sound"
                      >
                        {previewingSound === sound.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Upload Custom Music Alarm Card */}
              <div
                className={`p-3 rounded-2xl border transition ${
                  alarmType === 'custom'
                    ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {customAlarmName ? customAlarmName : 'Upload Your Own Music Alarm'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {customAlarmName ? 'Custom MP3 / WAV alarm loaded' : 'Upload custom MP3, WAV or ringtone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {customAlarmData ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setAlarmType('custom');
                            handlePreviewAlarm('custom');
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold ${
                            previewingSound === 'custom'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Test uploaded sound"
                        >
                          {previewingSound === 'custom' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlarmType('custom')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                            alarmType === 'custom'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveCustomAudio}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove custom audio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Audio</span>
                      </button>
                    )}
                  </div>
                </div>

                {customAlarmData && (
                  <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active Custom Audio
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-600 hover:underline font-bold text-[10px]"
                    >
                      Replace File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section B: Ambient Background Sound during focus */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-purple-600" />
                <span>Focus Background Sound (Plays while active):</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'Silent / Off' },
                  { id: 'brown_noise', label: 'Deep Brown Noise' },
                  { id: 'gentle_rain', label: 'Gentle Rain' },
                  { id: 'binaural_40hz', label: '40Hz Gamma Focus' },
                ].map((item) => {
                  const isSelected = ambientType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAmbientType(item.id as AmbientSoundType)}
                      className={`p-2 rounded-xl text-xs font-bold text-left transition border ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section C: Volumes */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Alarm Volume:</span>
                  <span>{Math.round(alarmVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={alarmVolume}
                  onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {ambientType !== 'none' && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Background Sound Volume:</span>
                    <span>{Math.round(ambientVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.stopAlarm();
                  setPreviewingSound(null);
                  setIsSettingsOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
