import React, { useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import {
  Sparkles,
  Music,
  Volume2,
  Maximize2,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  Award
} from 'lucide-react';

export const ClassroomVisualsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'staff' | 'piano' | 'rhythm' | 'solfege' | 'dynamics' | 'instruments'>('staff');

  // Staff State
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showSolfege, setShowSolfege] = useState(false);
  const [activePlacedNotes, setActivePlacedNotes] = useState<string[]>(['E4', 'G4', 'B4', 'D5', 'F5']);

  // Piano State
  const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(new Set());

  // Interactive Staff Notes definitions (Treble clef lines and spaces)
  const trebleStaffNotes = [
    { pitch: 'G5', type: 'space', label: 'G', solfege: 'Sol', y: 30 },
    { pitch: 'F5', type: 'line', label: 'F', solfege: 'Fa', y: 40 },
    { pitch: 'E5', type: 'space', label: 'E', solfege: 'Mi', y: 50 },
    { pitch: 'D5', type: 'line', label: 'D', solfege: 'Re', y: 60 },
    { pitch: 'C5', type: 'space', label: 'C', solfege: 'Do', y: 70 },
    { pitch: 'B4', type: 'line', label: 'B', solfege: 'Ti', y: 80 },
    { pitch: 'A4', type: 'space', label: 'A', solfege: 'La', y: 90 },
    { pitch: 'G4', type: 'line', label: 'G', solfege: 'Sol', y: 100 },
    { pitch: 'F4', type: 'space', label: 'F', solfege: 'Fa', y: 110 },
    { pitch: 'E4', type: 'line', label: 'E', solfege: 'Mi', y: 120 },
    { pitch: 'D4', type: 'space', label: 'D', solfege: 'Re', y: 130 },
    { pitch: 'C4', type: 'ledger', label: 'C (Middle C)', solfege: 'Do', y: 140 }
  ];

  const playPitch = (noteName: string) => {
    audioEngine.unlockAudio();
    audioEngine.playMusicalNote(noteName, 0.9);
  };

  const pianoKeys = [
    { note: 'C4', isBlack: false, label: 'C', solfege: 'Do' },
    { note: 'C#4', isBlack: true, label: 'C#' },
    { note: 'D4', isBlack: false, label: 'D', solfege: 'Re' },
    { note: 'D#4', isBlack: true, label: 'D#' },
    { note: 'E4', isBlack: false, label: 'E', solfege: 'Mi' },
    { note: 'F4', isBlack: false, label: 'F', solfege: 'Fa' },
    { note: 'F#4', isBlack: true, label: 'F#' },
    { note: 'G4', isBlack: false, label: 'G', solfege: 'Sol' },
    { note: 'G#4', isBlack: true, label: 'G#' },
    { note: 'A4', isBlack: false, label: 'A', solfege: 'La' },
    { note: 'A#4', isBlack: true, label: 'A#' },
    { note: 'B4', isBlack: false, label: 'B', solfege: 'Ti' },
    { note: 'C5', isBlack: false, label: 'C', solfege: 'Do' },
    { note: 'C#5', isBlack: true, label: 'C#' },
    { note: 'D5', isBlack: false, label: 'D', solfege: 'Re' },
    { note: 'D#5', isBlack: true, label: 'D#' },
    { note: 'E5', isBlack: false, label: 'E', solfege: 'Mi' },
    { note: 'F5', isBlack: false, label: 'F', solfege: 'Fa' },
    { note: 'G5', isBlack: false, label: 'G', solfege: 'Sol' }
  ];

  const rhythmSymbols = [
    { name: 'Quarter Note (Ta)', beats: 1, syllable: 'Ta', icon: '𝅘𝅥', sound: 'woodblock' },
    { name: 'Paired Eighth Notes (Ti-Ti)', beats: 1, syllable: 'Ti-Ti', icon: '𝅘𝅥𝅮𝅘𝅥𝅮', sound: 'woodblock' },
    { name: 'Sixteenth Notes (Tikka-Tikka)', beats: 1, syllable: 'Tikka-Tikka', icon: '𝅘𝅥𝅯𝅘𝅥𝅯𝅘𝅥𝅯𝅘𝅥𝅯', sound: 'woodblock' },
    { name: 'Half Note (Ta-a)', beats: 2, syllable: 'Ta-a', icon: '𝅗𝅥', sound: 'triangle' },
    { name: 'Whole Note (Ta-a-a-a)', beats: 4, syllable: 'Ta-a-a-a', icon: '𝅝', sound: 'triangle' },
    { name: 'Quarter Rest (Shh)', beats: 1, syllable: 'Shh / Rest', icon: '𝄽', sound: 'rest' }
  ];

  const solfegeScale = [
    { syllable: 'Do', note: 'C5', color: '#ef4444', desc: 'Fist (Firm ground)' },
    { syllable: 'Ti', note: 'B4', color: '#a855f7', desc: 'Point upward (Leading tone)' },
    { syllable: 'La', note: 'A4', color: '#3b82f6', desc: 'Curved tent (Gentle roof)' },
    { syllable: 'Sol', note: 'G4', color: '#10b981', desc: 'Flat open palm facing chest' },
    { syllable: 'Fa', note: 'F4', color: '#eab308', desc: 'Thumb pointing down' },
    { syllable: 'Mi', note: 'E4', color: '#f97316', desc: 'Flat horizontal palm' },
    { syllable: 'Re', note: 'D4', color: '#ec4899', desc: 'Angled upward ramp' },
    { syllable: 'Do', note: 'C4', color: '#ef4444', desc: 'Firm fist at waist level' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>Interactive Music Literacy Visuals</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Scalable SVGs for smart boards & projectors: clickable five-line staff, 25-key piano, Curwen solfege, and rhythm syllable trainer.
          </p>
        </div>

        {/* Visual Category Switcher */}
        <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 overflow-x-auto">
          {[
            { id: 'staff', label: 'Five-Line Staff' },
            { id: 'piano', label: 'Interactive Piano' },
            { id: 'rhythm', label: 'Rhythm Syllables' },
            { id: 'solfege', label: 'Curwen Solfege' },
            { id: 'dynamics', label: 'Dynamics & Tempo' },
            { id: 'instruments', label: 'Instrument Families' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. INTERACTIVE FIVE-LINE STAFF */}
      {activeCategory === 'staff' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-stone-900 dark:text-white">
                Treble Clef Pitch Explorer
              </span>
              <span className="text-xs text-stone-400">Click any note to hear sound!</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNoteNames(!showNoteNames)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showNoteNames
                    ? 'bg-brand-50 text-brand-700 border-brand-300 dark:bg-brand-950 dark:text-brand-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200'
                }`}
              >
                {showNoteNames ? 'Hide Letter Names' : 'Show Letter Names (E-G-B-D-F)'}
              </button>

              <button
                onClick={() => setShowSolfege(!showSolfege)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  showSolfege
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200'
                }`}
              >
                {showSolfege ? 'Hide Solfege' : 'Show Solfege (Do-Re-Mi)'}
              </button>
            </div>
          </div>

          {/* Interactive Scalable SVG Staff */}
          <div className="p-4 sm:p-8 bg-stone-50 dark:bg-stone-800/50 rounded-3xl overflow-x-auto flex justify-center">
            <svg
              viewBox="0 0 750 200"
              className="w-full max-w-3xl h-64 select-none"
            >
              {/* 5 Staff Lines */}
              <line x1="40" y1="40" x2="710" y2="40" stroke="#94a3b8" strokeWidth="2.5" />
              <line x1="40" y1="60" x2="710" y2="60" stroke="#94a3b8" strokeWidth="2.5" />
              <line x1="40" y1="80" x2="710" y2="80" stroke="#94a3b8" strokeWidth="2.5" />
              <line x1="40" y1="100" x2="710" y2="100" stroke="#94a3b8" strokeWidth="2.5" />
              <line x1="40" y1="120" x2="710" y2="120" stroke="#94a3b8" strokeWidth="2.5" />

              {/* Barlines */}
              <line x1="40" y1="40" x2="40" y2="120" stroke="#64748b" strokeWidth="3" />
              <line x1="710" y1="40" x2="710" y2="120" stroke="#64748b" strokeWidth="4" />
              <line x1="702" y1="40" x2="702" y2="120" stroke="#64748b" strokeWidth="1.5" />

              {/* Treble Clef Symbol */}
              <text x="50" y="112" fontSize="90" fontFamily="serif" fill="#334155" className="dark:fill-stone-200">
                𝄞
              </text>

              {/* Middle C Ledger Line */}
              <line x1="120" y1="140" x2="160" y2="140" stroke="#94a3b8" strokeWidth="2.5" />

              {/* Clickable Notes */}
              {trebleStaffNotes.map((note, idx) => {
                const xPos = 140 + idx * 46;
                return (
                  <g
                    key={note.pitch}
                    onClick={() => playPitch(note.pitch)}
                    className="cursor-pointer group"
                  >
                    {/* Note Head */}
                    <ellipse
                      cx={xPos}
                      cy={note.y}
                      rx="11"
                      ry="8"
                      transform={`rotate(-25, ${xPos}, ${note.y})`}
                      className="fill-brand-600 dark:fill-brand-400 group-hover:fill-indigo-500 transition-colors"
                    />

                    {/* Stem */}
                    <line
                      x1={xPos + 9}
                      y1={note.y}
                      x2={xPos + 9}
                      y2={note.y - 35}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-stone-800 dark:text-stone-200"
                    />

                    {/* Labels below */}
                    {showNoteNames && (
                      <text
                        x={xPos}
                        y={175}
                        fontSize="12"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="fill-stone-800 dark:fill-stone-200 group-hover:fill-brand-500"
                      >
                        {note.label}
                      </text>
                    )}

                    {showSolfege && (
                      <text
                        x={xPos}
                        y={192}
                        fontSize="11"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        className="fill-indigo-600 dark:fill-indigo-400 font-semibold"
                      >
                        {note.solfege}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
              <span className="font-bold text-brand-600 block mb-1">Lines Mnemonic (Bottom to Top)</span>
              <p className="text-stone-600 dark:text-stone-400">
                <span className="font-mono font-bold">E - G - B - D - F</span> (Every Good Boy Does Fine)
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800">
              <span className="font-bold text-indigo-600 block mb-1">Spaces Mnemonic (Bottom to Top)</span>
              <p className="text-stone-600 dark:text-stone-400">
                <span className="font-mono font-bold">F - A - C - E</span> (Spells FACE!)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE PIANO KEYBOARD */}
      {activeCategory === 'piano' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white">
                Interactive Classroom Piano (C4 – G5)
              </h3>
              <p className="text-xs text-stone-400">
                Click or touch keys to demonstrate pitch, solfege intervals, and chord triads.
              </p>
            </div>
          </div>

          {/* Piano Keys Visualizer */}
          <div className="p-4 sm:p-8 bg-stone-100 dark:bg-stone-800 rounded-3xl flex justify-center overflow-x-auto">
            <div className="relative flex h-48 sm:h-56 select-none bg-stone-900 p-2 rounded-2xl shadow-elevated">
              {pianoKeys.map((key) => {
                if (key.isBlack) {
                  return (
                    <button
                      key={key.note}
                      onClick={() => playPitch(key.note)}
                      className="absolute z-10 w-8 sm:w-10 h-28 sm:h-32 bg-stone-950 text-white rounded-b-lg shadow-lg active:bg-brand-600 hover:bg-stone-800 border border-stone-800 transition-colors flex flex-col justify-end pb-2 items-center text-[10px] font-mono"
                      style={{
                        // Calculate black key horizontal offset
                        left:
                          key.note === 'C#4' ? 38 :
                          key.note === 'D#4' ? 84 :
                          key.note === 'F#4' ? 174 :
                          key.note === 'G#4' ? 220 :
                          key.note === 'A#4' ? 266 :
                          key.note === 'C#5' ? 356 :
                          key.note === 'D#5' ? 402 : 0
                      }}
                    >
                      <span className="opacity-70">{key.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={key.note}
                    onClick={() => playPitch(key.note)}
                    className="w-11 sm:w-12 h-full bg-white hover:bg-brand-50 active:bg-brand-100 text-stone-900 rounded-b-xl border border-stone-300 shadow-sm transition-colors flex flex-col justify-end pb-3 items-center text-xs font-bold"
                  >
                    <span>{key.label}</span>
                    {key.solfege && (
                      <span className="text-[10px] text-brand-600 font-normal">
                        {key.solfege}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. RHYTHM SYLLABLES TRAINER */}
      {activeCategory === 'rhythm' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">
              Kodály Rhythm Literacy & Syllable Cards
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Standard rhythm notation symbols with speech syllables and audio clap samples.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rhythmSymbols.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  audioEngine.unlockAudio();
                  if (item.sound === 'woodblock') audioEngine.playWoodblock(0, false, 0.9);
                  else if (item.sound === 'triangle') audioEngine.playTriangle(0, 0.8);
                }}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 hover:border-brand-500 cursor-pointer transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {item.beats} {item.beats === 1 ? 'Beat' : 'Beats'}
                  </span>
                  <Volume2 className="w-4 h-4 text-brand-500" />
                </div>

                <div className="text-center py-2">
                  <span className="text-5xl font-serif text-stone-900 dark:text-white block mb-1">
                    {item.icon}
                  </span>
                  <span className="text-base font-bold text-brand-600 dark:text-brand-400">
                    &quot;{item.syllable}&quot;
                  </span>
                </div>

                <p className="text-xs text-stone-500 text-center font-medium">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CURWEN SOLFEGE LADDER */}
      {activeCategory === 'solfege' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">
              Curwen / Kodály Solfege Tone Ladder
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any step on the ladder to hear the solfege pitch and review hand sign posture.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            {solfegeScale.map((step, idx) => (
              <button
                key={idx}
                onClick={() => playPitch(step.note)}
                className="w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all hover:scale-[1.02] shadow-sm border border-stone-200/60 dark:border-stone-800"
                style={{
                  backgroundColor: `${step.color}15`,
                  borderColor: `${step.color}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-xl font-bold text-sm text-white flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.syllable}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                      {step.syllable} ({step.note})
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <Volume2 className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. DYNAMICS & TEMPO */}
      {activeCategory === 'dynamics' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">
              Dynamics & Expressive Tempo Reference Chart
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Italian musical terms and expressive levels for general music and chorus students.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { symbol: 'pp', name: 'Pianissimo', level: 'Very Soft', color: 'bg-blue-50 text-blue-800' },
              { symbol: 'p', name: 'Piano', level: 'Soft', color: 'bg-teal-50 text-teal-800' },
              { symbol: 'mp', name: 'Mezzo Piano', level: 'Medium Soft', color: 'bg-emerald-50 text-emerald-800' },
              { symbol: 'mf', name: 'Mezzo Forte', level: 'Medium Loud', color: 'bg-amber-50 text-amber-800' },
              { symbol: 'f', name: 'Forte', level: 'Loud', color: 'bg-orange-50 text-orange-800' },
              { symbol: 'ff', name: 'Fortissimo', level: 'Very Loud', color: 'bg-rose-50 text-rose-800' }
            ].map((d, i) => (
              <div key={i} className={`p-4 rounded-2xl text-center border ${d.color} border-current/20`}>
                <span className="font-serif text-3xl font-bold block mb-1">{d.symbol}</span>
                <span className="text-xs font-bold block">{d.name}</span>
                <span className="text-[11px] opacity-80">{d.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. INSTRUMENT FAMILIES */}
      {activeCategory === 'instruments' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">
              The 4 Instrument Families & Orff Classroom Instruments
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Categorized instrument guides for orchestra and classroom music cart instruction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                family: 'Strings Family',
                color: 'text-amber-600',
                instruments: 'Violin, Viola, Cello, Double Bass, Harp, Ukulele, Guitar',
                vibration: 'Sound made by vibrating strings with a bow or plucking.'
              },
              {
                family: 'Woodwinds Family',
                color: 'text-emerald-600',
                instruments: 'Flute, Clarinet, Oboe, Bassoon, Saxophone, Soprano Recorder',
                vibration: 'Sound made by vibrating reeds or blowing across an edge hole.'
              },
              {
                family: 'Brass Family',
                color: 'text-orange-600',
                instruments: 'Trumpet, French Horn, Trombone, Euphonium, Tuba',
                vibration: 'Sound made by buzzing lips into a cup-shaped mouthpiece.'
              },
              {
                family: 'Percussion & Orff Barred Instruments',
                color: 'text-purple-600',
                instruments: 'Timpani, Bass Drum, Xylophone, Metallophone, Glockenspiel, Triangle, Djembe',
                vibration: 'Sound made by striking, shaking, or scraping.'
              }
            ].map((fam, i) => (
              <div key={i} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 space-y-2">
                <h4 className={`text-sm font-bold ${fam.color}`}>{fam.family}</h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 font-semibold">{fam.instruments}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{fam.vibration}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
