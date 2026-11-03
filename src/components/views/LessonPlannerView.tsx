import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { LessonPlan, GradeLevel, ActivityStep, ClassSection } from '../../types';
import { NYS_MUSIC_STANDARDS } from '../../services/nysStandards';
import {
  BookOpen,
  Plus,
  Presentation,
  Copy,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Search,
  Filter,
  Save,
  Wand2,
  History,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LessonPlannerView: React.FC = () => {
  const { preferences, openTeachMode, showToast } = useApp();

  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Create a 25-minute fourth-grade lesson on rhythm using body percussion and a Smart Board, with no instrument setup.');

  // Form State for editing
  const [editForm, setEditForm] = useState<Partial<LessonPlan>>({});
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState(5);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityConcept, setNewActivityConcept] = useState('Steady Beat');

  const reloadData = () => {
    const allLessons = storage.getLessonPlans();
    setLessons(allLessons);
    setClasses(storage.getClasses());
    if (!activeLessonId && allLessons.length > 0) {
      setActiveLessonId(allLessons[0].id);
    }
  };

  useEffect(() => {
    reloadData();
    const unsub = storage.subscribe(reloadData);
    return unsub;
  }, []);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  const filteredLessons = lessons.filter((l) => {
    const matchesGrade = selectedGrade === 'All' || l.grade === selectedGrade;
    const matchesSearch =
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.musicalConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  const startCreateNew = () => {
    const newLesson: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'New Elementary Music Lesson',
      grade: selectedGrade === 'All' ? '1' : selectedGrade,
      unit: 'Unit 1: Fundamentals',
      durationMinutes: preferences.defaultClassDuration || 40,
      overview: 'Lesson summary and main student learning experience.',
      objectives: ['Students will perform steady beat and identify pitch movement.'],
      musicalConcepts: ['Steady Beat', 'Singing Voice'],
      standards: ['MU:Pr4.1.K'],
      materialsNeeded: ['Hand drum', 'Rhythm sticks'],
      assessmentStrategy: 'Informal observation and circle participation check.',
      activities: [
        {
          id: 'step-1',
          title: 'Welcome & Vocal Warmup',
          durationMinutes: 5,
          description: 'Siren vocalizations and rote echo song.',
          musicalConcept: 'Singing Voice'
        },
        {
          id: 'step-2',
          title: 'Main Movement or Instrument Activity',
          durationMinutes: 20,
          description: 'Introduce core musical concept with participatory activity.',
          musicalConcept: 'Steady Beat'
        },
        {
          id: 'step-3',
          title: 'Exit Ticket & Cool Down',
          durationMinutes: 5,
          description: 'Individual rhythm clapping check as students line up.',
          musicalConcept: 'Assessment'
        }
      ]
    };
    const created = storage.addLessonPlan(newLesson);
    setActiveLessonId(created.id);
    setEditForm(created);
    setIsEditing(true);
    showToast('New lesson draft created', 'success');
  };

  const startEdit = (lesson: LessonPlan) => {
    setEditForm({ ...lesson });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editForm.id) return;
    storage.updateLessonPlan(editForm.id, editForm);
    setIsEditing(false);
    showToast('Lesson plan saved successfully', 'success');
  };

  const handleDuplicate = (id: string) => {
    const dup = storage.duplicateLessonPlan(id);
    if (dup) {
      setActiveLessonId(dup.id);
      showToast('Lesson duplicated', 'success');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lesson plan?')) {
      storage.deleteLessonPlan(id);
      const remaining = lessons.filter((l) => l.id !== id);
      if (remaining.length > 0) setActiveLessonId(remaining[0].id);
      setIsEditing(false);
      showToast('Lesson deleted', 'info');
    }
  };

  const handleAddActivity = () => {
    if (!newActivityTitle.trim() || !editForm) return;
    const newStep: ActivityStep = {
      id: 'step-' + Date.now().toString(36),
      title: newActivityTitle.trim(),
      durationMinutes: Number(newActivityDuration) || 5,
      description: newActivityDesc.trim() || 'Activity instructions',
      musicalConcept: newActivityConcept
    };
    const currentActs = editForm.activities || [];
    setEditForm({ ...editForm, activities: [...currentActs, newStep] });
    setNewActivityTitle('');
    setNewActivityDesc('');
  };

  const handleRemoveActivity = (stepId: string) => {
    if (!editForm || !editForm.activities) return;
    setEditForm({
      ...editForm,
      activities: editForm.activities.filter((a) => a.id !== stepId)
    });
  };

  // Duration calculation
  const totalDuration = (isEditing ? editForm.activities : activeLesson?.activities)?.reduce(
    (sum, a) => sum + (Number(a.durationMinutes) || 0),
    0
  ) || 0;

  const plannedClassDuration = (isEditing ? editForm.durationMinutes : activeLesson?.durationMinutes) || 40;
  const isOverDuration = totalDuration > plannedClassDuration;

  // AI Lesson Generator Assistant
  const handleGenerateAiLesson = () => {
    const created = storage.addLessonPlan({
      title: '4th Grade Body Percussion & Syncopated Rhythms',
      grade: '4',
      unit: 'Rhythm Literacy & Ostinato Grooves',
      durationMinutes: 25,
      overview: 'Generated based on prompt: 25-minute fast-paced rhythm workshop utilizing body percussion (stomp, pat, clap, snap) with zero instrument setup time.',
      objectives: [
        'Students will perform a 4-layer body percussion ostinato at 108 BPM without losing the pulse.',
        'Students will improvise a 2-measure syncopated answer to the teacher\'s call.'
      ],
      musicalConcepts: ['Syncopation', 'Body Percussion', 'Polyrhythm', 'Ostinato'],
      standards: ['MU:Cr1.1.4', 'MU:Pr4.2.4', 'MU:Re7.2.4'],
      materialsNeeded: ['Smart Board (Visual display)', 'Metronome audio'],
      assessmentStrategy: 'Small group 4-part ostinato balance check.',
      activities: [
        {
          id: 'ai-step-1',
          title: 'Quick Heartbeat Body Warmup',
          durationMinutes: 4,
          description: 'Follow-the-leader physical body warmup: Stomp (bass pulse) -> Pat knees (8th notes) -> Chest tap -> Snaps.',
          musicalConcept: 'Beat Preparation'
        },
        {
          id: 'ai-step-2',
          title: 'Call & Response Syncopated Clapping',
          durationMinutes: 6,
          description: 'Teacher claps syncopated 4-beat pattern (e.g. ti-ta-ti). Class echoes instantly with zero hesitation.',
          musicalConcept: 'Syncopation Ear Training'
        },
        {
          id: 'ai-step-3',
          title: '4-Way Class Ostinato Challenge',
          durationMinutes: 11,
          description: 'Divide room into 4 zones: Zone 1 stomps beats 1 & 3; Zone 2 pats continuous 8ths; Zone 3 claps off-beat syncopation; Zone 4 snaps beat 4.',
          musicalConcept: 'Polyrhythm Ensemble'
        },
        {
          id: 'ai-step-4',
          title: 'Freeze & Quick Assessment Exit',
          durationMinutes: 4,
          description: 'Sudden freeze on teacher cue. Each row performs their layer in isolation before lining up.',
          musicalConcept: 'Assessment'
        }
      ]
    });
    setIsAiModalOpen(false);
    setActiveLessonId(created.id);
    showToast('AI lesson template generated & ready!', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Grade Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <span>K–6 Music Lesson Planner & Curriculum</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Standards-aligned general music and chorus plans with duration tracking, activity steps, and Teach Mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle"
            title="Generate Lesson via AI Assistant"
          >
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="hidden sm:inline">AI Lesson Assistant</span>
          </button>
          <button
            onClick={startCreateNew}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lesson</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'K', '1', '2', '3', '4', '5', '6', 'Chorus'] as GradeLevel[]).map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedGrade === grade
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {grade === 'All' ? 'All Grades' : grade === 'Chorus' ? '6th Chorus' : `Grade ${grade}`}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Lesson List on Left, Active Plan on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search units, titles, concepts..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredLessons.map((l) => {
              const isSelected = l.id === activeLessonId;
              return (
                <div
                  key={l.id}
                  onClick={() => {
                    setActiveLessonId(l.id);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-white dark:bg-stone-800 border-brand-500 dark:border-brand-500 shadow-card'
                      : 'bg-stone-50/70 dark:bg-stone-900/60 border-stone-200/60 dark:border-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      Grade {l.grade}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {l.durationMinutes} min
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">
                    {l.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {l.unit}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {l.musicalConcepts.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Lesson Plan View & Editor */}
        <div className="lg:col-span-8">
          {activeLesson ? (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-6">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    Grade {isEditing ? editForm.grade : activeLesson.grade}
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {isEditing ? editForm.unit : activeLesson.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openTeachMode(activeLesson)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Presentation className="w-4 h-4" />
                        <span>Teach This Lesson</span>
                      </button>
                      <button
                        onClick={() => startEdit(activeLesson)}
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(activeLesson.id)}
                        className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Duplicate Lesson"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeLesson.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title and Duration Tracker */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full text-lg font-bold px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Unit Name
                      </label>
                      <input
                        type="text"
                        value={editForm.unit || ''}
                        onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Target Class Period Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={editForm.durationMinutes || 40}
                        onChange={(e) => setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })}
                        className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
                    {activeLesson.title}
                  </h2>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mt-1 leading-relaxed">
                    {activeLesson.overview}
                  </p>
                </div>
              )}

              {/* Running Duration Gauge & Overflow Warning */}
              <div
                className={`p-4 rounded-2xl flex items-center justify-between border ${
                  isOverDuration
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isOverDuration ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold">
                      Planned Duration: {totalDuration} min of {plannedClassDuration} min available
                    </h4>
                    {isOverDuration ? (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">
                        Warning: Activities exceed class time by {totalDuration - plannedClassDuration} minutes! Consider trimming one step.
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Pacing is within class limits ({plannedClassDuration - totalDuration} min buffer).
                      </p>
                    )}
                  </div>
                </div>
                <div className="font-mono font-bold text-lg">
                  {totalDuration}/{plannedClassDuration}m
                </div>
              </div>

              {/* NYS Standards & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Learning Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                    {(isEditing ? editForm.objectives : activeLesson.objectives)?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-500">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-purple-500" />
                    NYS Arts Learning Standards
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(isEditing ? editForm.standards : activeLesson.standards)?.map((code) => {
                      const std = NYS_MUSIC_STANDARDS.find((s) => s.code === code);
                      return (
                        <span
                          key={code}
                          title={std?.description || code}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-mono font-semibold text-purple-700 dark:text-purple-300 cursor-help"
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Activity Sequence */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center justify-between">
                  <span>Step-by-Step Activity Sequence</span>
                  <span className="text-xs font-normal text-stone-400">
                    {(isEditing ? editForm.activities : activeLesson.activities)?.length || 0} activities
                  </span>
                </h3>

                <div className="space-y-2.5">
                  {(isEditing ? editForm.activities : activeLesson.activities)?.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                            {act.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                            {act.durationMinutes} min
                          </span>
                          {act.musicalConcept && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              {act.musicalConcept}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 pl-8 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      {isEditing && (
                        <button
                          onClick={() => handleRemoveActivity(act.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg"
                          title="Remove Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Activity Form if editing */}
                {isEditing && (
                  <div className="p-4 rounded-2xl bg-stone-100/60 dark:bg-stone-800/40 border border-dashed border-stone-300 dark:border-stone-700 space-y-3">
                    <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Add New Activity Step
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newActivityTitle}
                        onChange={(e) => setNewActivityTitle(e.target.value)}
                        placeholder="Activity Title (e.g. Scarf Movement)"
                        className="sm:col-span-2 text-xs px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                      <input
                        type="number"
                        value={newActivityDuration}
                        onChange={(e) => setNewActivityDuration(Number(e.target.value))}
                        placeholder="Duration (min)"
                        className="text-xs px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                      />
                    </div>
                    <textarea
                      value={newActivityDesc}
                      onChange={(e) => setNewActivityDesc(e.target.value)}
                      placeholder="Step-by-step teaching directions and prompts..."
                      rows={2}
                      className="w-full text-xs px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                    />
                    <button
                      onClick={handleAddActivity}
                      disabled={!newActivityTitle.trim()}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Step to Sequence</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Class Section Delivery Log */}
              <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-brand-500" />
                  Class Sections Delivery History
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classes
                    .filter((c) => activeLesson.grade === 'All' || c.grade === activeLesson.grade)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
                          <span>{section.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {section.studentCount} students
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Last session: {section.lastDeliveredDate || 'Not started'} • {section.completedActivitiesCount || 0} activities finished
                        </p>
                        {section.notesForNextTime && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                            Next time: {section.notesForNextTime}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center text-stone-400">
              Select or create a lesson plan to begin.
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  AI Lesson Plan Assistant
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Generate instant editable elementary music lesson frameworks aligned to NYS standards.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Instructional Prompt
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAiLesson}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Lesson Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
