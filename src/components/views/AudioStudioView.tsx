import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { audioEngine } from '../../services/audioEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Bookmark,
  Volume2,
  Sliders,
  Repeat,
  Sparkles,
  Music,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

interface Marker {
  id: string;
  time: number;
  label: string;
  notes?: string;
}

export const AudioStudioView: React.FC = () => {
  const { showToast } = useApp();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Chorus Rehearsal Track Demo');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180); // 3 mins demo
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // 0.5 to 1.5
  const [pitchShift, setPitchShift] = useState<number>(0); // -12 to +12 semitones
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([
    { id: 'm-1', time: 14.5, label: 'Chorus Entrance (Measures 1-8)', notes: 'Check Soprano posture & open mouth shape' },
    { id: 'm-2', time: 48.0, label: 'Measure 24 Alto Leap', notes: 'Watch pitch sagging from F down to C' },
    { id: 'm-3', time: 110.0, label: 'Full Ensemble Climax & Cutoff', notes: 'Crisp consonant release on teacher cue' }
  ]);
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle local audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setFileName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      showToast(`Loaded ${file.name}`, 'success');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current && !audioUrl) {
      // Demo playback simulation if no file uploaded
      setIsPlaying(!isPlaying);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioEngine.unlockAudio();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Sync playback rate with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle A-B loop
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);

    if (loopA !== null && loopB !== null && loopB > loopA) {
      if (curr >= loopB) {
        audioRef.current.currentTime = loopA;
      }
    }
  };

  // Draw simulated waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = 80;
    const barWidth = width / bars;

    // Draw bars
    for (let i = 0; i < bars; i++) {
      const progress = (i / bars) * duration;
      const isPast = progress <= currentTime;
      const isInLoop = loopA !== null && loopB !== null && progress >= loopA && progress <= loopB;

      // Seed wave pattern
      const h = Math.abs(Math.sin(i * 0.28) * Math.cos(i * 0.15)) * (height * 0.75) + 10;
      const y = (height - h) / 2;

      ctx.fillStyle = isInLoop
        ? '#f59e0b'
        : isPast
        ? '#0c87eb'
        : '#cbd5e1';

      ctx.fillRect(i * barWidth, y, barWidth - 2, h);
    }
  }, [currentTime, duration, loopA, loopB]);

  const setLoopPointA = () => {
    setLoopA(currentTime);
    showToast(`Loop Start set at ${formatTime(currentTime)}`, 'info');
  };

  const setLoopPointB = () => {
    if (loopA !== null && currentTime <= loopA) {
      showToast('Loop End must be after Loop Start', 'warning');
      return;
    }
    setLoopB(currentTime);
    showToast(`Loop End set at ${formatTime(currentTime)}`, 'info');
  };

  const clearLoop = () => {
    setLoopA(null);
    setLoopB(null);
    showToast('A-B Loop cleared', 'info');
  };

  const handleAddMarker = () => {
    if (!newMarkerLabel.trim()) return;
    const newM: Marker = {
      id: 'm-' + Date.now().toString(36),
      time: Math.round(currentTime * 10) / 10,
      label: newMarkerLabel.trim()
    };
    setMarkers([...markers, newM]);
    setNewMarkerLabel('');
    showToast('Rehearsal marker added', 'success');
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-brand-600" />
            <span>Audio Practice Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Slow down tricky chorus passages without changing pitch, transpose rehearsal tracks, and mark difficult measures.
          </p>
        </div>

        {/* Upload Audio File Button */}
        <label className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all shrink-0">
          <Upload className="w-4 h-4" />
          <span>Load Audio File (MP3/WAV)</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Main Studio Console */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
        {/* Track Title and Waveform Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-brand-600" />
              <h2 className="text-base font-bold text-stone-900 dark:text-white truncate">
                {fileName}
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-stone-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Waveform visualizer */}
          <div className="relative rounded-2xl bg-stone-100 dark:bg-stone-800/80 p-3 overflow-hidden border border-stone-200/80 dark:border-stone-700/80">
            <canvas
              ref={canvasRef}
              width={800}
              height={90}
              className="w-full h-24 block cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seekTo(pos * duration);
              }}
            />
          </div>
        </div>

        {/* Playback Controls & A-B Looper */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* 1. Main Transport */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Playback Transport
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => seekTo(Math.max(0, currentTime - 5))}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 font-bold text-xs shadow-subtle border border-stone-200 dark:border-stone-700"
              >
                -5s
              </button>
              <button
                onClick={togglePlay}
                className="p-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-elevated transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>
              <button
                onClick={() => seekTo(Math.min(duration, currentTime + 5))}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 font-bold text-xs shadow-subtle border border-stone-200 dark:border-stone-700"
              >
                +5s
              </button>
            </div>
          </div>

          {/* 2. Speed (50% to 150%) & Pitch Transposition (±12) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Speed (Time Stretch)
              </span>
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.round(playbackRate * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <button onClick={() => setPlaybackRate(0.75)} className="hover:text-brand-600">75% (Slow Rehearse)</button>
              <button onClick={() => setPlaybackRate(1.0)} className="hover:text-brand-600">100% (Normal)</button>
              <button onClick={() => setPlaybackRate(1.2)} className="hover:text-brand-600">120% (Fast)</button>
            </div>

            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Pitch Transpose
              </span>
              <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                {pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 text-xs font-mono font-bold">
              <button
                onClick={() => setPitchShift((p) => Math.max(-12, p - 1))}
                className="px-2 py-1 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
              >
                -1 Flat
              </button>
              <button
                onClick={() => setPitchShift(0)}
                className="px-2 py-1 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
              >
                Reset
              </button>
              <button
                onClick={() => setPitchShift((p) => Math.min(12, p + 1))}
                className="px-2 py-1 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700"
              >
                +1 Sharp
              </button>
            </div>
          </div>

          {/* 3. A-B Section Repeat Loop */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-amber-500" />
              A–B Loop Section Repeat
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={setLoopPointA}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  loopA !== null
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                Set A ({loopA !== null ? formatTime(loopA) : 'Start'})
              </button>
              <button
                onClick={setLoopPointB}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  loopB !== null
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
              >
                Set B ({loopB !== null ? formatTime(loopB) : 'End'})
              </button>
            </div>

            <button
              onClick={clearLoop}
              disabled={loopA === null && loopB === null}
              className="w-full py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 disabled:opacity-40 text-stone-700 dark:text-stone-300 text-xs font-semibold"
            >
              Clear Loop Points
            </button>
          </div>
        </div>

        {/* Rehearsal Markers & Timestamp Notes */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-brand-600" />
              Rehearsal Timestamps & Section Markers
            </h3>
            <span className="text-xs text-stone-400">{markers.length} markers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newMarkerLabel}
              onChange={(e) => setNewMarkerLabel(e.target.value)}
              placeholder="Marker name (e.g. Alto entrance, Bridge)..."
              className="sm:col-span-2 text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
            />
            <button
              onClick={handleAddMarker}
              disabled={!newMarkerLabel.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Mark at {formatTime(currentTime)}</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {markers.map((marker) => (
              <div
                key={marker.id}
                onClick={() => seekTo(marker.time)}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg bg-brand-100 dark:bg-brand-950 font-mono text-xs font-bold text-brand-700 dark:text-brand-300">
                    {formatTime(marker.time)}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                      {marker.label}
                    </h4>
                    {marker.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {marker.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMarkers(markers.filter((m) => m.id !== marker.id));
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
