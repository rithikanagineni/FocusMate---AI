import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Camera,
  Mic,
  Folder,
  FileText,
  Sparkles,
  Upload,
  RefreshCw,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Image as ImageIcon
} from 'lucide-react';

interface CaptureCardProps {
  initialMode?: 'camera' | 'voice' | 'upload' | 'files' | 'screenshot' | 'text';
  onCaptureCompleted: (type: string, content: string, title?: string) => void;
  onCancel: () => void;
}

export const CaptureCard: React.FC<CaptureCardProps> = ({
  initialMode = 'camera',
  onCaptureCompleted,
  onCancel,
}) => {
  // Normalize initial mode
  const normalizedInitial =
    initialMode === 'upload' || initialMode === 'screenshot'
      ? 'files'
      : initialMode === 'voice'
      ? 'voice'
      : initialMode === 'text'
      ? 'text'
      : 'camera';

  const [selectedType, setSelectedType] = useState<'camera' | 'voice' | 'files' | 'text'>(
    normalizedInitial
  );

  // -------------------------------------------------------------
  // CAMERA STATE & REFS
  // -------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // -------------------------------------------------------------
  // VOICE STATE & REFS
  // -------------------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceVolume, setVoiceVolume] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // -------------------------------------------------------------
  // FILES STATE & REFS
  // -------------------------------------------------------------
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    preview?: string;
    content: string;
    notes?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // -------------------------------------------------------------
  // TEXT STATE
  // -------------------------------------------------------------
  const [noteText, setNoteText] = useState('');

  // -------------------------------------------------------------
  // TABS CONFIGURATION
  // -------------------------------------------------------------
  const tabs = [
    { id: 'camera' as const, label: 'Camera', icon: Camera, color: 'text-purple-600', activeBg: 'bg-purple-600' },
    { id: 'voice' as const, label: 'Voice', icon: Mic, color: 'text-rose-500', activeBg: 'bg-rose-500' },
    { id: 'files' as const, label: 'Files', icon: Folder, color: 'text-emerald-500', activeBg: 'bg-emerald-600' },
    { id: 'text' as const, label: 'Text', icon: FileText, color: 'text-sky-500', activeBg: 'bg-sky-600' },
  ];

  // -------------------------------------------------------------
  // LIFECYCLE / CLEANUP
  // -------------------------------------------------------------
  useEffect(() => {
    // When mode changes to camera, start camera stream
    if (selectedType === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    // Stop recording if leaving voice tab
    if (selectedType !== 'voice') {
      stopVoiceRecording();
    }

    return () => {
      stopCamera();
      stopVoiceRecording();
    };
  }, [selectedType]);

  // -------------------------------------------------------------
  // CAMERA METHODS
  // -------------------------------------------------------------
  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam access not supported in this browser. Please use photo upload.');
      return;
    }

    try {
      // Try environment/back camera first, fallback to user/front
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access unavailable or blocked. You can upload an image directly.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleCameraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeCamera = () => {
    // Content to analyze
    const textContent =
      'WhatsApp Note from Prof. Sharma: Submit ML Assignment 3 by Thursday 6 PM on portal. Review Chapter 3 & 4 for Friday test. Bring project slide deck for Friday review.';
    onCaptureCompleted('camera', capturedImage || textContent, 'Camera Photo Capture');
  };

  // -------------------------------------------------------------
  // VOICE METHODS
  // -------------------------------------------------------------
  const startVoiceRecording = async () => {
    setVoiceTranscript('');
    setRecordingSeconds(0);
    setIsRecording(true);

    // 1. Web Speech API (Live transcript)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setVoiceTranscript(current.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init error:', e);
      }
    }

    // 2. Audio Stream & Visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!audioStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setVoiceVolume(Math.min(100, Math.round(avg * 1.5)));
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn('Audio stream error (simulating recording waves):', err);
      // Simulate live recording waveform if mic permission denied
      const interval = setInterval(() => {
        setVoiceVolume(Math.floor(Math.random() * 60) + 20);
      }, 150);
      return () => clearInterval(interval);
    }

    // 3. Seconds timer
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVoiceVolume(0);
  };

  const handleAnalyzeVoice = () => {
    const textToAnalyze =
      voiceTranscript.trim() ||
      'I need to finish my machine learning assignment by tomorrow 6 PM, review chapter 3 and 4 for the Friday exam, and attend the 2 PM project review.';
    onCaptureCompleted('voice', textToAnalyze, 'Voice Note');
  };

  // -------------------------------------------------------------
  // FILES METHODS
  // -------------------------------------------------------------
  const handleFileUpload = (file: File) => {
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedFile({
          name: file.name,
          size: sizeFormatted,
          type: file.type,
          preview: dataUrl,
          content: dataUrl,
          notes: '',
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = (reader.result as string) || '';
        // If file is readable text (txt, md, json, csv, etc.)
        setUploadedFile({
          name: file.name,
          size: sizeFormatted,
          type: file.type,
          content: raw.trim() || `Uploaded document: ${file.name}\nPlease review and extract tasks.`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeFiles = () => {
    if (!uploadedFile) return;
    const isImage = uploadedFile.content.startsWith('data:image/');
    const contentToSend = isImage
      ? (uploadedFile.notes ? `${uploadedFile.notes}\n[Image: ${uploadedFile.name}]` : uploadedFile.content)
      : uploadedFile.content;
    onCaptureCompleted('document', contentToSend, uploadedFile.name);
  };

  // -------------------------------------------------------------
  // TEXT METHODS
  // -------------------------------------------------------------
  const handleAnalyzeText = () => {
    const textToAnalyze =
      noteText.trim() ||
      'Submit ML assignment by Thursday 6 PM. Prepare chapters 3 and 4 for Friday test. Bring project presentation on Friday 2 PM.';
    onCaptureCompleted('text', textToAnalyze, 'Text Note');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[550px] justify-between p-4 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-xl text-slate-800 animate-fade-in">
      {/* Hidden canvas for taking snapshot frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            AI Multimodal Capture
          </h2>

          <div className="w-16" />
        </div>

        {/* 4 Mode Switcher Tabs */}
        <div className="grid grid-cols-4 gap-2 pt-4 pb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                  isSelected
                    ? `${tab.activeBg} text-white border-transparent shadow-md shadow-purple-500/20 font-bold`
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : tab.color}`} />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 1. CAMERA TAB VIEW                                        */}
        {/* ========================================================= */}
        {selectedType === 'camera' && (
          <div className="space-y-4 animate-fade-in">
            <input
              type="file"
              ref={cameraFileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraPhotoUpload}
            />

            {!capturedImage ? (
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video sm:aspect-16/10 flex flex-col items-center justify-center text-white border border-slate-800 shadow-inner">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : 'block'}`}
                />

                {/* Viewfinder Overlay Frame */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-purple-300">
                        AI Vision Scanner
                      </span>
                      <div className="w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
                    </div>
                  </div>
                )}

                {/* Camera Fallback / Permission Notice */}
                {!isCameraActive && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-300 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Live Camera Viewfinder</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {cameraError || 'Take a clear photo of your whiteboard, handwritten notes, or textbook.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-2 px-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        Enable Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraFileInputRef.current?.click()}
                        className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Shutter Button when camera active */}
                {isCameraActive && (
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => cameraFileInputRef.current?.click()}
                      className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
                      title="Upload photo from device"
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="w-16 h-16 rounded-full border-4 border-white bg-purple-600 hover:bg-purple-500 shadow-xl transition-all active:scale-90 flex items-center justify-center"
                      title="Take Snapshot"
                    >
                      <div className="w-6 h-6 rounded-full bg-white" />
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition"
                      title="Refresh camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Photo Captured Preview */
              <div className="space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video sm:aspect-16/10 border border-slate-200">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo Captured</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraFileInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Different Photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                Quick Sample Whiteboard & Note Presets:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(
                      'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=350&fit=crop'
                    );
                    stopCamera();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-purple-700 hover:border-purple-300 transition"
                >
                  📝 Assignment Whiteboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=350&fit=crop'
                    );
                    stopCamera();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-purple-700 hover:border-purple-300 transition"
                >
                  📋 Syllabus Screenshot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. VOICE TAB VIEW                                         */}
        {/* ========================================================= */}
        {selectedType === 'voice' && (
          <div className="space-y-4 animate-fade-in text-center py-2">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-rose-50/80 to-purple-50/50 border border-rose-100 flex flex-col items-center justify-center space-y-4">
              {/* Pulsing Mic Button */}
              <div className="relative">
                {isRecording && (
                  <div
                    className="absolute -inset-4 rounded-full bg-rose-400/25 animate-ping"
                    style={{ transform: `scale(${1 + voiceVolume / 80})` }}
                  />
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-rose-500/30'
                      : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-sm'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-7 h-7 fill-white" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Status and Timer */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1.5">
                  {isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      <span>Recording: {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                    </>
                  ) : (
                    <span>Tap to start speaking your tasks & deadlines</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isRecording ? 'Listening live... speak naturally.' : 'Supports natural phrases like "Prepare Chapter 3 by Friday".'}
                </p>
              </div>

              {/* Live Transcript Bubble */}
              <div className="w-full bg-white rounded-2xl p-3 border border-slate-200 text-left min-h-[70px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Live Transcript
                </span>
                <p className="text-xs font-semibold text-slate-800 italic">
                  {voiceTranscript || (
                    <span className="text-slate-400 font-normal">
                      {isRecording ? 'Speak now... words will appear here' : 'No voice recorded yet.'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Spoken Presets */}
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setVoiceTranscript(
                    'I have to submit my machine learning assignment by Thursday 6 PM and review chapter 3 for Friday test.'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition"
              >
                🎙️ Sample Note: "Submit ML Assignment..."
              </button>
              <button
                type="button"
                onClick={() =>
                  setVoiceTranscript(
                    'Finalize the team project presentation slides by Friday 2 PM and attend sync meeting.'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
              >
                🎙️ Sample Note: "Finalize Project Presentation..."
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. FILES TAB VIEW                                         */}
        {/* ========================================================= */}
        {selectedType === 'files' && (
          <div className="space-y-4 animate-fade-in">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {!uploadedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-3xl border-2 border-dashed text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Upload Document, PDF or Screenshot</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Drag and drop your syllabus, homework PDF, or screenshot here
                  </p>
                </div>
                <button
                  type="button"
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt="preview"
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {uploadedFile.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{uploadedFile.size}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shrink-0"
                  >
                    Change File
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>
                      {uploadedFile.content.startsWith('data:image/')
                        ? 'Image Instructions / Notes (optional):'
                        : 'Extracted File Content (Editable):'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      ✓ Real file data loaded
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={
                      uploadedFile.content.startsWith('data:image/')
                        ? (uploadedFile.notes || '')
                        : uploadedFile.content
                    }
                    onChange={(e) => {
                      if (uploadedFile.content.startsWith('data:image/')) {
                        setUploadedFile({ ...uploadedFile, notes: e.target.value });
                      } else {
                        setUploadedFile({ ...uploadedFile, content: e.target.value });
                      }
                    }}
                    placeholder={
                      uploadedFile.content.startsWith('data:image/')
                        ? 'Add custom notes or specific deadlines for this image...'
                        : 'Review or paste additional text...'
                    }
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-2xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Document Presets */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                Quick Sample Document Templates:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setUploadedFile({
                      name: 'Course_Syllabus_Fall.pdf',
                      size: '420 KB',
                      type: 'application/pdf',
                      content:
                        'SYLLABUS: Machine Learning Assignment 3 due Thursday 6 PM. Chapters 3 & 4 test Friday.',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-emerald-700 hover:border-emerald-300 transition"
                >
                  📄 Course_Syllabus.pdf
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setUploadedFile({
                      name: 'Project_Milestones.docx',
                      size: '185 KB',
                      type: 'application/docx',
                      content:
                        'PROJECT DELIVERABLES: Architecture slide review at 2 PM Friday. Final code commit due Friday 11:59 PM.',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-emerald-700 hover:border-emerald-300 transition"
                >
                  📑 Project_Milestones.docx
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. TEXT TAB VIEW                                          */}
        {/* ========================================================= */}
        {selectedType === 'text' && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 focus-within:border-sky-500 transition">
              <textarea
                rows={5}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Paste WhatsApp message from your professor, study notes, or type your tasks here..."
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none bg-transparent"
              />
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">
                Quick Sample Text Templates:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setNoteText(
                      'Prof. Sharma: Reminder to submit ML Assignment 3 by Thursday 6:00 PM on portal. Review Chapters 3 & 4 for Friday test. Group presentation Friday 2:00 PM.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-sky-700 hover:bg-sky-50 transition"
                >
                  💬 WhatsApp Prof Announcement
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNoteText(
                      'Daily Goals: Finish algorithm exercises by 4 PM, call group partners for project sync at 5:30 PM, read research paper before bed.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-sky-700 hover:bg-sky-50 transition"
                >
                  📝 Daily Study Goals
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BOTTOM ANALYZE BUTTON (Runs AI Pipeline for current mode) */}
      {/* ========================================================= */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        {selectedType === 'camera' && (
          <button
            type="button"
            onClick={handleAnalyzeCamera}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Analyze Photo & Extract Tasks</span>
          </button>
        )}

        {selectedType === 'voice' && (
          <button
            type="button"
            onClick={handleAnalyzeVoice}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Analyze Voice Note</span>
          </button>
        )}

        {selectedType === 'files' && (
          <button
            type="button"
            onClick={handleAnalyzeFiles}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Analyze Document</span>
          </button>
        )}

        {selectedType === 'text' && (
          <button
            type="button"
            onClick={handleAnalyzeText}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-sky-600/25 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Analyze Text Notes</span>
          </button>
        )}
      </div>
    </div>
  );
};
