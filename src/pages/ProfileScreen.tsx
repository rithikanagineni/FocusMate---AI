import React, { useState, useRef } from 'react';
import { SUPPORTED_MODELS, AIService } from '../services/aiService';
import { UserProfile, AuthService } from '../services/authService';
import {
  User,
  Cpu,
  Clock,
  ShieldCheck,
  Smartphone,
  Trash2,
  Sparkles,
  Check,
  Bell,
  Volume2,
  Camera,
  Edit2,
  LogOut,
  X,
  Upload
} from 'lucide-react';

interface ProfileScreenProps {
  user?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
  onSignOut?: () => void;
  onClearTasks?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onClearTasks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback user if not passed
  const currentUser: UserProfile = user || {
    id: 'user-rithika',
    name: 'Rithika Nagineni',
    email: 'rithikanagineni@gmail.com',
    role: 'Pro Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    bio: 'Computer Science student & AI enthusiast. Staying focused on deep work and daily milestones.',
    streakDays: 5,
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editRole, setEditRole] = useState(currentUser.role);
  const [editBio, setEditBio] = useState(currentUser.bio || '');

  const [selectedModel, setSelectedModel] = useState(AIService.getSelectedModel());
  const [processingMode, setProcessingMode] = useState<'auto' | 'local' | 'cloud'>(
    AIService.getProcessingMode()
  );
  const [enableSound, setEnableSound] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = { ...currentUser, avatar: dataUrl };
      AuthService.updateProfile(updated);
      onUpdateUser?.(updated);
      triggerSaveToast();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      email: editEmail.trim() || currentUser.email,
      role: editRole.trim() || currentUser.role,
      bio: editBio.trim(),
    };

    AuthService.updateProfile(updated);
    onUpdateUser?.(updated);
    setIsEditModalOpen(false);
    triggerSaveToast();
  };

  const handleSelectPresetAvatar = (url: string) => {
    const updated = { ...currentUser, avatar: url };
    AuthService.updateProfile(updated);
    onUpdateUser?.(updated);
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-4 pb-8 w-full max-w-3xl mx-auto animate-fade-in text-slate-800">
      {/* Save Toast */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
          <Check className="w-3.5 h-3.5" />
          <span>Profile changes saved</span>
        </div>
      )}

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* User Profile Card with Edit & Upload */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative">
        <div className="flex items-start gap-4">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 p-0.5 shadow-md overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md transition active:scale-95"
              title="Upload new profile picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate">
                {currentUser.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditName(currentUser.name);
                    setEditEmail(currentUser.email);
                    setEditRole(currentUser.role);
                    setEditBio(currentUser.bio || '');
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition flex items-center gap-1 active:scale-95"
                    title="Sign Out to Home Page"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-0.5 truncate">{currentUser.email}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {currentUser.role}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Streak: {currentUser.streakDays} days
              </span>
            </div>
          </div>
        </div>

        {/* Quick Upload / Edit Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Preset Avatars Selector */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900">Choose Profile Avatar</h4>
        <div className="flex items-center gap-3">
          {presetAvatars.map((url, i) => (
            <button
              key={i}
              onClick={() => handleSelectPresetAvatar(url)}
              className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition active:scale-95 ${
                currentUser.avatar === url
                  ? 'border-purple-600 ring-2 ring-purple-300'
                  : 'border-transparent hover:border-slate-200'
              }`}
            >
              <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* AI Processing Settings */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Processing Engine</h4>
              <p className="text-[10px] text-slate-400">On-device smart scheduling & analysis</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Account & Data Management */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900">Account & Storage</h4>

        {onClearTasks && (
          <button
            onClick={() => {
              if (window.confirm('Clear all tasks for this account?')) {
                onClearTasks();
              }
            }}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Tasks for Current Account</span>
            </span>
            <span className="text-[10px] text-slate-400">Clean</span>
          </button>
        )}
      </div>

      {/* SIGN OUT BUTTON */}
      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 transition flex items-center justify-center gap-2 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of FocusMind</span>
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Bio / Focus Goal
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-purple-600 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
