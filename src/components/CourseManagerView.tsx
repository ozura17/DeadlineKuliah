import React, { useState } from 'react';
import { Course, Task } from '../types';
import { BookOpen, Plus, Trash2, Edit2, Calendar, MapPin, User, Check, X } from 'lucide-react';

interface CourseManagerViewProps {
  courses: Course[];
  tasks: Task[];
  onAddCourse: (newCourse: Course) => void;
  onUpdateCourse: (updatedCourse: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onSelectCourseFilter: (courseId: string) => void;
}

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

const DAYS_OF_WEEK = [
  { val: 1, label: 'Senin' },
  { val: 2, label: 'Selasa' },
  { val: 3, label: 'Rabu' },
  { val: 4, label: 'Kamis' },
  { val: 5, label: 'Jumat' },
  { val: 6, label: 'Sabtu' },
];

export const CourseManagerView: React.FC<CourseManagerViewProps> = ({
  courses,
  tasks,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onSelectCourseFilter,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [color, setColor] = useState(COURSE_COLORS[0]);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setName('');
    setCode('');
    setLecturer('');
    setColor(COURSE_COLORS[courses.length % COURSE_COLORS.length]);
    setDayOfWeek(1);
    setTime('');
    setRoom('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setLecturer(course.lecturer || '');
    setColor(course.color);
    setDayOfWeek(course.dayOfWeek || 1);
    setTime(course.time || '');
    setRoom(course.room || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCourse) {
      onUpdateCourse({
        ...editingCourse,
        name: name.trim(),
        code: code.trim() || editingCourse.code,
        lecturer: lecturer.trim() || undefined,
        color,
        dayOfWeek,
        time: time.trim() || undefined,
        room: room.trim() || undefined,
      });
    } else {
      const newCourse: Course = {
        id: 'c-' + Date.now(),
        name: name.trim(),
        code: code.trim() || 'MK' + Math.floor(100 + Math.random() * 900),
        lecturer: lecturer.trim() || undefined,
        color,
        dayOfWeek,
        time: time.trim() || undefined,
        room: room.trim() || undefined,
      };
      onAddCourse(newCourse);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Course Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mata Kuliah & Jadwal</h2>
          <p className="text-xs text-slate-500">
            Kelola daftar mata kuliah, dosen pengampu, dan pantau jumlah tugas per matkul
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 font-semibold text-white text-xs sm:text-sm shadow-md hover:bg-indigo-700 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const courseTasks = tasks.filter((t) => t.courseId === course.id);
          const activeTasksCount = courseTasks.filter((t) => !t.isCompleted).length;
          const dayName = DAYS_OF_WEEK.find((d) => d.val === course.dayOfWeek)?.label;

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {course.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit matkul"
                      aria-label={`Edit ${course.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Hapus matkul"
                      aria-label={`Hapus ${course.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                  {course.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  {course.lecturer && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{course.lecturer}</span>
                    </div>
                  )}

                  {(dayName || course.time) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>
                        {dayName ? `${dayName}, ` : ''}
                        {course.time || 'Waktu belum diatur'}
                      </span>
                    </div>
                  )}

                  {course.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{course.room}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with task count and filter trigger */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {activeTasksCount > 0 ? (
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                      {activeTasksCount} tugas aktif
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Semua tugas tuntas
                    </span>
                  )}
                </span>

                <button
                  onClick={() => onSelectCourseFilter(course.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  Lihat Tugas →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Algoritma dan Pemrograman"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kode Matkul
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="cth: IF2101"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hari Kuliah
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.val} value={d.val}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dosen Pengampu
                </label>
                <input
                  type="text"
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                  placeholder="cth: Dr. Hendra, S.Kom., M.T."
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jam Kuliah
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="08:00 - 10:30"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ruang / Lab
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Lab 3 / R.402"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Warna Label
                </label>
                <div className="flex gap-2">
                  {COURSE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                        color === col ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {color === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
                >
                  Simpan Matkul
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
