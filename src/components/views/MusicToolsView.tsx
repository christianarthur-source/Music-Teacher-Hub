import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { tunerEngine, TUNER_PRESETS, PitchData } from '../../services/tunerAudio';
import { audioEngine } from '../../services/audioEngine';
import { storage } from '../../services/storage';
import { BeatPattern } from '../../types';
import {
  Mic,
  MicOff,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  CheckCircle,
  HelpCircle,
  Download,
  Plus,
  RefreshCw,
  Music2,
  Music
} from 'lucide-react';

export const MusicToolsView: React.FC = () => {
  const { preferences, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'tuner' | 'metronome' | 'beat-machine'>('tuner');

  // --- TUNER STATE ---
  const [isTunerListening, setIsTunerListening] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [refA4, setRefA4] = useState(preferences.tunerRefA4 || 440);
  const [noiseGate, setNoiseGate] = useState(0.015);
  const [micError, setMicError] = useState<string | null>(null);

  const toggleTuner = async () => {
    if (isTunerListening) {
      tunerEngine.stop();
      setIsTunerListening(false);
      setPitchData(null);
    } else {
      setMicError(null);
      tunerEngine.setRefA4(refA4);
      tunerEngine.setNoiseGate(noiseGate);
      const success = await tunerEngine.start((data) => {
        setPitchData(data);
      });
      if (success) {
        setIsTunerListening(true);
        showToast('Microphone active for tuning', 'info');
      } else {
        setMicError('Could not access microphone. Please grant mic permissions in your browser.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (tunerEngine.isRunning()) tunerEngine.stop();
    };
  }, []);

  // --- METRONOME STATE ---
  const [bpm, setBpm] = useState(108);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [subdivision, setSubdivision] = useState<'quarter' | 'eighth' | 'triplet' | 'sixteenth'>('quarter');
  const [soundScheme, setSoundScheme] = useState<'woodblock' | 'beep' | 'drum' | 'cowbell'>('woodblock');
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState<number>(1);
  const [isSubPulse, setIsSubPulse] = useState(false);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [isMetronomeFullscreen, setIsMetronomeFullscreen] = useState(false);

  useEffect(() => {
    audioEngine.setMetronomeParams({
      bpm,
      beatsPerBar,
      subdivision,
      sound: soundScheme
    });
  }, [bpm, beatsPerBar, subdivision, soundScheme]);

  const toggleMetronome = () => {
    if (isMetronomePlaying) {
      audioEngine.stopMetronome();
      setIsMetronomePlaying(false);
    } else {
      audioEngine.startMetronome((beat, isSub) => {
        setActiveBeat(beat);
        setIsSubPulse(isSub);
      });
      setIsMetronomePlaying(true);
    }
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const newTaps = [...tapTimes, now].filter((t) => now - t < 3000).slice(-4);
    setTapTimes(newTaps);

    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 30 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Keyboard shortcut listener for spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (activeTab === 'metronome') {
          e.preventDefault();
          toggleMetronome();
        } else if (activeTab === 'beat-machine') {
          e.preventDefault();
          toggleBeatMachine();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // --- BEAT MACHINE STATE ---
  const [beatPatterns, setBeatPatterns] = useState<BeatPattern[]>(storage.getBeatPatterns());
  const [activePatternIndex, setActivePatternIndex] = useState(0);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [beatBpm, setBeatBpm] = useState(108);
  const [swing, setSwing] = useState(0);

  const currentPattern = beatPatterns[activePatternIndex] || beatPatterns[0];

  const toggleGridStep = (trackIdx: number, stepIdx: number) => {
    const updated = { ...currentPattern };
    updated.tracks[trackIdx].grid[stepIdx] = !updated.tracks[trackIdx].grid[stepIdx];
    const newPatterns = [...beatPatterns];
    newPatterns[activePatternIndex] = updated;
    setBeatPatterns(newPatterns);
    storage.saveBeatPatterns(newPatterns);
  };

  const toggleTrackMute = (trackIdx: number) => {
    const updated = { ...currentPattern };
    updated.tracks[trackIdx].muted = !updated.tracks[trackIdx].muted;
    const newPatterns = [...beatPatterns];
    newPatterns[activePatternIndex] = updated;
    setBeatPatterns(newPatterns);
  };

  const beatTimerRef = useRef<number | null>(null);

  const toggleBeatMachine = () => {
    if (isBeatPlaying) {
      if (beatTimerRef.current !== null) {
        clearInterval(beatTimerRef.current);
        beatTimerRef.current = null;
      }
      setIsBeatPlaying(false);
      setCurrentStep(0);
    } else {
      audioEngine.unlockAudio();
      setIsBeatPlaying(true);
    }
  };

  useEffect(() => {
    if (isBeatPlaying) {
      // 16th note interval = (60 / beatBpm) / 4 * 1000 ms
      const intervalMs = (60.0 / beatBpm / 4.0) * 1000;
      let step = 0;

      beatTimerRef.current = window.setInterval(() => {
        // Trigger sounds for this step
        currentPattern.tracks.forEach((track) => {
          if (!track.muted && track.grid[step]) {
            switch (track.sound) {
              case 'kick':
                audioEngine.playKick(0, track.volume);
                break;
              case 'snare':
                audioEngine.playSnare(0, track.volume);
                break;
              case 'hihat_c':
                audioEngine.playClosedHiHat(0, track.volume);
                break;
              case 'hihat_o':
                audioEngine.playOpenHiHat(0, track.volume);
                break;
              case 'clap':
                audioEngine.playClap(0, track.volume);
                break;
              case 'woodblock':
                audioEngine.playWoodblock(0, false, track.volume);
                break;
              case 'cowbell':
                audioEngine.playCowbell(0, false, track.volume);
                break;
              case 'triangle':
                audioEngine.playTriangle(0, track.volume);
                break;
              case 'agogo':
                audioEngine.playAgogo(0, false, track.volume);
                break;
            }
          }
        });

        setCurrentStep(step);
        step = (step + 1) % currentPattern.steps;
      }, intervalMs);
    }

    return () => {
      if (beatTimerRef.current !== null) {
        clearInterval(beatTimerRef.current);
        beatTimerRef.current = null;
      }
    };
  }, [isBeatPlaying, beatBpm, currentPattern]);

  const preset = TUNER_PRESETS[selectedPresetIndex];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Music2 className="w-6 h-6 text-brand-600" />
            <span>Music Tools Workstation</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time chromatic tuner, high-precision Web Audio metronome, and classroom beat laboratory.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60">
          <button
            onClick={() => {
              setActiveTab('tuner');
              if (isMetronomePlaying) audioEngine.stopMetronome();
              setIsMetronomePlaying(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tuner'
                ? 'bg-white dark:bg-stone-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Chromatic Tuner
          </button>
          <button
            onClick={() => {
              setActiveTab('metronome');
              if (tunerEngine.isRunning()) tunerEngine.stop();
              setIsTunerListening(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'metronome'
                ? 'bg-white dark:bg-stone-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Precision Metronome
          </button>
          <button
            onClick={() => {
              setActiveTab('beat-machine');
              if (tunerEngine.isRunning()) tunerEngine.stop();
              setIsTunerListening(false);
              if (isMetronomePlaying) audioEngine.stopMetronome();
              setIsMetronomePlaying(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'beat-machine'
                ? 'bg-white dark:bg-stone-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Beat Machine & Rhythm Lab
          </button>
        </div>
      </div>

      {/* 1. CHROMATIC TUNER TAB */}
      {activeTab === 'tuner' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 flex flex-col items-center text-center space-y-6">
            {/* Presets and Ref A4 Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 max-w-xl pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">Preset:</span>
                <select
                  value={selectedPresetIndex}
                  onChange={(e) => setSelectedPresetIndex(Number(e.target.value))}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  {TUNER_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">Reference:</span>
                <button
                  onClick={() => {
                    const newA = refA4 === 440 ? 442 : 440;
                    setRefA4(newA);
                    tunerEngine.setRefA4(newA);
                  }}
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                >
                  A4 = {refA4} Hz
                </button>
              </div>
            </div>

            {/* Target Instrument Notes (if selected preset has specific notes like Ukulele/Guitar) */}
            {preset.notes.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {preset.notes.map((n, i) => {
                  const isCurrentNote = pitchData?.noteName === n.note && pitchData?.octave === n.octave;
                  return (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        isCurrentNote
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 scale-105'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {n.note}
                      {n.octave} ({n.freq} Hz)
                    </div>
                  );
                })}
              </div>
            )}

            {/* Giant Pitch Display & Needle Gauge */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              {pitchData ? (
                <>
                  <div className="relative">
                    <span
                      className={`font-mono text-8xl sm:text-9xl font-black tracking-tight transition-colors duration-100 ${
                        pitchData.inTune
                          ? 'text-emerald-500 animate-pulse'
                          : Math.abs(pitchData.cents) < 15
                          ? 'text-amber-500'
                          : 'text-stone-800 dark:text-white'
                      }`}
                    >
                      {pitchData.noteName}
                    </span>
                    <span className="text-3xl font-mono font-bold text-stone-400 absolute -bottom-1 -right-6">
                      {pitchData.octave}
                    </span>
                  </div>

                  <div className="text-sm font-mono text-stone-500">
                    {pitchData.frequency} Hz • {pitchData.cents > 0 ? `+${pitchData.cents}` : pitchData.cents} cents
                  </div>

                  {/* Cent Gauge Visual Needle */}
                  <div className="w-72 sm:w-96 space-y-2">
                    <div className="relative h-4 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700">
                      {/* Center In-Tune marker */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-emerald-500 z-10" />
                      {/* Needle indicator */}
                      <div
                        className={`absolute top-0 bottom-0 w-3 rounded-full transition-all duration-75 ${
                          pitchData.inTune ? 'bg-emerald-500 ring-4 ring-emerald-500/30' : 'bg-brand-600'
                        }`}
                        style={{
                          left: `calc(50% + ${(pitchData.cents / 50) * 45}%)`,
                          transform: 'translateX(-50%)'
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-stone-400 px-1">
                      <span>-50 Flat</span>
                      <span className="text-emerald-500 font-bold">Perfect In-Tune</span>
                      <span>+50 Sharp</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-stone-400 space-y-2">
                  <p className="text-xl font-bold">
                    {isTunerListening ? 'Sing or play a note...' : 'Tuner is off'}
                  </p>
                  <p className="text-xs">
                    {isTunerListening
                      ? 'Room noise filtered by noise gate. Play clearly near microphone.'
                      : 'Click "Start Listening" to activate the microphone.'}
                  </p>
                </div>
              )}
            </div>

            {/* Error banner if microphone blocked */}
            {micError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 max-w-md">
                {micError}
              </div>
            )}

            {/* Start / Stop Button */}
            <button
              onClick={toggleTuner}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-elevated transition-all active:scale-95 ${
                isTunerListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {isTunerListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isTunerListening ? 'Stop Listening' : 'Start Microphone Listening'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PRECISION METRONOME TAB */}
      {activeTab === 'metronome' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 flex flex-col items-center text-center space-y-8">
            {/* Visual Beat Indicator Dots */}
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: beatsPerBar }).map((_, idx) => {
                const beatNum = idx + 1;
                const isCurrent = isMetronomePlaying && activeBeat === beatNum;
                const isDownbeat = beatNum === 1;

                return (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-75 flex items-center justify-center font-mono font-bold text-xs ${
                      isCurrent
                        ? isDownbeat
                          ? 'w-14 h-14 bg-brand-600 text-white ring-8 ring-brand-500/30 scale-110 shadow-lg'
                          : 'w-12 h-12 bg-amber-500 text-white ring-6 ring-amber-500/20 scale-105 shadow-md'
                        : 'w-10 h-10 bg-stone-100 dark:bg-stone-800 text-stone-400'
                    }`}
                  >
                    {beatNum}
                  </div>
                );
              })}
            </div>

            {/* Huge Tempo Display */}
            <div className="space-y-2">
              <div className="font-mono text-7xl sm:text-9xl font-black text-stone-900 dark:text-white tracking-tight">
                {bpm}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                Beats Per Minute (BPM)
              </div>
            </div>

            {/* Tempo Slider & Buttons */}
            <div className="w-full max-w-md space-y-4">
              <input
                type="range"
                min="30"
                max="260"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setBpm((b) => Math.max(30, b - 5))}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-xs hover:bg-stone-200"
                >
                  -5
                </button>
                <button
                  onClick={() => setBpm((b) => Math.max(30, b - 1))}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-xs hover:bg-stone-200"
                >
                  -1
                </button>
                <button
                  onClick={handleTapTempo}
                  className="px-5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-200 transition-all border border-amber-300/60"
                >
                  Tap Tempo
                </button>
                <button
                  onClick={() => setBpm((b) => Math.min(300, b + 1))}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-xs hover:bg-stone-200"
                >
                  +1
                </button>
                <button
                  onClick={() => setBpm((b) => Math.min(300, b + 5))}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 font-bold text-xs hover:bg-stone-200"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Time Signature, Subdivisions & Sound Scheme */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-semibold">Meter:</span>
                {[2, 3, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBeatsPerBar(num)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      beatsPerBar === num
                        ? 'bg-brand-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {num}/4
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-semibold">Subdivision:</span>
                {(['quarter', 'eighth', 'triplet', 'sixteenth'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubdivision(sub)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                      subdivision === sub
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 font-semibold">Sound:</span>
                <select
                  value={soundScheme}
                  onChange={(e) => setSoundScheme(e.target.value as any)}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg px-2.5 py-1 text-xs"
                >
                  <option value="woodblock">Woodblock (Orff Click)</option>
                  <option value="beep">Digital Beep</option>
                  <option value="drum">Acoustic Drum Kit</option>
                  <option value="cowbell">Cowbell</option>
                </select>
              </div>
            </div>

            {/* Big Start / Stop Button */}
            <button
              onClick={toggleMetronome}
              className={`px-10 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-elevated transition-all active:scale-95 ${
                isMetronomePlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {isMetronomePlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              <span>{isMetronomePlaying ? 'Pause Metronome' : 'Start Metronome'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. BEAT MACHINE & RHYTHM LAB TAB */}
      {activeTab === 'beat-machine' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
            {/* Beat Machine Header & Pattern Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleBeatMachine}
                  className={`p-3 rounded-2xl font-bold text-white shadow-sm transition-all active:scale-95 ${
                    isBeatPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                  title={isBeatPlaying ? 'Stop Pattern' : 'Play Pattern'}
                >
                  {isBeatPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-base">
                    {currentPattern.title}
                  </h3>
                  <p className="text-xs text-stone-400">16-Step Grid Sequencer</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={activePatternIndex}
                  onChange={(e) => {
                    setActivePatternIndex(Number(e.target.value));
                    setBeatBpm(beatPatterns[Number(e.target.value)].tempo);
                  }}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  {beatPatterns.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      {p.title}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-stone-400">Tempo:</span>
                  <input
                    type="number"
                    value={beatBpm}
                    onChange={(e) => setBeatBpm(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-center font-bold"
                  />
                  <span className="text-stone-400">BPM</span>
                </div>
              </div>
            </div>

            {/* 16-Step Interactive Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[650px] space-y-2">
                {/* Step Beat Headers */}
                <div className="grid grid-cols-16 gap-1.5 pl-36 pr-2 mb-2 text-center text-[10px] font-mono text-stone-400">
                  {Array.from({ length: 16 }).map((_, stepIdx) => (
                    <div
                      key={stepIdx}
                      className={`py-1 rounded ${
                        stepIdx % 4 === 0 ? 'font-bold text-brand-600 dark:text-brand-400' : ''
                      } ${currentStep === stepIdx && isBeatPlaying ? 'bg-brand-500/20 text-brand-500' : ''}`}
                    >
                      {stepIdx % 4 === 0 ? Math.floor(stepIdx / 4) + 1 : '•'}
                    </div>
                  ))}
                </div>

                {/* Track Rows */}
                {currentPattern.tracks.map((track, trackIdx) => (
                  <div key={trackIdx} className="flex items-center gap-2">
                    {/* Track info & mute */}
                    <div className="w-32 flex items-center justify-between pr-2">
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {track.name}
                      </span>
                      <button
                        onClick={() => toggleTrackMute(trackIdx)}
                        className={`p-1 rounded text-xs ${
                          track.muted ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'text-stone-400 hover:text-stone-600'
                        }`}
                        title={track.muted ? 'Unmute' : 'Mute'}
                      >
                        {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Step buttons */}
                    <div className="grid grid-cols-16 gap-1.5 flex-1">
                      {track.grid.map((isActive, stepIdx) => {
                        const isPlayhead = isBeatPlaying && currentStep === stepIdx;
                        const isBeatQuarter = stepIdx % 4 === 0;

                        return (
                          <button
                            key={stepIdx}
                            onClick={() => toggleGridStep(trackIdx, stepIdx)}
                            className={`h-9 rounded-xl transition-all duration-75 ${
                              isActive
                                ? 'bg-brand-600 hover:bg-brand-500 shadow-sm text-white'
                                : isBeatQuarter
                                ? 'bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300'
                                : 'bg-stone-100 dark:bg-stone-800/50 hover:bg-stone-200'
                            } ${isPlayhead ? 'ring-2 ring-amber-400 scale-105' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-3">
              <span>Classroom tip: Use steady beat presets for Kindergarten, and Son Clave 3-2 for 5th grade syncopation lessons.</span>
              <span className="font-mono">Press Spacebar to play/pause</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
