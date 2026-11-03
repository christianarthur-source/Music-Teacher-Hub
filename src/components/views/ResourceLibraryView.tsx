import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { ResourceLink, GradeLevel } from '../../types';
import {
  FolderSync,
  Plus,
  ExternalLink,
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Star,
  Search,
  Tag,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const ResourceLibraryView: React.FC = () => {
  const { showToast } = useApp();

  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceLink['category']>('drive');
  const [grade, setGrade] = useState<GradeLevel>('All');
  const [tagsStr, setTagsStr] = useState('curriculum, scores');

  const reloadData = () => {
    setResources(storage.getResources());
  };

  useEffect(() => {
    reloadData();
    const unsub = storage.subscribe(reloadData);
    return unsub;
  }, []);

  // Auto-detect Google Drive file types from URL
  const detectDriveType = (inputUrl: string): { isDrive: boolean; driveType?: ResourceLink['driveType'] } => {
    if (inputUrl.includes('drive.google.com') || inputUrl.includes('docs.google.com')) {
      if (inputUrl.includes('/folders/')) return { isDrive: true, driveType: 'folder' };
      if (inputUrl.includes('/document/')) return { isDrive: true, driveType: 'doc' };
      if (inputUrl.includes('/spreadsheets/')) return { isDrive: true, driveType: 'sheet' };
      if (inputUrl.includes('/presentation/')) return { isDrive: true, driveType: 'slide' };
      return { isDrive: true, driveType: 'pdf' };
    }
    return { isDrive: false };
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    const { isDrive, driveType } = detectDriveType(url);

    const created = storage.addResource({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      category: isDrive ? 'drive' : category,
      grade,
      tags: tagsStr.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      isGoogleDrive: isDrive,
      driveType,
      isFavorite: false,
      lastUsed: new Date().toISOString().split('T')[0]
    });

    setIsAddOpen(false);
    setUrl('');
    setTitle('');
    setDescription('');
    showToast(`Added ${created.title}`, 'success');
  };

  const handleDelete = (id: string) => {
    storage.deleteResource(id);
    showToast('Resource removed', 'info');
  };

  const toggleFavorite = (id: string, current: boolean) => {
    storage.updateResource(id, { isFavorite: !current });
  };

  const filtered = resources.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getDriveIcon = (type?: ResourceLink['driveType']) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-5 h-5 text-amber-500" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      default:
        return <File className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <FolderSync className="w-6 h-6 text-brand-600" />
            <span>Google Drive & Resource Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Connect to curriculum folders, scores, Chrome Music Lab, and web resources with instant 1-click launch.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource or Drive URL</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'drive', label: 'Google Drive' },
            { id: 'game', label: 'Interactive Games' },
            { id: 'sheet_music', label: 'Sheet Music' },
            { id: 'listening', label: 'Listening' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, tags..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-3xl bg-white dark:bg-stone-900 shadow-card border border-stone-200/80 dark:border-stone-800 hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800">
                    {res.isGoogleDrive ? getDriveIcon(res.driveType) : <FolderSync className="w-5 h-5 text-indigo-500" />}
                  </div>
                  {res.isGoogleDrive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Google Drive
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(res.id, res.isFavorite)}
                    className="p-1 text-stone-400 hover:text-amber-500"
                  >
                    <Star className={`w-4 h-4 ${res.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                {res.title}
              </h3>

              {res.description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex flex-wrap gap-1">
                {res.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-brand-600 hover:text-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-subtle"
              >
                <span>Open in {res.isGoogleDrive ? 'Google Drive' : 'Browser'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Resource Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddResource}
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Add Teaching Resource or Google Drive Link
            </h3>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Resource URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://..."
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4th Grade Recorder Sheet Music"
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short teacher notes or lesson usage..."
                className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                >
                  <option value="drive">Google Drive</option>
                  <option value="game">Interactive Music Game</option>
                  <option value="sheet_music">Sheet Music / Scores</option>
                  <option value="listening">Listening Repertoire</option>
                  <option value="theory">Music Theory</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-stone-400 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="curriculum, orff"
                  className="w-full text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>
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
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                Save Resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
