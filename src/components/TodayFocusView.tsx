import React from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { Flame, CheckCircle, Plus, Sparkles, AlertTriangle, Coffee } from 'lucide-react';

interface TodayFocusViewProps {
  tasks: Task[];
  allTasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleToday: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  tasks,
  allTasks,
  onToggleComplete,
  onToggleToday,
  onStartFocus,
  onEdit,
  onDelete,
  onOpenNewTaskModal,
  onToggleSubtask,
}) => {
  // Count how many tasks were completed today
  const todayDateStr = new Date().toDateString();
  const completedTodayCount = allTasks.filter(
    (t) => t.isCompleted && t.completedAt && new Date(t.completedAt).toDateString() === todayDateStr
  ).length;

  const totalTodayGoal = tasks.length + completedTodayCount;
  const progressPercent = totalTodayGoal > 0 ? Math.round((completedTodayCount / totalTodayGoal) * 100) : 0;

  // Uncompleted tasks needing attention
  const activeTodayTasks = tasks.filter((t) => !t.isCompleted);

  return (
    <div className="space-y-6">
      {/* Hero Focus Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 font-semibold text-xs mb-3 border border-white/15">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>FOKUS UTAMA HARI INI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {activeTodayTasks.length === 0 && completedTodayCount > 0
              ? 'Luar biasa! Semua target hari ini tuntas 🎉'
              : activeTodayTasks.length === 0
              ? 'Hari ini belum ada tugas mendesak! ✨'
              : `Kamu punya ${activeTodayTasks.length} tugas yang perlu diselesaikan hari ini.`}
          </h2>

          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Fokus selesaikan satu per satu tanpa terbebani tugas minggu depan. Gunakan timer Pomodoro untuk menjaga konsentrasi.
          </p>

          {/* Daily Progress Bar */}
          {totalTodayGoal > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                <span>Progres Selesai Hari Ini: {completedTodayCount} dari {totalTodayGoal} tugas</span>
                <span className="font-mono text-amber-300">{progressPercent}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Task List or Empty State */}
      {activeTodayTasks.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            {completedTodayCount > 0 ? (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            ) : (
              <Coffee className="w-8 h-8 text-indigo-500" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {completedTodayCount > 0
              ? 'Kerja kerasmu terbayar!'
              : 'Tidak ada tugas yang harus dikerjakan hari ini'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {completedTodayCount > 0
              ? 'Kamu telah menyelesaikan semua tugas prioritas hari ini. Nikmati waktu luangmu atau cicil tugas berikutnya!'
              : 'Semua tugasmu masih aman. Kamu bisa menyematkan tugas lain ke sini dengan menekan ikon api/bintang pada daftar tugas.'}
          </p>
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 font-semibold text-white text-sm shadow-md hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Daftar Prioritas ({activeTodayTasks.length})
            </h3>
            <span className="text-xs text-slate-500">
              Diurutkan otomatis: Terlewat & Tenggat Terdekat
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTodayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onToggleToday={onToggleToday}
                onStartFocus={onStartFocus}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
                isTodayView={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
