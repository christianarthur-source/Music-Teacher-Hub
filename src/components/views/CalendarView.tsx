import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { CalendarEvent } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Download,
  Upload,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { showToast } = useApp();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('class');
  const [startDate, setStartDate] = useState('2026-11-03T10:15');
  const [endDate, setEndDate] = useState('2026-11-03T10:55');
  const [location, setLocation] = useState('Room 104');

  const reloadData = () => {
    setEvents(storage.getEvents());
  };

  useEffect(() => {
    reloadData();
    const unsub = storage.subscribe(reloadData);
    return unsub;
  }, []);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const colors: Record<string, string> = {
      class: '#0c87eb',
      chorus: '#be123c',
      concert: '#d97706',
      assembly: '#059669',
      pd: '#7c3aed',
      meeting: '#475569'
    };

    const created = storage.addEvent({
      title: title.trim(),
      startDate,
      endDate,
      category,
      location,
      color: colors[category] || '#0c87eb',
      source: 'local'
    });

    setIsAddEventOpen(false);
    setTitle('');
    showToast(`Added event: ${created.title}`, 'success');
  };

  const handleDeleteEvent = (id: string) => {
    storage.deleteEvent(id);
    showToast('Event deleted', 'info');
  };

  // Export iCalendar (.ics)
  const handleExportIcs = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Music Teacher Hub//Command Center Calendar//EN',
      'CALSCALE:GREGORIAN'
    ];

    events.forEach((ev) => {
      const dtStart = ev.startDate.replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtEnd = ev.endDate.replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${ev.id}@musichub.local`);
      icsContent.push(`SUMMARY:${ev.title}`);
      icsContent.push(`DTSTART:${dtStart}`);
      icsContent.push(`DTEND:${dtEnd}`);
      if (ev.location) icsContent.push(`LOCATION:${ev.location}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music-teacher-schedule.ics';
    a.click();
    showToast('Exported calendar as .ics for Apple / Google Calendar', 'success');
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
            <span>Class & Rehearsal Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Unified schedule for K–6 general music, 6th-grade chorus rehearsals, assemblies, and concert dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportIcs}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Export .ics file for Apple Calendar & Google Calendar"
          >
            <Download className="w-4 h-4" />
            <span>Export .ics</span>
          </button>
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'class', label: 'Music Classes' },
          { id: 'chorus', label: 'Chorus Rehearsals' },
          { id: 'concert', label: 'Concerts' },
          { id: 'assembly', label: 'Assemblies' },
          { id: 'pd', label: 'Professional Learning' }
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedCategory(chip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === chip.id
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Events Agenda View */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center justify-between">
          <span>Upcoming Events & Classes ({filteredEvents.length})</span>
        </h3>

        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const dateStr = event.startDate.split('T')[0];
            const startTime = event.startDate.split('T')[1]?.slice(0, 5) || '09:00';
            const endTime = event.endDate.split('T')[1]?.slice(0, 5) || '09:40';

            return (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0 pr-3">
                  <div
                    className="w-3 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: event.color || '#0c87eb' }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        {event.category}
                      </span>
                      <span className="text-xs font-mono text-stone-400">{dateStr}</span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate mt-0.5">
                      {event.title}
                    </h4>

                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{startTime} – {endTime}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 text-stone-400 hover:text-rose-500 rounded-xl transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvent}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Add Calendar Event
            </h3>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5th Grade Chorus Rehearsal"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              >
                <option value="class">Music Class</option>
                <option value="chorus">Chorus Rehearsal</option>
                <option value="concert">Concert</option>
                <option value="assembly">School Assembly</option>
                <option value="pd">Professional Development</option>
                <option value="meeting">Meeting / Duty</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room 104, Auditorium, Gym..."
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
