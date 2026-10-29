import { Task, Course } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Pemrograman Web',
    code: 'IF3101',
    lecturer: 'Dr. Ir. Budi Santoso, M.T.',
    color: '#3b82f6',
    dayOfWeek: 1, // Senin
    time: '08:00 - 10:30',
    room: 'Lab Komputer 3',
  },
  {
    id: 'c2',
    name: 'Basis Data Lanjutan',
    code: 'IF3102',
    lecturer: 'Siti Rahmawati, S.Kom., M.Cs.',
    color: '#10b981',
    dayOfWeek: 2, // Selasa
    time: '10:45 - 13:15',
    room: 'R. 402 Gedung FTI',
  },
  {
    id: 'c3',
    name: 'Rekayasa Perangkat Lunak',
    code: 'IF3105',
    lecturer: 'Ahmad Fauzi, M.Kom.',
    color: '#6366f1',
    dayOfWeek: 3, // Rabu
    time: '13:30 - 16:00',
    room: 'R. 301 Gedung FTI',
  },
  {
    id: 'c4',
    name: 'Jaringan Komputer',
    code: 'IF3104',
    lecturer: 'Hendra Gunawan, M.T.',
    color: '#f59e0b',
    dayOfWeek: 4, // Kamis
    time: '08:00 - 10:30',
    room: 'Lab Cisco & Jaringan',
  },
  {
    id: 'c5',
    name: 'Kecerdasan Buatan',
    code: 'IF3103',
    lecturer: 'Prof. Dewi Lestari, Ph.D.',
    color: '#8b5cf6',
    dayOfWeek: 5, // Jumat
    time: '09:00 - 11:30',
    room: 'Auditorium FTI',
  },
];

export function getInitialTasks(): Task[] {
  const now = new Date();
  
  // Format local ISO string for YYYY-MM-DDTHH:mm
  const formatOffsetDate = (daysOffset: number, hours: number, minutes: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hours)}:${pad(minutes)}`;
  };

  return [
    {
      id: 'task-1',
      courseId: 'c2',
      courseName: 'Basis Data Lanjutan',
      courseColor: '#10b981',
      title: 'Tugas Praktikum 4: Optimasi Query & Indeks',
      description: 'Lakukan analisis EXPLAIN query SELECT dengan join 3 tabel relasional, buat indeks B-Tree dan catat perbandingan latency eksekusinya.',
      type: 'Praktikum',
      dueDate: formatOffsetDate(0, 23, 59), // Hari ini 23:59!
      priority: 'Tinggi',
      estimatedMinutes: 90,
      isCompleted: false,
      workedToday: true,
      submissionPlatform: 'Moodle/LMS Kampus',
      subtasks: [
        { id: 'st-1', title: 'Import dataset e-commerce 100k baris ke PostgreSQL', completed: true },
        { id: 'st-2', title: 'Tulis query agregasi penjualan per kategori', completed: true },
        { id: 'st-3', title: 'Screenshot hasil EXPLAIN ANALYZE sebelum dan sesudah indeks', completed: false },
        { id: 'st-4', title: 'Tulis kesimpulan format PDF dan upload ke LMS', completed: false },
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      courseId: 'c3',
      courseName: 'Rekayasa Perangkat Lunak',
      courseColor: '#6366f1',
      title: 'Presentasi Progress Sprint 1: DeadlineKuliah',
      description: 'Siapkan slide presentasi 10 menit bersama kelompok: demo UI prototype, backlog sprint 2, dan arsitektur database.',
      type: 'Presentasi',
      dueDate: formatOffsetDate(1, 14, 0), // Besok siang!
      priority: 'Tinggi',
      estimatedMinutes: 60,
      isCompleted: false,
      workedToday: true,
      submissionPlatform: 'Siam / Portal Akademik',
      subtasks: [
        { id: 'st-5', title: 'Finalisasi slide deck di Google Slides', completed: true },
        { id: 'st-6', title: 'Latihan transisi pembicara kelompok', completed: false },
      ],
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      courseId: 'c1',
      courseName: 'Pemrograman Web',
      courseColor: '#3b82f6',
      title: 'Tugas Akhir: Desain Wireframe & Layout PWA Mahasiswa',
      description: 'Buat wireframe interaktif di Figma, pastikan support mobile view 390px dan responsif desktop. Cantumkan link Figma di tugas.',
      type: 'Tugas',
      dueDate: formatOffsetDate(-1, 23, 59), // Terlewat 1 hari (Overdue sample)
      priority: 'Tinggi',
      estimatedMinutes: 120,
      isCompleted: false,
      workedToday: true,
      submissionPlatform: 'Google Classroom',
      subtasks: [
        { id: 'st-7', title: 'Riset warna dan tipografi ramah mata', completed: true },
        { id: 'st-8', title: 'Desain card tugas dan navbar mobile', completed: false },
      ],
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'task-4',
      courseId: 'c4',
      courseName: 'Jaringan Komputer',
      courseColor: '#f59e0b',
      title: 'Laporan Subnetting VLSM & OSPF Routing',
      description: 'Konfigurasi topologi dengan 3 router dan 4 switch di Cisco Packet Tracer. Simpan file .pkt dan file PDF laporan.',
      type: 'Tugas',
      dueDate: formatOffsetDate(3, 17, 0), // 3 hari lagi
      priority: 'Sedang',
      estimatedMinutes: 90,
      isCompleted: false,
      workedToday: false,
      submissionPlatform: 'Google Classroom',
      subtasks: [
        { id: 'st-9', title: 'Hitung subnet mask VLSM tiap departemen', completed: true },
        { id: 'st-10', title: 'Konfigurasi IP address dan router OSPF', completed: false },
        { id: 'st-11', title: 'Uji ping antar workstation dan catat rute', completed: false },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      courseId: 'c5',
      courseName: 'Kecerdasan Buatan',
      courseColor: '#8b5cf6',
      title: 'Ujian Tengah Semester (UTS): Teori & Algoritma Heuristik',
      description: 'UTS Tertulis materi A* Search, Minimax Alpha-Beta Pruning, dan Dasar Machine Learning supervised vs unsupervised.',
      type: 'Ujian',
      dueDate: formatOffsetDate(6, 9, 0), // 6 hari lagi
      priority: 'Tinggi',
      estimatedMinutes: 120,
      isCompleted: false,
      workedToday: false,
      submissionPlatform: 'Hardcopy / Cetak',
      subtasks: [
        { id: 'st-12', title: 'Review catatan kuliah bab 1-6', completed: false },
        { id: 'st-13', title: 'Kerjakan contoh soal tree search A*', completed: false },
      ],
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      courseId: 'c1',
      courseName: 'Pemrograman Web',
      courseColor: '#3b82f6',
      title: 'Latihan 1: Instalasi Node.js dan Vite React Starter',
      description: 'Setup repository git dan install environment development.',
      type: 'Tugas',
      dueDate: formatOffsetDate(-3, 23, 59),
      priority: 'Rendah',
      estimatedMinutes: 30,
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      workedToday: false,
      submissionPlatform: 'Google Classroom',
      subtasks: [],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];
}
