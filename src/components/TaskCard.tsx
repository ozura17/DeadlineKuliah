import React from 'react';
import { Task } from '../types';
import { calculateUrgency, formatDateIndo } from '../utils/deadline';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Flame,
  MoreVertical,
  Play,
  Star,
  Trash2,
  Edit2,
  CheckSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleToday: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  isTodayView?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleToday,
  onStartFocus,
  onEdit,
  onDelete,
  onToggleSubtask,
  isTodayView = false,
}) => {
  const urgency = calculateUrgency(task.dueDate);

  const handleCheckboxClick = () => {
    if (!task.isCompleted) {
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
    onToggleComplete(task.id);
  };

  const completedSubtasksCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
        task.isCompleted
          ? 'border-slate-200 bg-slate-50/70 opacity-75'
          : urgency.isOverdue
          ? 'border-red-300 ring-1 ring-red-200/50'
          : urgency.isToday
          ? 'border-amber-300 ring-1 ring-amber-200/60'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Banner Accent Stripe */}
      <div
        className="h-1.5 w-full rounded-t-2xl transition-all"
        style={{
          backgroundColor: task.isCompleted ? '#94a3b8' : task.courseColor || '#4f46e5',
        }}
      />

      <div className="p-4 sm:p-5">
        {/* Header row: Course tag, Urgency badge, Today pin */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs"
              style={{ backgroundColor: task.courseColor || '#4f46e5' }}
            >
              {task.courseName}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {task.type}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Urgency Badge */}
            {!task.isCompleted && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${urgency.bgLightClass}`}
              >
                {urgency.isOverdue && <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />}
                {urgency.badgeText}
              </span>
            )}

            {/* Quick Pin to "Kerjakan Hari Ini" */}
            {!task.isCompleted && (
              <button
                type="button"
                onClick={() => onToggleToday(task.id)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  task.workedToday
                    ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                }`}
                title={task.workedToday ? 'Hapus dari Kerjakan Hari Ini' : 'Sematkan ke Kerjakan Hari Ini'}
                aria-label={task.workedToday ? 'Hapus dari Kerjakan Hari Ini' : 'Sematkan ke Kerjakan Hari Ini'}
              >
                <Flame className={`w-3.5 h-3.5 ${task.workedToday ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Task Title & Complete Checkbox */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleCheckboxClick}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer flex-shrink-0"
            aria-label={task.isCompleted ? `Tandai '${task.title}' belum selesai` : `Tandai '${task.title}' selesai`}
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-6 h-6 hover:stroke-indigo-600" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-bold text-slate-900 leading-snug break-words ${
                task.isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-xs mt-1 line-clamp-2 ${
                  task.isCompleted ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Subtasks inline checklist if exists */}
        {totalSubtasksCount > 0 && !task.isCompleted && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                Langkah Kerja ({completedSubtasksCount}/{totalSubtasksCount})
              </span>
              <span className="font-mono text-[11px]">
                {Math.round((completedSubtasksCount / totalSubtasksCount) * 100)}%
              </span>
            </div>

            {/* Subtask progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedSubtasksCount / totalSubtasksCount) * 100}%`,
                }}
              />
            </div>

            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onToggleSubtask && onToggleSubtask(task.id, st.id)}
                  className="w-full flex items-center gap-2 text-left text-xs text-slate-700 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-50 transition cursor-pointer"
                >
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                      st.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {st.completed && <span className="text-[10px] leading-none">✓</span>}
                  </span>
                  <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                    {st.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer: Due Date, Platform, Priority */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-1 font-medium ${
                urgency.isOverdue ? 'text-red-600 font-bold' : ''
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDateIndo(task.dueDate)}
            </span>

            {task.submissionPlatform && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {task.submissionPlatform}
              </span>
            )}

            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                task.priority === 'Tinggi'
                  ? 'bg-red-50 text-red-700'
                  : task.priority === 'Sedang'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Prioritas {task.priority}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Start Focus Timer Button (especially helpful in Today view) */}
            {!task.isCompleted && (
              <button
                type="button"
                onClick={() => onStartFocus(task)}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-2.5 py-1 text-xs transition cursor-pointer"
                title="Mulai Sesi Fokus (Timer Pomodoro)"
              >
                <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                <span className="hidden sm:inline">Fokus</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Edit tugas"
              aria-label={`Edit tugas ${task.title}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Hapus tugas"
              aria-label={`Hapus tugas ${task.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
