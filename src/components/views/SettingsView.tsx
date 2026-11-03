import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  FolderSync,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Palette,
  User,
  School,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences, showToast } = useApp();

  const [appName, setAppName] = useState(preferences.appName);
  const [teacherName, setTeacherName] = useState(preferences.teacherName);
  const [schoolName, setSchoolName] = useState(preferences.schoolName);
  const [roomNumber, setRoomNumber] = useState(preferences.roomNumber);
  const [defaultDuration, setDefaultDuration] = useState(preferences.defaultClassDuration || 40);
  const [driveClientId, setDriveClientId] = useState(preferences.googleDriveClientId || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      appName: appName.trim() || 'Music Teacher Hub',
      teacherName: teacherName.trim(),
      schoolName: schoolName.trim(),
      roomNumber: roomNumber.trim(),
      defaultClassDuration: Number(defaultDuration) || 40,
      googleDriveClientId: driveClientId.trim()
    });
    showToast('Preferences updated successfully', 'success');
  };

  const handleExportBackup = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `music-teacher-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup downloaded successfully', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importAllData(content);
        if (success) {
          showToast('Data restored from backup!', 'success');
        } else {
          showToast('Failed to parse backup JSON file.', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all data to default elementary music curriculum data? This will overwrite local changes.')) {
      storage.resetToDefaults();
      showToast('Reset to default demo data', 'info');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-stone-600" />
          <span>App Settings & Data Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Configure teacher profile, app title, Google Drive link parameters, and export data backups.
        </p>
      </div>

      {/* 1. App Identity & Teacher Profile */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          <span>Teacher Profile & Classroom Identity</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
              Application Title (Configurable)
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Music Teacher Hub"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
              Teacher Name
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="e.g. Christian Arthur"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
              School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Lincoln Elementary School"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
              Room / Music Cart Label
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Room 104 / Cart A"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
              Default Lesson Duration (Minutes)
            </label>
            <select
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value))}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
            >
              <option value="30">30 minutes</option>
              <option value="35">35 minutes</option>
              <option value="40">40 minutes (Standard)</option>
              <option value="45">45 minutes</option>
              <option value="50">50 minutes</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          Save Profile Preferences
        </button>
      </form>

      {/* 2. Google Drive Integration Status & Config */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2">
          <FolderSync className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-stone-900 dark:text-white">
            Google Drive Integration Architecture
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-200 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Mode: Link-Based & Document Resource Library</span>
          </div>
          <p className="leading-relaxed">
            The app operates with zero required district IT OAuth approvals. Paste any Google Drive folder, Google Doc, Sheet, Slide, or PDF URL to organize resources by grade and musical concept. Files open directly in authorized Google Workspace tabs.
          </p>
        </div>

        <div className="pt-2">
          <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
            Optional Google OAuth 2.0 Client ID (for Google Picker API)
          </label>
          <input
            type="text"
            value={driveClientId}
            onChange={(e) => setDriveClientId(e.target.value)}
            placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
            className="w-full text-xs font-mono px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Leave blank to continue using the fully functional link-based library without OAuth restrictions.
          </p>
        </div>
      </div>

      {/* 3. Persistence, Backup & Restore */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Local Storage, Backup & JSON Export</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          All tasks, curriculum lesson plans, chorus repertoire, seating charts, and journal entries are securely persisted locally on your device and can work completely offline on school Chromebooks and iPads.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export All Data (JSON Backup)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-stone-200 dark:border-stone-700">
            <Upload className="w-4 h-4" />
            <span>Restore Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 dark:bg-stone-800 dark:text-stone-400 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-all ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
