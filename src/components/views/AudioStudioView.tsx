import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { audioEngine } from '../../services/audioEngine';
import { studioAudioEngine } from '../../services/pitchShifterAudio';
import {
  generateRecorderAccompaniment,
  generateOrffGroove,
  generateSteadyBeatMarch
} from '../../services/soundGenerator';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Upload,
  FolderOpen,
  Bookmark,
  Volume2,
  Sliders,
  Repeat,
  Shuffle,
  Music,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ListMusic,
  FileAudio
} from 'lucide-react';

export interface StudioTrack {
  id: string;
  title: string;
  url: string;
  artist?: string;
  duration?: number;
  source: 'local' | 'uploaded' | 'bundled';
  fileType?: string;
}

interface Marker {
  id: string;
  time: number;
  label: string;
  notes?: string;
}

export const AudioStudioView: React.FC = () => {
  const { showToast } = useApp();

  // Playlist State initialized with bundled classroom accompaniment tracks
  const [playlist, setPlaylist] = useState<StudioTrack[]>(() => {
    try {
      return [
        {
          id: 'bundle-1',
          title: 'Recorder Karate Backing Track (76 BPM)',
          url: generateRecorderAccompaniment(),
          artist: 'Classroom Accompaniment',
          source: 'bundled',
          fileType: 'WAV'
        },
        {
          id: 'bundle-2',
          title: 'Orff Pentatonic Jam (C Major, 104 BPM)',
          url: generateOrffGroove(),
          artist: 'Mallet Ensemble Ostinato',
          source: 'bundled',
          fileType: 'WAV'
        },
        {
          id: 'bundle-3',
          title: 'Steady Beat Drum Cadence & March (116 BPM)',
          url: generateSteadyBeatMarch(),
          artist: 'Elementary Movement Track',
          source: 'bundled',
          fileType: 'WAV'
        }
      ];
    } catch {
      return [];
    }
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(24);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitchShift, setPitchShift] = useState<number>(0);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Rehearsal Markers
  const [markers, setMarkers] = useState<Marker[]>([
    { id: 'm-1', time: 4.0, label: 'Recorder Ready Position', notes: 'Check breath support and left thumb hole coverage' },
    { id: 'm-2', time: 12.0, label: 'Section B Transition', notes: 'Transition from B-A to low G finger position' }
  ]);
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = playlist[currentTrackIndex] || null;

  // Whenever the active track changes, load it into the audio element
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.load();
      setCurrentTime(0);
      setLoopA(null);
      setLoopB(null);

      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Auto-play prevented:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, playlist]);

  // Sync playback rate with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Hook pitch shifter audio engine on track or mount
  useEffect(() => {
    if (audioRef.current) {
      studioAudioEngine.init(audioRef.current);
      studioAudioEngine.setPitch(pitchShift);
    }
  }, [currentTrackIndex, audioRef.current]);

  // Handle Real-Time Pitch Shifting
  const handlePitchChange = (newPitch: number) => {
    const clamped = Math.max(-12, Math.min(12, newPitch));
    setPitchShift(clamped);
    studioAudioEngine.setPitch(clamped);
    if (audioRef.current) {
      studioAudioEngine.init(audioRef.current);
      studioAudioEngine.unlock();
    }
    showToast(
      clamped === 0
        ? 'Pitch reset to original key'
        : `Pitch shifted ${clamped > 0 ? '+' : ''}${clamped} semitones`,
      'info'
    );
  };

  // Handle Play / Pause with robust AudioContext unlocking
  const togglePlay = async () => {
    audioEngine.unlockAudio();

    if (!audioRef.current || !currentTrack) {
      showToast('Select or upload a track to play', 'info');
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      studioAudioEngine.init(audioRef.current);
      await studioAudioEngine.unlock();

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio play error:', err);
          showToast('Could not start playback. Tap to activate.', 'warning');
          setIsPlaying(false);
        });
    }
  };

  // Skip to Previous Track
  const handlePreviousTrack = () => {
    if (playlist.length === 0) return;
    if (currentTime > 3) {
      // If past 3 seconds, jump to start of current track
      seekTo(0);
    } else {
      const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(prevIdx);
    }
  };

  // Skip to Next Track
  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    let nextIdx = (currentTrackIndex + 1) % playlist.length;
    if (isShuffle && playlist.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * playlist.length);
      } while (nextIdx === currentTrackIndex);
    }
    setCurrentTrackIndex(nextIdx);
  };

  // On audio ended handler (Playlist progression)
  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
      handleNextTrack();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Time update and A-B looper
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

  // Pick Local Files from User's Machine (File System Access API or fallback file input)
  const handlePickLocalFiles = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            {
              description: 'Audio Files',
              accept: {
                'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']
              }
            }
          ]
        });

        const newTracks: StudioTrack[] = [];
        for (const handle of fileHandles) {
          const file = await handle.getFile();
          const url = URL.createObjectURL(file);
          const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
          newTracks.push({
            id: 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            title: file.name.replace(/\.[^/.]+$/, ''),
            url,
            artist: 'Local Device File',
            source: 'local',
            fileType: ext
          });
        }

        if (newTracks.length > 0) {
          setPlaylist((prev) => [...prev, ...newTracks]);
          setCurrentTrackIndex(playlist.length); // jump to first newly added
          showToast(`Added ${newTracks.length} local file(s) to playlist`, 'success');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // If cancelled, do nothing. If error, fallback to standard input.
          fileInputRef.current?.click();
        }
      }
    } else {
      // Fallback for browsers without File System Access API
      fileInputRef.current?.click();
    }
  };

  // Standard input fallback for file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: StudioTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';
      newTracks.push({
        id: 'upload-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        artist: 'Uploaded File',
        source: 'uploaded',
        fileType: ext
      });
    }

    if (newTracks.length > 0) {
      const newPlaylist = [...playlist, ...newTracks];
      const startIndex = playlist.length;
      setPlaylist(newPlaylist);
      setCurrentTrackIndex(startIndex);
      showToast(`Added ${newTracks.length} track(s) to playlist`, 'success');
    }

    // Reset input value so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const removeTrackFromPlaylist = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.length <= 1) {
      showToast('Playlist must have at least one track', 'warning');
      return;
    }

    const updated = playlist.filter((_, idx) => idx !== indexToRemove);
    setPlaylist(updated);

    if (indexToRemove === currentTrackIndex) {
      setCurrentTrackIndex(Math.min(currentTrackIndex, updated.length - 1));
    } else if (indexToRemove < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
    showToast('Track removed from playlist', 'info');
  };

  // Waveform visualization canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = 70;
    const barWidth = width / bars;
    const effectiveDuration = duration > 0 ? duration : 30;

    for (let i = 0; i < bars; i++) {
      const progress = (i / bars) * effectiveDuration;
      const isPast = progress <= currentTime;
      const isInLoop = loopA !== null && loopB !== null && progress >= loopA && progress <= loopB;

      // Seed realistic visual waveform curve
      const harmonic1 = Math.sin(i * 0.22);
      const harmonic2 = Math.cos(i * 0.14) * 0.5;
      const h = Math.abs(harmonic1 + harmonic2) * (height * 0.65) + 12;
      const y = (height - h) / 2;

      ctx.fillStyle = isInLoop
        ? '#f59e0b'
        : isPast
        ? '#f43f5e'
        : '#cbd5e1';

      ctx.beginPath();
      ctx.roundRect(i * barWidth, y, barWidth - 2.5, h, 3);
      ctx.fill();
    }
  }, [currentTime, duration, loopA, loopB]);

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

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

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Hidden Master HTMLAudioElement */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={handleEnded}
        onError={(e) => {
          console.error('Audio playback error', e);
          showToast('Could not decode audio. Try another MP3/WAV file.', 'error');
          setIsPlaying(false);
        }}
      />

      {/* Hidden File Input for fallback or standard pick */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileAudio className="w-5 h-5" />
            </div>
            <span>Audio Practice Studio & Playlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Rehearse classroom pieces, play multi-track playlists, access local computer files, and slow down tricky passages without changing pitch.
          </p>
        </div>

        {/* Action Buttons: Pick Local Machine Files + Upload */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePickLocalFiles}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            title="Browse and play local audio files on your computer"
          >
            <FolderOpen className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Open Local Machine Files</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Import Audio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Main Studio Player & Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
            {/* Active Track Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900 dark:text-white line-clamp-1">
                      {currentTrack ? currentTrack.title : 'No Track Selected'}
                    </h2>
                    <p className="text-xs text-stone-400">
                      {currentTrack?.artist || 'Music Teacher Hub Studio'}
                    </p>
                  </div>
                </div>

                {currentTrack && (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {currentTrack.fileType || 'MP3'}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        currentTrack.source === 'local'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300'
                          : currentTrack.source === 'bundled'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300'
                      }`}
                    >
                      {currentTrack.source === 'local'
                        ? 'Local File'
                        : currentTrack.source === 'bundled'
                        ? 'Classroom Backing'
                        : 'Imported'}
                    </span>
                  </div>
                )}
              </div>

              {/* Waveform visualizer canvas */}
              <div className="relative rounded-2xl bg-stone-100 dark:bg-stone-800/80 p-3 overflow-hidden border border-stone-200/80 dark:border-stone-700/80">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={90}
                  className="w-full h-24 block cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    const targetSec = Math.max(0, Math.min(duration, pos * duration));
                    seekTo(targetSec);
                  }}
                />

                {/* Scrubber slider bar */}
                <div className="pt-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-xs font-mono font-bold text-stone-500 dark:text-stone-400 pt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport & Playback Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Transport Panel */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Player Transport
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handlePreviousTrack}
                    className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-subtle border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekTo(Math.max(0, currentTime - 5))}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 font-bold text-xs shadow-subtle border border-stone-200 dark:border-stone-700"
                    title="Rewind 5 seconds"
                  >
                    -5s
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-elevated transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                  </button>

                  <button
                    onClick={() => seekTo(Math.min(duration, currentTime + 5))}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 font-bold text-xs shadow-subtle border border-stone-200 dark:border-stone-700"
                    title="Fast forward 5 seconds"
                  >
                    +5s
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-subtle border border-stone-200 dark:border-stone-700 transition-all active:scale-95"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Playlist Modes (Shuffle / Repeat) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      isShuffle
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (repeatMode === 'off') setRepeatMode('all');
                      else if (repeatMode === 'all') setRepeatMode('one');
                      else setRepeatMode('off');
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      repeatMode !== 'off'
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Toggle Repeat"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>{repeatMode === 'one' ? 'One' : repeatMode === 'all' ? 'All' : 'Off'}</span>
                  </button>
                </div>
              </div>

              {/* Speed & Pitch Controls */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Rehearsal Speed
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
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
                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <button onClick={() => setPlaybackRate(0.75)} className="hover:text-rose-600">75% (Slow)</button>
                  <button onClick={() => setPlaybackRate(1.0)} className="hover:text-rose-600">100%</button>
                  <button onClick={() => setPlaybackRate(1.2)} className="hover:text-rose-600">120% (Fast)</button>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Pitch Transpose
                    </span>
                    {pitchShift !== 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {pitchShift * 100 > 0 ? `+${pitchShift * 100}¢` : `${pitchShift * 100}¢`}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {pitchShift === 0 ? 'Original Key' : `${pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-xs font-mono font-bold">
                  <button
                    onClick={() => handlePitchChange(pitchShift - 2)}
                    className="py-1 px-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-700 transition-all text-center"
                    title="Transpose down whole step (-2 semitones)"
                  >
                    -2
                  </button>
                  <button
                    onClick={() => handlePitchChange(pitchShift - 1)}
                    className="py-1 px-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-700 transition-all text-center"
                    title="Transpose down half step (-1 semitone)"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handlePitchChange(0)}
                    className={`py-1 px-1.5 rounded border transition-all text-center ${
                      pitchShift === 0
                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300'
                        : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700'
                    }`}
                    title="Reset to original key"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handlePitchChange(pitchShift + 1)}
                    className="py-1 px-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-700 transition-all text-center"
                    title="Transpose up half step (+1 semitone)"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handlePitchChange(pitchShift + 2)}
                    className="py-1 px-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded border border-stone-200 dark:border-stone-700 transition-all text-center"
                    title="Transpose up whole step (+2 semitones)"
                  >
                    +2
                  </button>
                </div>
              </div>

              {/* A-B Section Loop */}
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
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
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
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
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

        {/* RIGHT COLUMN: Studio Playlist (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                  Classroom Playlist
                </h3>
              </div>
              <span className="text-xs font-bold text-stone-400">
                {playlist.length} track{playlist.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePickLocalFiles}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Local Files</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-brand-600" />
                <span>+ Upload File</span>
              </button>
            </div>

            {/* Playlist Track List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {playlist.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;

                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800/70 border-stone-200/50 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5">
                            <span className="w-0.5 h-full bg-white animate-pulse" />
                            <span className="w-0.5 h-2 bg-white animate-bounce" />
                            <span className="w-0.5 h-full bg-white animate-pulse" />
                          </div>
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSelected
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-stone-900 dark:text-white'
                          }`}
                        >
                          {track.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                          <span>{track.artist || 'Local'}</span>
                          <span>•</span>
                          <span className="uppercase">{track.fileType || 'MP3'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => removeTrackFromPlaylist(idx, e)}
                      className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl text-[11px] text-stone-500 space-y-1">
              <p className="font-semibold text-stone-700 dark:text-stone-300">
                💡 Local Files on School Laptop
              </p>
              <p>
                Click <strong>"Open Local Machine Files"</strong> to select backing MP3s/WAVs directly from your documents or downloads folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
