import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { JournalEntry } from '../../types';
import {
  BookMarked,
  Plus,
  Smile,
  Zap,
  Calendar,
  Sparkles,
  Pin,
  Trash2,
  FileText,
  Search,
  Check
} from 'lucide-react';

export const JournalView: React.FC = () => {
  const { showToast } = useApp();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<JournalEntry['mood']>('great');
  const [energyLevel, setEnergyLevel] = useState<JournalEntry['energyLevel']>(4);
  const [tagsStr, setTagsStr] = useState('reflection, general-music');

  const reloadData = () => {
    const loaded = storage.getJournalEntries();
    setEntries(loaded);
    if (!selectedEntryId && loaded.length > 0) {
      setSelectedEntryId(loaded[0].id);
    }
  };

  useEffect(() => {
    reloadData();
    const unsub = storage.subscribe(reloadData);
    return unsub;
  }, []);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  const templates: { name: string; type: JournalEntry['templateType']; defaultTitle: string; defaultContent: string }[] = [
    {
      name: 'What Worked Well Today?',
      type: 'what_worked',
      defaultTitle: 'What Worked Well Today in Music',
      defaultContent: `Key breakthroughs and student engagement highlights:

1. Activity that succeeded:
2. Pedagogical reason it clicked:
3. Student response or quotes:
4. Quick adjustment for tomorrow:`
    },
    {
      name: 'Reuse Next Year (Lesson Note)',
      type: 'reuse_next_year',
      defaultTitle: 'Gold-Standard Activity to Reuse Next Year',
      defaultContent: `Grade & Unit:
Activity Name:
Materials setup:

Why this activity is a keeper:
- Timing was spot on.
- All students were able to participate regardless of prior singing experience.`
    },
    {
      name: 'Chorus Rehearsal Debrief',
      type: 'chorus_notes',
      defaultTitle: 'Chorus Rehearsal Debrief & Target Measures',
      defaultContent: `Rehearsal piece:
Section focus (Soprano vs Alto):

1. Intonation and vowel blend:
2. Diction and consonant releases:
3. Target measures for next rehearsal:`
    },
    {
      name: 'Emergency Sub Plan Note',
      type: 'sub_plan',
      defaultTitle: 'Music Sub Note & Class Roster Info',
      defaultContent: `Schedule & Room:
Homeroom teachers & periods:
Behavior plan & reward system:

Activities for sub (e.g. Chrome Music Lab or video listening lesson in Link Library):`
    }
  ];

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    setTitle(tmpl.defaultTitle);
    setContent(tmpl.defaultContent);
    setTagsStr(`template, ${tmpl.type}`);
    setIsEditing(true);
    showToast(`Loaded ${tmpl.name} template`, 'info');
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const created = storage.addJournalEntry({
      date,
      title: title.trim(),
      content: content.trim(),
      tags: tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      mood,
      energyLevel,
      pinned: false
    });

    setIsEditing(false);
    setSelectedEntryId(created.id);
    showToast('Journal entry saved', 'success');
  };

  const handleDelete = (id: string) => {
    storage.deleteJournalEntry(id);
    showToast('Entry removed', 'info');
  };

  const moodEmojis = {
    great: '😄 Great day',
    good: '🙂 Good',
    neutral: '😐 Neutral',
    challenging: '😓 Challenging',
    exhausting: '😴 Exhausting'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-brand-600" />
            <span>Daily Teaching Journal & Reflection</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Day One inspired pedagogical reflections, what worked, activities to reuse next year, and rehearsal debriefs.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('Daily Teaching Reflection');
            setContent('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsEditing(true);
          }}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Quick Template Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase text-stone-400 shrink-0">Templates:</span>
        {templates.map((tmpl) => (
          <button
            key={tmpl.type}
            onClick={() => handleApplyTemplate(tmpl)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-brand-50 dark:bg-stone-800 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-300 text-stone-700 dark:text-stone-300 text-xs font-semibold whitespace-nowrap transition-all border border-stone-200/60 dark:border-stone-700"
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entries List */}
        <div className="lg:col-span-5 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {entries.map((entry) => {
            const isSelected = entry.id === selectedEntryId;
            return (
              <div
                key={entry.id}
                onClick={() => {
                  setSelectedEntryId(entry.id);
                  setIsEditing(false);
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-white dark:bg-stone-800 border-brand-500 shadow-card'
                    : 'bg-stone-50/70 dark:bg-stone-900/60 border-stone-200/60 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-stone-400">{entry.date}</span>
                  <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                    {moodEmojis[entry.mood]}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-1">
                  {entry.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                  {entry.content}
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Entry Reader or Form */}
        <div className="lg:col-span-7">
          {isEditing ? (
            <form
              onSubmit={handleSaveEntry}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4"
            >
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Write Journal Reflection
              </h3>

              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm font-bold px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Mood Rating</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  >
                    <option value="great">😄 Great</option>
                    <option value="good">🙂 Good</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="challenging">😓 Challenging</option>
                    <option value="exhausting">😴 Exhausting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Reflection Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={9}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-serif leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          ) : selectedEntry ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedEntry.date}</span>
                    <span>•</span>
                    <span className="font-sans font-semibold text-brand-600 dark:text-brand-400">
                      {moodEmojis[selectedEntry.mood]}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-white mt-1">
                    {selectedEntry.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(selectedEntry.id)}
                    className="p-2 text-stone-400 hover:text-rose-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm sm:text-base font-serif text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                {selectedEntry.content}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-1.5">
                {selectedEntry.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400">Select or create a reflection entry.</div>
          )}
        </div>
      </div>
    </div>
  );
};
