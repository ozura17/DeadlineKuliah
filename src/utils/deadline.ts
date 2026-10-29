import { Task, UrgencyInfo, UrgencyLevel, Priority } from '../types';

export function calculateUrgency(dueDateStr: string, referenceDate: Date = new Date()): UrgencyInfo {
  const due = new Date(dueDateStr);
  const now = referenceDate;
  const diffMs = due.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffMs < 0;

  // Calendar comparison
  const refYear = now.getFullYear();
  const refMonth = now.getMonth();
  const refDate = now.getDate();

  const dueYear = due.getFullYear();
  const dueMonth = due.getMonth();
  const dueDateNum = due.getDate();

  const isToday = refYear === dueYear && refMonth === dueMonth && refDate === dueDateNum;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    tomorrow.getFullYear() === dueYear &&
    tomorrow.getMonth() === dueMonth &&
    tomorrow.getDate() === dueDateNum;

  let urgencyLevel: UrgencyLevel = 'normal';
  let badgeText = '';
  let detailText = '';
  let colorClass = 'text-slate-700';
  let bgLightClass = 'bg-slate-100';
  let borderClass = 'border-slate-200';

  if (isOverdue) {
    urgencyLevel = 'overdue';
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absHours < 24) {
      badgeText = `Terlewat ${Math.max(1, absHours)} jam`;
    } else {
      badgeText = `Terlewat ${Math.max(1, absDays)} hari`;
    }
    detailText = 'Tenggat waktu telah lewat!';
    colorClass = 'text-red-700 dark:text-red-400';
    bgLightClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
    borderClass = 'border-red-300';
  } else if (isToday) {
    urgencyLevel = 'critical';
    if (diffHours <= 0) {
      badgeText = `Hari Ini (${Math.max(1, diffMinutes)} mnt lagi)`;
    } else {
      badgeText = `Hari Ini (${diffHours} jam lagi)`;
    }
    detailText = 'Wajib dikumpulkan hari ini!';
    colorClass = 'text-amber-800';
    bgLightClass = 'bg-amber-50 text-amber-800 border-amber-300';
    borderClass = 'border-amber-400';
  } else if (isTomorrow) {
    urgencyLevel = 'warning';
    badgeText = 'Besok';
    detailText = `Tenggat besok pukul ${due.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    colorClass = 'text-orange-800';
    bgLightClass = 'bg-orange-50 text-orange-800 border-orange-200';
    borderClass = 'border-orange-300';
  } else if (diffDays <= 3) {
    urgencyLevel = 'warning';
    badgeText = `H-${diffDays}`;
    detailText = `${diffDays} hari lagi`;
    colorClass = 'text-amber-700';
    bgLightClass = 'bg-amber-50 text-amber-700 border-amber-200';
    borderClass = 'border-amber-200';
  } else if (diffDays <= 7) {
    urgencyLevel = 'normal';
    badgeText = `H-${diffDays}`;
    detailText = `${diffDays} hari lagi (Minggu ini)`;
    colorClass = 'text-blue-700';
    bgLightClass = 'bg-blue-50 text-blue-700 border-blue-200';
    borderClass = 'border-blue-200';
  } else {
    urgencyLevel = 'relaxed';
    badgeText = `${diffDays} hari`;
    detailText = `${diffDays} hari lagi`;
    colorClass = 'text-emerald-700';
    bgLightClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    borderClass = 'border-emerald-200';
  }

  return {
    diffMs,
    diffMinutes,
    diffHours,
    diffDays,
    isOverdue,
    isToday,
    isTomorrow,
    urgencyLevel,
    badgeText,
    detailText,
    colorClass,
    bgLightClass,
    borderClass,
  };
}

export function getTodayTasks(tasks: Task[], referenceDate: Date = new Date()): Task[] {
  return tasks
    .filter((task) => {
      if (task.isCompleted) return false;
      if (task.workedToday) return true;
      const urgency = calculateUrgency(task.dueDate, referenceDate);
      if (urgency.isOverdue) return true;
      if (urgency.isToday) return true;
      if (urgency.isTomorrow && task.priority === 'Tinggi') return true;
      return false;
    })
    .sort((a, b) => {
      // Overdue first, then today, then pinned, by due date
      const urgencyA = calculateUrgency(a.dueDate, referenceDate);
      const urgencyB = calculateUrgency(b.dueDate, referenceDate);

      if (urgencyA.isOverdue && !urgencyB.isOverdue) return -1;
      if (!urgencyA.isOverdue && urgencyB.isOverdue) return 1;

      if (urgencyA.isToday && !urgencyB.isToday) return -1;
      if (!urgencyA.isToday && urgencyB.isToday) return 1;

      // Then by priority
      const priorityWeight: Record<Priority, number> = { Tinggi: 3, Sedang: 2, Rendah: 1 };
      const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (pDiff !== 0) return pDiff;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
}

export function sortTasks(
  tasks: Task[],
  sortBy: 'deadline' | 'priority' | 'course' | 'title',
  ascending: boolean = true
): Task[] {
  const priorityWeight: Record<Priority, number> = { Tinggi: 3, Sedang: 2, Rendah: 1 };
  const sorted = [...tasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      const timeA = new Date(a.dueDate).getTime();
      const timeB = new Date(b.dueDate).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    }
    if (sortBy === 'priority') {
      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      return ascending ? pB - pA : pA - pB;
    }
    if (sortBy === 'course') {
      const comp = a.courseName.localeCompare(b.courseName, 'id');
      return ascending ? comp : -comp;
    }
    if (sortBy === 'title') {
      const comp = a.title.localeCompare(b.title, 'id');
      return ascending ? comp : -comp;
    }
    return 0;
  });
  return sorted;
}

export function formatDateIndo(dateStr: string, withTime: boolean = true): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (withTime) {
      return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes}`;
    }
    return `${dayName}, ${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function calculateStats(tasks: Task[], referenceDate: Date = new Date()) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const active = total - completed;

  let dueToday = 0;
  let overdue = 0;

  tasks.forEach((t) => {
    if (!t.isCompleted) {
      const u = calculateUrgency(t.dueDate, referenceDate);
      if (u.isOverdue) overdue++;
      else if (u.isToday) dueToday++;
    }
  });

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    active,
    completed,
    dueToday,
    overdue,
    completionRate,
  };
}
