export type TaskType = 'Tugas' | 'Kuis' | 'Presentasi' | 'Ujian' | 'Praktikum' | 'Proyek';

export type Priority = 'Tinggi' | 'Sedang' | 'Rendah';

export type SubmissionPlatform =
  | 'Google Classroom'
  | 'Moodle/LMS Kampus'
  | 'Email Dosen'
  | 'Hardcopy / Cetak'
  | 'Siam / Portal Akademik'
  | 'Lainnya';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string; // Tailwind hex or color name
  title: string;
  description?: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DDTHH:mm
  priority: Priority;
  estimatedMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
  workedToday?: boolean; // Pinned to "Kerjakan Hari Ini"
  subtasks: Subtask[];
  submissionPlatform: SubmissionPlatform;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturer?: string;
  color: string;
  dayOfWeek?: number; // 1: Senin, 2: Selasa, ... 6: Sabtu
  room?: string;
  time?: string;
}

export type UrgencyLevel = 'overdue' | 'critical' | 'warning' | 'normal' | 'relaxed';

export interface UrgencyInfo {
  diffMs: number;
  diffMinutes: number;
  diffHours: number;
  diffDays: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  urgencyLevel: UrgencyLevel;
  badgeText: string;
  detailText: string;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
}
