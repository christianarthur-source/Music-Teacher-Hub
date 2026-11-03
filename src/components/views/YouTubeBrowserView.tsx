import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Video,
  Plus,
  Play,
  ExternalLink,
  Search,
  Sparkles,
  Music,
  Trash2,
  Tag
} from 'lucide-react';

interface YouTubeVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  category: 'rhythm' | 'listening' | 'movement' | 'chorus' | 'song_tale';
  grade: string;
  notes: string;
}

export const YouTubeBrowserView: React.FC = () => {
  const { showToast } = useApp();

  const [videos, setVideos] = useState<YouTubeVideoItem[]>([
    {
      id: 'yt-1',
      youtubeId: 'Wz_f9B4pPtg',
      title: 'In the Hall of the Mountain King — Line Rider Music Visualization',
      channel: 'DoodleChaos',
      category: 'listening',
      grade: 'All Grades',
      notes: 'Terrific visual demonstration of crescendo and accelerando for Edvard Grieg.'
    },
    {
      id: 'yt-2',
      youtubeId: 'b_p4Fh6iM1g',
      title: 'Body Percussion Classroom Play-Along: Level 1 (Clap, Snap, Pat, Stomp)',
      channel: 'Music with Mr. DelGaudio',
      category: 'rhythm',
      grade: 'Grades 1–3',
      notes: 'Great 4-minute active rhythm warmup before instrument transition.'
    },
    {
      id: 'yt-3',
      youtubeId: 'zB4n2m8Xv9A',
      title: 'John Feierabend Song Tale: "The Crabfish" Pitch Matching Story',
      channel: 'First Steps in Music',
      category: 'song_tale',
      grade: 'Grades K–2',
      notes: 'Engaging expressive folk tale reinforcing head voice and listening posture.'
    },
    {
      id: 'yt-4',
      youtubeId: '9bZkp7q19f0',
      title: 'Choral Warm-Up: Resonant Vowels & Energetic Breath',
      channel: 'Choir Central',
      category: 'chorus',
      grade: '6th Chorus',
      notes: 'Lip trill and open Italian vowel exercises for 6th-grade choir rehearsal.'
    }
  ]);

  const [activeVideoId, setActiveVideoId] = useState<string>('Wz_f9B4pPtg');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<YouTubeVideoItem['category']>('rhythm');
  const [newGrade, setNewGrade] = useState('Grades 3–5');
  const [newNotes, setNewNotes] = useState('');

  const parseYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) return;

    const ytId = parseYoutubeId(newUrl.trim());
    const newItem: YouTubeVideoItem = {
      id: 'yt-' + Date.now().toString(36),
      youtubeId: ytId,
      title: newTitle.trim(),
      channel: 'Curated Resource',
      category: newCategory,
      grade: newGrade,
      notes: newNotes.trim()
    };

    setVideos([newItem, ...videos]);
    setActiveVideoId(ytId);
    setIsAddOpen(false);
    setNewUrl('');
    setNewTitle('');
    setNewNotes('');
    showToast('YouTube video added to library', 'success');
  };

  const filtered = videos.filter((v) => {
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <Video className="w-6 h-6 text-rose-600" />
            <span>Classroom YouTube Resource Browser</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Curated, classroom-tested video listening lessons, rhythm play-alongs, and choral warmups with embedded player.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video by URL</span>
        </button>
      </div>

      {/* Main Player & Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Embedded Video Player */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-3xl overflow-hidden shadow-elevated bg-black border border-stone-800 aspect-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=0&rel=0`}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Current Video Info */}
          {(() => {
            const current = videos.find((v) => v.youtubeId === activeVideoId);
            if (!current) return null;
            return (
              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {current.grade} • {current.category}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${current.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>Open in YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {current.title}
                </h3>
                {current.notes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif">
                    Teaching note: {current.notes}
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right: Curated Playlist Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Classroom Video Library ({filtered.length})
            </h3>
            <div className="flex gap-1 text-[11px]">
              {['all', 'rhythm', 'listening', 'chorus'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    selectedCategory === cat ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold' : 'text-stone-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((video) => {
              const isSelected = video.youtubeId === activeVideoId;
              return (
                <div
                  key={video.id}
                  onClick={() => setActiveVideoId(video.youtubeId)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 shadow-sm'
                      : 'bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 line-clamp-1">
                        {video.grade} • {video.channel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddVideo}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Add Classroom Video
            </h3>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                YouTube URL or Video ID
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or ID"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Body Percussion Ta and Ti-Ti"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                >
                  <option value="rhythm">Rhythm Play-Along</option>
                  <option value="listening">Music Listening / Line Rider</option>
                  <option value="movement">Folk Dance / Movement</option>
                  <option value="chorus">Choral Warmup</option>
                  <option value="song_tale">Song Tale / Story</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Grade</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  placeholder="e.g. Grades K–2"
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">Teaching Notes</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Great for transition between recorder testing..."
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Save Video
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
