import React, { useState } from 'react';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDateIndo } from '../utils/deadline';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleToday: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onToggleToday,
  onStartFocus,
  onEdit,
  onDelete,
  onToggleSubtask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday, 1 = Monday, ...)
  const firstDay = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Map tasks to dates
  const tasksByDateKey: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.dueDate);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!tasksByDateKey[key]) tasksByDateKey[key] = [];
    tasksByDateKey[key].push(t);
  });

  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;
  const tasksForSelectedDate = selectedDateKey ? tasksByDateKey[selectedDateKey] || [] : [];

  const today = new Date();
  const isTodayDate = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  const isSelectedDate = (d: number) =>
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === d;

  return (
    <div className="space-y-6">
      {/* Calendar Card Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        {/* Month Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
            >
              Hari Ini
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`text-xs font-bold uppercase tracking-wider py-1 ${
                idx === 0 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/40 opacity-40" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const key = `${year}-${month}-${dayNum}`;
            const dayTasks = tasksByDateKey[key] || [];
            const activeCount = dayTasks.filter((t) => !t.isCompleted).length;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelectedDate(dayNum)
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50'
                    : isTodayDate(dayNum)
                    ? 'border-amber-400 bg-amber-50/30 font-bold'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold rounded-md w-6 h-6 flex items-center justify-center ${
                      isTodayDate(dayNum)
                        ? 'bg-amber-500 text-white'
                        : isSelectedDate(dayNum)
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {activeCount > 0 && (
                    <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700">
                      {activeCount}
                    </span>
                  )}
                </div>

                {/* Dots indicator for tasks */}
                <div className="flex flex-wrap gap-1 mt-1 overflow-hidden max-h-5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.isCompleted ? '#94a3b8' : t.courseColor }}
                      title={`${t.courseName}: ${t.title}`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-slate-400 leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day's Task Details */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              Tenggat Pada: {formatDateIndo(selectedDate.toISOString(), false)}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {tasksForSelectedDate.length} tugas terdaftar
            </span>
          </div>

          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-white border border-slate-200/80">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada tugas pada tanggal ini</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Bebas dari tenggat pengumpulan tugas di tanggal yang dipilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksForSelectedDate.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleToday={onToggleToday}
                  onStartFocus={onStartFocus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
