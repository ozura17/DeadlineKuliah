import React, { useState } from 'react';
import { Task, Course, TaskType, Priority, SubmissionPlatform } from '../types';
import { X, Calendar, Clock, BookOpen, AlertCircle, Plus, Trash2, CheckCircle } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: string) => void;
  initialTask?: Task | null;
  courses: Course[];
  onAddCourse: (newCourse: Course) => void;
}

const TASK_TYPES: TaskType[] = ['Tugas', 'Kuis', 'Presentasi', 'Ujian', 'Praktikum', 'Proyek'];
const PRIORITIES: Priority[] = ['Tinggi', 'Sedang', 'Rendah'];
const PLATFORMS: SubmissionPlatform[] = [
  'Google Classroom',
  'Moodle/LMS Kampus',
  'Email Dosen',
  'Hardcopy / Cetak',
  'Siam / Portal Akademik',
  'Lainnya',
];

const COURSE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  courses,
  onAddCourse,
}) => {
  if (!isOpen) return null;

  // Format default due date (tomorrow at 23:59 if new)
  const getDefaultDueDate = () => {
    if (initialTask) return initialTask.dueDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T23:59`;
  };

  const [title, setTitle] = useState(initialTask?.title || '');
  const [courseId, setCourseId] = useState(initialTask?.courseId || (courses[0]?.id || ''));
  const [type, setType] = useState<TaskType>(initialTask?.type || 'Tugas');
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'Sedang');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [submissionPlatform, setSubmissionPlatform] = useState<SubmissionPlatform>(
    initialTask?.submissionPlatform || 'Google Classroom'
  );
  const [workedToday, setWorkedToday] = useState(initialTask?.workedToday || false);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    initialTask?.subtasks || []
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Quick course create mode
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseColor, setNewCourseColor] = useState(COURSE_COLORS[0]);

  // Validation
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];

  const handleQuickDate = (daysAhead: number, timeStr: string = '23:59') => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const [h, m] = timeStr.split(':').map(Number);
    target.setHours(h, m, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDueDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${timeStr}`);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'st-' + Date.now(), title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== stId));
  };

  const handleSaveCourse = () => {
    if (!newCourseName.trim()) {
      setErrorMsg('Nama mata kuliah tidak boleh kosong');
      return;
    }
    const newCourse: Course = {
      id: 'c-' + Date.now(),
      name: newCourseName.trim(),
      code: newCourseCode.trim() || 'MK' + Math.floor(100 + Math.random() * 900),
      color: newCourseColor,
    };
    onAddCourse(newCourse);
    setCourseId(newCourse.id);
    setIsAddingNewCourse(false);
    setNewCourseName('');
    setNewCourseCode('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul tugas wajib diisi!');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Tenggat waktu pengumpulan wajib diisi!');
      return;
    }

    const currentCourse = courses.find((c) => c.id === courseId) || courses[0];

    onSaveTask(
      {
        title: title.trim(),
        courseId: currentCourse ? currentCourse.id : 'c-default',
        courseName: currentCourse ? currentCourse.name : 'Umum',
        courseColor: currentCourse ? currentCourse.color : '#3b82f6',
        type,
        dueDate,
        priority,
        description: description.trim() || undefined,
        submissionPlatform,
        isCompleted: initialTask?.isCompleted || false,
        workedToday,
        subtasks,
      },
      initialTask?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 my-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Tugas Kuliah' : 'Tambah Tugas Kuliah'}
            </h2>
            <p className="text-xs text-slate-500">
              Catat mata kuliah dan tanggal tenggat agar tidak terlewat
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Tugas / Aktivitas *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Laporan Praktikum Subnetting Bab 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          {/* Mata Kuliah Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mata Kuliah *
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCourse(!isAddingNewCourse)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {isAddingNewCourse ? 'Pilih yang sudah ada' : '+ Matkul Baru'}
              </button>
            </div>

            {isAddingNewCourse ? (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Nama Matkul (cth: Grafika Komputer)"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-indigo-200 text-xs font-medium"
                  />
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Kode (cth: IF3201)"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-indigo-200 text-xs font-medium"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Warna Tag:</span>
                  <div className="flex gap-1.5">
                    {COURSE_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCourseColor(col)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          newCourseColor === col ? 'border-slate-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCourse}
                    className="ml-auto px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                  >
                    Simpan Matkul
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
                {selectedCourse && (
                  <span
                    className="absolute right-9 top-3.5 w-3 h-3 rounded-full pointer-events-none"
                    style={{ backgroundColor: selectedCourse.color }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Jenis & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Tugas
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Prioritas
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p;
                  let colorStyles = 'border-slate-200 text-slate-600';
                  if (isSelected) {
                    if (p === 'Tinggi') colorStyles = 'bg-red-50 text-red-700 border-red-300 font-bold';
                    else if (p === 'Sedang')
                      colorStyles = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
                    else colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs rounded-xl border transition cursor-pointer ${colorStyles}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tenggat Waktu Pengumpulan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Tanggal & Jam Tenggat (Deadline) *
              </label>
            </div>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center mr-1">Pintasan:</span>
              <button
                type="button"
                onClick={() => handleQuickDate(0, '23:59')}
                className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Hari Ini 23:59
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1, '23:59')}
                className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Besok 23:59
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(3, '23:59')}
                className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +3 Hari
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(7, '23:59')}
                className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +1 Minggu
              </button>
            </div>
          </div>

          {/* Tempat Pengumpulan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Platform Pengumpulan
            </label>
            <select
              value={submissionPlatform}
              onChange={(e) => setSubmissionPlatform(e.target.value as SubmissionPlatform)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Daftar Langkah Kerja (Subtasks)
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="truncate">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    aria-label={`Hapus subtask ${st.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambah langkah kerja (misal: Cari referensi jurnal)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
          </div>

          {/* Deskripsi & Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan & Instruksi Dosen (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tambahan, format file (PDF/ZIP), rubrik penilaian..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Checkbox Masukkan ke "Kerjakan Hari Ini" */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <input
              type="checkbox"
              id="workTodayCheck"
              checked={workedToday}
              onChange={(e) => setWorkedToday(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="workTodayCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Sematkan langsung ke tampilan <strong>“Kerjakan Hari Ini”</strong>
              <p className="text-[11px] font-normal text-slate-500">
                Tampilkan di daftar prioritas utama sekarang agar langsung dikerjakan.
              </p>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
            >
              {initialTask ? 'Simpan Perubahan' : 'Tambahkan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
