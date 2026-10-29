import React, { useState, useEffect } from 'react';
import { Task, Course } from './types';
import { INITIAL_COURSES, getInitialTasks } from './data/initialData';
import {
  calculateStats,
  getTodayTasks,
  sortTasks,
} from './utils/deadline';
import { TaskCard } from './components/TaskCard';
import { TodayFocusView } from './components/TodayFocusView';
import { CalendarView } from './components/CalendarView';
import { CourseManagerView } from './components/CourseManagerView';
import { TaskFormModal } from './components/TaskFormModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Flame,
  ListTodo,
  Calendar as CalendarIcon,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

type TabView = 'today' | 'all' | 'calendar' | 'courses';

export default function App() {
  // Load tasks from localStorage or seed data
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('deadline_kuliah_tasks_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialTasks();
  });

  // Load courses from localStorage or seed data
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('deadline_kuliah_courses_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COURSES;
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('deadline_kuliah_tasks_v1', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('deadline_kuliah_courses_v1', JSON.stringify(courses));
    } catch {
      // ignore
    }
  }, [courses]);

  // Current view tab
  const [activeTab, setActiveTab] = useState<TabView>('today');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'course' | 'title'>('deadline');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // Stats calculation
  const stats = calculateStats(tasks);
  const todayTasks = getTodayTasks(tasks);

  // CRUD Operations
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: string) => {
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...taskData } : t))
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Yakin ingin menghapus tugas ini?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleted = !t.isCompleted;
          return {
            ...t,
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleToggleToday = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, workedToday: !t.workedToday } : t))
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    // Also update courseName/color in tasks
    setTasks((prev) =>
      prev.map((t) =>
        t.courseId === updatedCourse.id
          ? { ...t, courseName: updatedCourse.name, courseColor: updatedCourse.color }
          : t
      )
    );
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Hapus mata kuliah ini? Tugas terkait akan tetap tersimpan.')) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  const handleResetSampleData = () => {
    if (confirm('Reset ulang data tugas & mata kuliah ke contoh awal?')) {
      setTasks(getInitialTasks());
      setCourses(INITIAL_COURSES);
    }
  };

  // Filter and sort for "Semua Tugas" tab
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchCourse = task.courseName.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse && !matchDesc) return false;
    }

    // Status filter
    if (selectedStatusFilter === 'ACTIVE' && task.isCompleted) return false;
    if (selectedStatusFilter === 'COMPLETED' && !task.isCompleted) return false;

    // Course filter
    if (selectedCourseFilter !== 'ALL' && task.courseId !== selectedCourseFilter) return false;

    // Type filter
    if (selectedTypeFilter !== 'ALL' && task.type !== selectedTypeFilter) return false;

    return true;
  });

  const sortedTasks = sortTasks(filteredTasks, sortBy, true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  DeadlineKuliah
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Mahasiswa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Pengingat tugas & prioritas belajar kampus
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />

            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs sm:text-sm text-white shadow-sm shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>

            <button
              onClick={handleResetSampleData}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Reset ke contoh data awal"
              aria-label="Reset data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'today'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>Kerjakan Hari Ini</span>
            {todayTasks.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'today'
                    ? 'bg-amber-700 text-amber-100'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {todayTasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Semua Tugas</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'all'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stats.active}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Kalender Tenggat</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Kuliah ({courses.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tugas Aktif
              </p>
              <p className="text-xl font-extrabold text-slate-900">{stats.active}</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('today')}
            className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs flex items-center gap-3 cursor-pointer hover:bg-amber-50 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Hari Ini
              </p>
              <p className="text-xl font-extrabold text-amber-900">{todayTasks.length}</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Terlewat
              </p>
              <p className="text-xl font-extrabold text-red-600">{stats.overdue}</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Selesai ({stats.completionRate}%)
              </p>
              <p className="text-xl font-extrabold text-emerald-700">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* View Switch Routing */}
        {activeTab === 'today' && (
          <TodayFocusView
            tasks={todayTasks}
            allTasks={tasks}
            onToggleComplete={handleToggleComplete}
            onToggleToday={handleToggleToday}
            onStartFocus={(task) => setFocusTask(task)}
            onEdit={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama tugas, mata kuliah, atau kata kunci..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setSelectedStatusFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedStatusFilter === 'ACTIVE'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aktif ({stats.active})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('COMPLETED')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedStatusFilter === 'COMPLETED'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Selesai ({stats.completed})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedStatusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({stats.total})
                  </button>
                </div>
              </div>

              {/* Second row: Course selector, Type filter, Sort */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Course Dropdown */}
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">Semua Mata Kuliah</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">Semua Jenis</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Kuis">Kuis</option>
                    <option value="Presentasi">Presentasi</option>
                    <option value="Ujian">Ujian</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Proyek">Proyek</option>
                  </select>
                </div>

                {/* Sort Option (Urutkan tugas berdasarkan tenggat terdekat) */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Urutkan:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'deadline' | 'priority' | 'course' | 'title')
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="deadline">Tenggat Terdekat (Utama)</option>
                    <option value="priority">Prioritas Tertinggi</option>
                    <option value="course">Mata Kuliah (A-Z)</option>
                    <option value="title">Judul Tugas (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks Cards Grid */}
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-white border border-slate-200/80">
                <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800">
                  Tidak ada tugas yang sesuai filter
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Coba ganti filter atau tambahkan tugas kuliah baru sekarang.
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 font-semibold text-xs text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  + Tambah Tugas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onToggleToday={handleToggleToday}
                    onStartFocus={(t) => setFocusTask(t)}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onToggleToday={handleToggleToday}
            onStartFocus={(task) => setFocusTask(task)}
            onEdit={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {activeTab === 'courses' && (
          <CourseManagerView
            courses={courses}
            tasks={tasks}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onSelectCourseFilter={(courseId) => {
              setSelectedCourseFilter(courseId);
              setActiveTab('all');
            }}
          />
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
        courses={courses}
        onAddCourse={handleAddCourse}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        task={focusTask}
        onClose={() => setFocusTask(null)}
        onCompleteTask={handleToggleComplete}
      />

      {/* Offline Toast */}
      <OfflineIndicator />
    </div>
  );
}
