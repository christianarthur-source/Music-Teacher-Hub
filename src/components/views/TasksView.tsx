import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { TaskItem, TaskListType, Area, Project, Subtask } from '../../types';
import {
  Inbox,
  Star,
  Calendar,
  Layers,
  Archive,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Tag,
  CheckSquare,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  ListTodo,
  Check,
  Folder
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksView: React.FC = () => {
  const { showToast } = useApp();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeList, setActiveList] = useState<TaskListType>('today');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // New task input state
  const [quickInput, setQuickInput] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const reloadData = () => {
    setTasks(storage.getTasks());
    setAreas(storage.getAreas());
    setProjects(storage.getProjects());
  };

  useEffect(() => {
    reloadData();
    const unsub = storage.subscribe(reloadData);
    return unsub;
  }, []);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const parsed = storage.parseQuickTaskInput(quickInput, activeList);
    if (selectedAreaId) parsed.areaId = selectedAreaId;
    if (selectedProjectId) parsed.projectId = selectedProjectId;

    const newTask = storage.addTask(parsed);
    setQuickInput('');
    showToast(`Added: ${newTask.title}`, 'success');
  };

  const handleToggleComplete = (task: TaskItem) => {
    const isNowCompleted = !task.completed;
    storage.updateTask(task.id, { completed: isNowCompleted });
    if (isNowCompleted) {
      showToast('Completed!', 'success');
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
    }
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteTask(id);
    showToast('Task deleted', 'info');
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSub: Subtask = {
      id: 'sub-' + Date.now().toString(36),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    storage.updateTask(taskId, {
      subtasks: [...(task.subtasks || []), newSub]
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (taskId: string, subId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;
    const updated = task.subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s));
    storage.updateTask(taskId, { subtasks: updated });
  };

  // Filter tasks based on view selection
  const filteredTasks = tasks.filter((t) => {
    if (selectedAreaId && t.areaId !== selectedAreaId) return false;
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;

    if (activeList === 'logbook') {
      return t.completed;
    }

    if (t.completed) return false;

    if (activeList === 'today') {
      return t.listType === 'today';
    } else if (activeList === 'inbox') {
      return t.listType === 'inbox';
    } else if (activeList === 'upcoming') {
      return t.listType === 'upcoming';
    } else if (activeList === 'anytime') {
      return t.listType === 'anytime' || t.listType === 'today' || t.listType === 'inbox';
    } else if (activeList === 'someday') {
      return t.listType === 'someday';
    }
    return true;
  });

  const listNavItems: { type: TaskListType; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { type: 'inbox', label: 'Inbox', icon: Inbox, count: tasks.filter((t) => !t.completed && t.listType === 'inbox').length },
    { type: 'today', label: 'Today', icon: Star, count: tasks.filter((t) => !t.completed && t.listType === 'today').length },
    { type: 'upcoming', label: 'Upcoming', icon: Calendar, count: tasks.filter((t) => !t.completed && t.listType === 'upcoming').length },
    { type: 'anytime', label: 'Anytime', icon: Layers, count: tasks.filter((t) => !t.completed && t.listType !== 'someday' && t.listType !== 'logbook').length },
    { type: 'someday', label: 'Someday', icon: Archive, count: tasks.filter((t) => !t.completed && t.listType === 'someday').length },
    { type: 'logbook', label: 'Logbook', icon: CheckCircle2, count: tasks.filter((t) => t.completed).length }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-brand-600" />
            <span>Task Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Things-inspired workspace with areas of responsibility, subtasks, and natural language capture.
          </p>
        </div>
      </div>

      {/* 2-Column Things 3 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lists, Areas & Projects */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Things Core Lists */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-2.5 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-0.5">
            {listNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeList === item.type && !selectedAreaId && !selectedProjectId;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setActiveList(item.type);
                    setSelectedAreaId(null);
                    setSelectedProjectId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-subtle'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.type === 'today' ? 'text-amber-500' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Active Projects
            </h3>
            <div className="space-y-1">
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                const projTasks = tasks.filter((t) => t.projectId === proj.id && !t.completed);
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setSelectedAreaId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-subtle'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                      <span className="truncate">{proj.title}</span>
                    </div>
                    {projTasks.length > 0 && (
                      <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-1">
                        {projTasks.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Areas of Responsibility */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-card border border-stone-200/80 dark:border-stone-800 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Areas of Responsibility
            </h3>
            <div className="space-y-1">
              {areas.map((area) => {
                const isSelected = selectedAreaId === area.id;
                const count = tasks.filter((t) => t.areaId === area.id && !t.completed).length;
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      setSelectedAreaId(area.id);
                      setSelectedProjectId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-subtle'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-stone-400" />
                      <span>{area.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] font-mono text-stone-400">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Task List and Capture Bar */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick Capture Input */}
          <form onSubmit={handleQuickAdd}>
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-stone-900 shadow-card border border-stone-200/80 dark:border-stone-800 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Plus className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="New Task... (e.g. 'Order recorder ribbons Friday #chorus !high')"
                className="flex-1 bg-transparent text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-subtle shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          {/* Active List Heading */}
          <div className="flex items-center justify-between px-2 pt-2">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white capitalize flex items-center gap-2">
              {selectedProjectId ? (
                <>
                  <Folder className="w-5 h-5 text-amber-500" />
                  <span>{projects.find((p) => p.id === selectedProjectId)?.title}</span>
                </>
              ) : selectedAreaId ? (
                <>
                  <Folder className="w-5 h-5 text-brand-600" />
                  <span>{areas.find((a) => a.id === selectedAreaId)?.name}</span>
                </>
              ) : (
                <span>{activeList} Tasks</span>
              )}
            </h2>
            <span className="text-xs text-stone-400 font-mono">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800">
                <CheckCircle2 className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                  No tasks in this list
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Use the quick capture box above to add lesson preparation, rehearsal goals, or parent notices.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isExpanded = expandedTaskId === task.id;
                const area = areas.find((a) => a.id === task.areaId);
                const project = projects.find((p) => p.id === task.projectId);
                const subtaskCount = task.subtasks?.length || 0;
                const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-stone-900 border transition-all ${
                      isExpanded
                        ? 'border-brand-500 shadow-elevated'
                        : 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-card'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className="mt-0.5 text-stone-400 hover:text-brand-600 transition-colors shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`text-sm font-semibold leading-snug ${
                              task.completed
                                ? 'line-through text-stone-400 dark:text-stone-500'
                                : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h3>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {task.dueDate && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-stone-400" />
                                {task.dueDate}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="p-1 text-stone-400 hover:text-rose-500 rounded-lg transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {task.notes && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1">
                            {task.notes}
                          </p>
                        )}

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {project && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              {project.title}
                            </span>
                          )}
                          {area && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                              {area.name}
                            </span>
                          )}
                          {task.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              !High
                            </span>
                          )}
                          {task.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500"
                            >
                              #{t}
                            </span>
                          ))}
                          {subtaskCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-brand-500" />
                              {completedSubtasks}/{subtaskCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Checklist Subtasks & Notes Editor */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/80 pl-8 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                          Checklist Subtasks
                        </h4>

                        <div className="space-y-1.5">
                          {task.subtasks?.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => handleToggleSubtask(task.id, sub.id)}
                              className="flex items-center gap-2 text-xs cursor-pointer hover:text-brand-600 transition-colors"
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  sub.completed
                                    ? 'bg-brand-600 border-brand-600 text-white'
                                    : 'border-stone-300 dark:border-stone-700'
                                }`}
                              >
                                {sub.completed && <Check className="w-3 h-3" />}
                              </div>
                              <span className={sub.completed ? 'line-through text-stone-400' : 'text-stone-700 dark:text-stone-300'}>
                                {sub.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add subtask input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubtask(task.id);
                              }
                            }}
                            placeholder="Add subtask step..."
                            className="text-xs px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl flex-1 text-stone-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleAddSubtask(task.id)}
                            className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
