import React, { useState } from 'react';
import { Task, Priority } from '../types';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Folder,
  FileText,
  Layout,
  CheckSquare,
  Square,
  Clock,
  Play,
  X,
  Check,
  Sparkles,
  ListChecks,
  CheckCircle2,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface TasksScreenProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onRescheduleTask?: (task: Task) => void;
  onBatchUpdateTasks?: (taskIds: string[], updates: Partial<Task>) => void;
  onBatchDeleteTasks?: (taskIds: string[]) => void;
  onStartFocus: (task: Task | string) => void;
  onOpenAICreate: () => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onBatchUpdateTasks,
  onBatchDeleteTasks,
  onStartFocus,
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'To Do' | 'In Progress' | 'Done'>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Batch Edit States
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchPriority, setBatchPriority] = useState<Priority | ''>('');
  const [batchDeadline, setBatchDeadline] = useState('');
  const [batchCategory, setBatchCategory] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields for Add
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('HIGH');
  const [newCategory, setNewCategory] = useState<'Study' | 'Deep Work' | 'Meeting' | 'Project' | 'Personal'>('Study');
  const [newDeadline, setNewDeadline] = useState('Today, 5:00 PM');
  const [newMinutes, setNewMinutes] = useState(60);

  // Form Fields for Edit
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('HIGH');
  const [editCategory, setEditCategory] = useState<'Study' | 'Deep Work' | 'Meeting' | 'Project' | 'Personal'>('Study');
  const [editDeadline, setEditDeadline] = useState('');
  const [editMinutes, setEditMinutes] = useState(60);
  const [editStatus, setEditStatus] = useState<Task['status']>('PENDING');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter tasks according to active filterTab
  const filteredTasks = tasks.filter((t) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'To Do') return t.status === 'PENDING';
    if (filterTab === 'In Progress') return t.status === 'IN_PROGRESS';
    if (filterTab === 'Done') return t.status === 'COMPLETED';
    return true;
  });

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Study':
        return { icon: Calendar, bg: 'bg-rose-100 text-rose-500' };
      case 'Deep Work':
        return { icon: Folder, bg: 'bg-orange-100 text-orange-500' };
      case 'Meeting':
        return { icon: FileText, bg: 'bg-purple-100 text-purple-600' };
      case 'Project':
        return { icon: Layout, bg: 'bg-sky-100 text-sky-600' };
      default:
        return { icon: CheckSquare, bg: 'bg-emerald-100 text-emerald-600' };
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditCategory(task.category || 'Study');
    setEditDeadline(task.deadline);
    setEditMinutes(task.estimatedMinutes || 60);
    setEditStatus(task.status);
  };

  // Submit Add
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      category: newCategory,
      deadline: newDeadline,
      estimatedMinutes: newMinutes,
      status: 'PENDING',
      source: 'manual',
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
    showToast('Task created successfully!');
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    if (onEditTask) {
      onEditTask({
        ...editingTask,
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        category: editCategory,
        deadline: editDeadline,
        estimatedMinutes: editMinutes,
        status: editStatus,
      });
    }

    setEditingTask(null);
    showToast('Task updated successfully!');
  };

  // Delete task
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      if (onDeleteTask) onDeleteTask(id);
      showToast('Task deleted.');
    }
  };

  // -------------------------------------------------------------
  // BATCH ACTIONS
  // -------------------------------------------------------------
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTaskIds(filteredTasks.map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };

  const handleBatchUpdatePriority = (priority: Priority) => {
    if (selectedTaskIds.length === 0) return;
    if (onBatchUpdateTasks) {
      onBatchUpdateTasks(selectedTaskIds, { priority });
    } else {
      selectedTaskIds.forEach((id) => {
        const task = tasks.find((t) => t.id === id);
        if (task && onEditTask) onEditTask({ ...task, priority });
      });
    }
    showToast(`Updated priority to ${priority} for ${selectedTaskIds.length} tasks!`);
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handleBatchUpdateDeadline = (deadline: string) => {
    if (selectedTaskIds.length === 0 || !deadline.trim()) return;
    if (onBatchUpdateTasks) {
      onBatchUpdateTasks(selectedTaskIds, { deadline: deadline.trim() });
    } else {
      selectedTaskIds.forEach((id) => {
        const task = tasks.find((t) => t.id === id);
        if (task && onEditTask) onEditTask({ ...task, deadline: deadline.trim() });
      });
    }
    showToast(`Updated deadline to "${deadline}" for ${selectedTaskIds.length} tasks!`);
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handleBatchModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskIds.length === 0) return;

    const updates: Partial<Task> = {};
    if (batchPriority) updates.priority = batchPriority;
    if (batchDeadline.trim()) updates.deadline = batchDeadline.trim();
    if (batchCategory) updates.category = batchCategory as any;

    if (Object.keys(updates).length === 0) {
      setIsBatchModalOpen(false);
      return;
    }

    if (onBatchUpdateTasks) {
      onBatchUpdateTasks(selectedTaskIds, updates);
    } else {
      selectedTaskIds.forEach((id) => {
        const task = tasks.find((t) => t.id === id);
        if (task && onEditTask) onEditTask({ ...task, ...updates });
      });
    }

    showToast(`Batch updated ${selectedTaskIds.length} tasks successfully!`);
    setSelectedTaskIds([]);
    setIsBatchModalOpen(false);
    setIsBatchMode(false);
    setBatchPriority('');
    setBatchDeadline('');
    setBatchCategory('');
  };

  const handleBatchDelete = () => {
    if (selectedTaskIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) return;

    if (onBatchDeleteTasks) {
      onBatchDeleteTasks(selectedTaskIds);
    } else if (onDeleteTask) {
      selectedTaskIds.forEach((id) => onDeleteTask(id));
    }
    showToast(`Deleted ${selectedTaskIds.length} tasks.`);
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const handleBatchMarkComplete = (completed: boolean) => {
    if (selectedTaskIds.length === 0) return;
    const status: Task['status'] = completed ? 'COMPLETED' : 'PENDING';
    if (onBatchUpdateTasks) {
      onBatchUpdateTasks(selectedTaskIds, { status });
    } else {
      selectedTaskIds.forEach((id) => {
        const task = tasks.find((t) => t.id === id);
        if (task && onEditTask) onEditTask({ ...task, status });
      });
    }
    showToast(`Marked ${selectedTaskIds.length} tasks as ${completed ? 'Completed' : 'Pending'}.`);
    setSelectedTaskIds([]);
    setIsBatchMode(false);
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-600 border-rose-200/60';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-600 border-amber-200/60';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Done';
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return 'To Do';
    }
  };

  const getProgress = (task: Task) => {
    if (task.status === 'COMPLETED') return 100;
    if (task.status === 'IN_PROGRESS') return 60;
    return 0;
  };

  return (
    <div className="space-y-4 pb-16 w-full max-w-3xl mx-auto animate-fade-in text-slate-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Add Task and Batch Edit Buttons */}
      <div className="flex items-center justify-between py-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">My Tasks</h2>
          <p className="text-[11px] text-slate-400 font-medium">Manage, schedule, and batch edit tasks</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Batch Edit Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) setSelectedTaskIds([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition active:scale-95 ${
              isBatchMode
                ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Select multiple tasks to change priority or deadline in a single operation"
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>{isBatchMode ? 'Exit Batch' : 'Batch Edit'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
            title="Add a new task"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Batch Mode Selection Bar */}
      {isBatchMode && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-3 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-purple-900">
              {selectedTaskIds.length} of {filteredTasks.length} tasks selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectedTaskIds.length === filteredTasks.length ? handleDeselectAll : handleSelectAll}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
            >
              {selectedTaskIds.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                setIsBatchMode(false);
                setSelectedTaskIds([]);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter Tabs (All, To Do, In Progress, Done) */}
      <div className="flex bg-slate-100/90 p-1 rounded-2xl gap-1">
        {(['All', 'To Do', 'In Progress', 'Done'] as const).map((tab) => {
          let count = tasks.length;
          if (tab === 'To Do') count = tasks.filter((t) => t.status === 'PENDING').length;
          if (tab === 'In Progress') count = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
          if (tab === 'Done') count = tasks.filter((t) => t.status === 'COMPLETED').length;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`flex-1 py-1.5 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                filterTab === tab
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  filterTab === tab ? 'bg-purple-800/60 text-purple-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Tasks Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>{filterTab === 'All' ? 'All Active Tasks' : `${filterTab} Tasks`}</span>
        <span>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>

      {/* 4. Filtered Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((t) => {
          const { icon: Icon, bg: iconBg } = getCategoryIcon(t.category);
          const isDone = t.status === 'COMPLETED';
          const progress = getProgress(t);
          const isSelected = selectedTaskIds.includes(t.id);

          return (
            <div
              key={t.id}
              onClick={() => isBatchMode && handleToggleSelectTask(t.id)}
              className={`bg-white rounded-2xl p-3.5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                isBatchMode ? 'cursor-pointer select-none' : ''
              } ${
                isSelected
                  ? 'ring-2 ring-purple-600 border-purple-300 bg-purple-50/30'
                  : isDone
                  ? 'border-slate-100 opacity-75'
                  : 'border-slate-100 hover:border-purple-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Batch Checkbox (in Batch Mode) */}
                {isBatchMode && (
                  <div className="pt-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectTask(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer accent-purple-600"
                    />
                  </div>
                )}

                {/* Category Icon */}
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h4
                      className={`text-xs font-bold text-slate-900 truncate ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </h4>

                    {/* Action buttons on card (hidden or secondary in batch mode) */}
                    {!isBatchMode && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(t);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(t.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.description}</p>
                  )}

                  {/* Badges: Priority + Status + Deadline */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {getStatusLabel(t.status)}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium ml-auto">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[110px]">{t.deadline}</span>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100/70">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(t.id);
                        }}
                        className="text-purple-600 hover:text-purple-700 transition"
                        title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                      >
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 fill-purple-600 text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{progress}%</span>
                    </div>

                    {!isBatchMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartFocus(t);
                        }}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg transition active:scale-95 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-purple-600" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs text-center text-slate-400 space-y-2">
            <CheckSquare className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-slate-700">No {filterTab} tasks found</h4>
            <p className="text-xs text-slate-400">
              {filterTab === 'Done'
                ? 'Complete tasks by clicking the check box.'
                : 'Click "+ Add Task" to add a new task to your list.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a Task</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. FLOATING BATCH ACTION BAR (When tasks selected in Batch Mode) */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedTaskIds.length}
            </span>
            <span className="text-xs font-bold">Tasks Selected</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* Quick Priority Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 flex items-center gap-1 border border-slate-700 transition"
              >
                <span>Priority</span>
              </button>
              <div className="hidden group-hover:flex absolute bottom-full mb-2 left-0 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 shadow-2xl flex-col gap-1 min-w-[130px] z-50">
                <button
                  type="button"
                  onClick={() => handleBatchUpdatePriority('HIGH')}
                  className="px-2.5 py-1 text-left text-xs font-bold text-rose-400 hover:bg-slate-700 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>HIGH</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchUpdatePriority('MEDIUM')}
                  className="px-2.5 py-1 text-left text-xs font-bold text-amber-400 hover:bg-slate-700 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>MEDIUM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchUpdatePriority('LOW')}
                  className="px-2.5 py-1 text-left text-xs font-bold text-emerald-400 hover:bg-slate-700 rounded-lg flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>LOW</span>
                </button>
              </div>
            </div>

            {/* Quick Deadline Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 flex items-center gap-1 border border-slate-700 transition"
              >
                <span>Deadline</span>
              </button>
              <div className="hidden group-hover:flex absolute bottom-full mb-2 left-0 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 shadow-2xl flex-col gap-1 min-w-[160px] z-50">
                <button
                  type="button"
                  onClick={() => handleBatchUpdateDeadline('Today, 6:00 PM')}
                  className="px-2.5 py-1 text-left text-xs font-semibold text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Today, 6:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchUpdateDeadline('Tomorrow, 10:00 AM')}
                  className="px-2.5 py-1 text-left text-xs font-semibold text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Tomorrow, 10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchUpdateDeadline('Tomorrow, 5:00 PM')}
                  className="px-2.5 py-1 text-left text-xs font-semibold text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Tomorrow, 5:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchUpdateDeadline('Friday, 2:00 PM')}
                  className="px-2.5 py-1 text-left text-xs font-semibold text-slate-200 hover:bg-slate-700 rounded-lg"
                >
                  Friday, 2:00 PM
                </button>
              </div>
            </div>

            {/* Full Batch Edit Modal Opener */}
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-bold text-white shadow-xs active:scale-95 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Batch Edit</span>
            </button>

            {/* Complete / Pending */}
            <button
              type="button"
              onClick={() => handleBatchMarkComplete(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition"
              title="Mark all selected as completed"
            >
              Mark Done
            </button>

            {/* Delete Batch */}
            <button
              type="button"
              onClick={handleBatchDelete}
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-xs transition"
              title="Delete selected tasks"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Deselect / Cancel */}
            <button
              type="button"
              onClick={() => setSelectedTaskIds([])}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. BATCH EDIT MODAL (Dialog) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Batch Edit ({selectedTaskIds.length} Tasks)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change priority and deadline for all selected tasks in one go.
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchModalSubmit} className="space-y-4 pt-4">
              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Change Priority:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchPriority('')}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition ${
                      batchPriority === ''
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Keep Current
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchPriority('HIGH')}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition ${
                      batchPriority === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    HIGH
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchPriority('MEDIUM')}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition ${
                      batchPriority === 'MEDIUM'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    MEDIUM
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchPriority('LOW')}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition ${
                      batchPriority === 'LOW'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    LOW
                  </button>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Change Deadline:
                </label>
                <input
                  type="text"
                  value={batchDeadline}
                  onChange={(e) => setBatchDeadline(e.target.value)}
                  placeholder="e.g. Today, 6:00 PM or Tomorrow, 10:00 AM"
                  className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                {/* Quick Presets */}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {['Today, 6:00 PM', 'Tomorrow, 10:00 AM', 'Tomorrow, 5:00 PM', 'Friday, 2:00 PM'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBatchDeadline(preset)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Change Category (optional):
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {['', 'Study', 'Deep Work', 'Meeting', 'Project', 'Personal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBatchCategory(cat)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        batchCategory === cat
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat || 'Keep Current'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to {selectedTaskIds.length} Tasks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. ADD TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete ML Assignment 3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional instructions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="Study">Study</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Project">Project</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="PENDING">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    <option value="Study">Study</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Project">Project</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
