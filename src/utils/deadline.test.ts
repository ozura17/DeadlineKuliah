import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUrgency, getTodayTasks, sortTasks, calculateStats } from './deadline';
import { Task } from '../types';

test('calculateUrgency correctly identifies overdue tasks', () => {
  const refDate = new Date('2026-10-29T12:00:00Z');
  const pastDate = '2026-10-28T12:00:00Z'; // 1 day past

  const result = calculateUrgency(pastDate, refDate);
  assert.equal(result.isOverdue, true);
  assert.equal(result.urgencyLevel, 'overdue');
  assert.match(result.badgeText, /Terlewat/);
});

test('calculateUrgency correctly identifies tasks due today', () => {
  const refDate = new Date('2026-10-29T08:00:00');
  const laterToday = '2026-10-29T18:00:00';

  const result = calculateUrgency(laterToday, refDate);
  assert.equal(result.isOverdue, false);
  assert.equal(result.isToday, true);
  assert.equal(result.urgencyLevel, 'critical');
  assert.match(result.badgeText, /Hari Ini/);
});

test('calculateUrgency correctly identifies tasks due tomorrow', () => {
  const refDate = new Date('2026-10-29T10:00:00');
  const tomorrow = '2026-10-30T10:00:00';

  const result = calculateUrgency(tomorrow, refDate);
  assert.equal(result.isTomorrow, true);
  assert.equal(result.badgeText, 'Besok');
});

test('getTodayTasks filters and prioritizes urgent tasks for Kerjakan Hari Ini', () => {
  const refDate = new Date('2026-10-29T10:00:00');

  const tasks: Task[] = [
    {
      id: '1',
      courseId: 'c1',
      courseName: 'Kalkulus',
      courseColor: '#3b82f6',
      title: 'Tugas Bab 4',
      type: 'Tugas',
      dueDate: '2026-10-29T23:59:00', // Today
      priority: 'Sedang',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Google Classroom',
      createdAt: '2026-10-25T10:00:00',
    },
    {
      id: '2',
      courseId: 'c2',
      courseName: 'Algoritma',
      courseColor: '#ef4444',
      title: 'Kuis Struktur Data',
      type: 'Kuis',
      dueDate: '2026-11-05T10:00:00', // Far in future
      priority: 'Rendah',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Moodle/LMS Kampus',
      createdAt: '2026-10-25T10:00:00',
    },
    {
      id: '3',
      courseId: 'c3',
      courseName: 'Basis Data',
      courseColor: '#10b981',
      title: 'Laporan ERD',
      type: 'Praktikum',
      dueDate: '2026-10-28T23:59:00', // Overdue!
      priority: 'Tinggi',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Email Dosen',
      createdAt: '2026-10-20T10:00:00',
    },
    {
      id: '4',
      courseId: 'c4',
      courseName: 'Jaringan Komputer',
      courseColor: '#8b5cf6',
      title: 'Tugas Packet Tracer',
      type: 'Tugas',
      dueDate: '2026-11-04T10:00:00',
      priority: 'Sedang',
      isCompleted: false,
      workedToday: true, // Manually pinned to Kerjakan Hari Ini
      subtasks: [],
      submissionPlatform: 'Google Classroom',
      createdAt: '2026-10-25T10:00:00',
    },
    {
      id: '5',
      courseId: 'c1',
      courseName: 'Kalkulus',
      courseColor: '#3b82f6',
      title: 'Latihan 1 Selesai',
      type: 'Tugas',
      dueDate: '2026-10-29T12:00:00',
      priority: 'Tinggi',
      isCompleted: true, // Already completed - should be ignored
      subtasks: [],
      submissionPlatform: 'Google Classroom',
      createdAt: '2026-10-25T10:00:00',
    },
  ];

  const todayList = getTodayTasks(tasks, refDate);

  // Expected items: Overdue (id 3), Today (id 1), Pinned (id 4). NOT id 2 (next week) and NOT id 5 (completed).
  assert.equal(todayList.length, 3);

  // Overdue item must be prioritized at the very top!
  assert.equal(todayList[0].id, '3');
  assert.equal(todayList.some((t) => t.id === '1'), true);
  assert.equal(todayList.some((t) => t.id === '4'), true);
  assert.equal(todayList.some((t) => t.id === '2'), false);
  assert.equal(todayList.some((t) => t.id === '5'), false);
});

test('sortTasks sorts tasks by deadline nearest first', () => {
  const tasks: Task[] = [
    {
      id: '1',
      courseId: 'c1',
      courseName: 'Kalkulus',
      courseColor: '#3b82f6',
      title: 'Tugas 1',
      type: 'Tugas',
      dueDate: '2026-11-02T10:00:00',
      priority: 'Sedang',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Google Classroom',
      createdAt: '2026-10-25T10:00:00',
    },
    {
      id: '2',
      courseId: 'c2',
      courseName: 'Algoritma',
      courseColor: '#ef4444',
      title: 'Tugas 2',
      type: 'Tugas',
      dueDate: '2026-10-30T10:00:00', // Earlier!
      priority: 'Tinggi',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Moodle/LMS Kampus',
      createdAt: '2026-10-25T10:00:00',
    },
  ];

  const sorted = sortTasks(tasks, 'deadline', true);
  assert.equal(sorted[0].id, '2');
  assert.equal(sorted[1].id, '1');
});

test('calculateStats produces accurate overview metrics', () => {
  const refDate = new Date('2026-10-29T10:00:00');
  const tasks: Task[] = [
    {
      id: '1',
      courseId: 'c1',
      courseName: 'Kalkulus',
      courseColor: '#3b82f6',
      title: 'Tugas Selesai',
      type: 'Tugas',
      dueDate: '2026-10-29T10:00:00',
      priority: 'Sedang',
      isCompleted: true,
      subtasks: [],
      submissionPlatform: 'Google Classroom',
      createdAt: '2026-10-25T10:00:00',
    },
    {
      id: '2',
      courseId: 'c2',
      courseName: 'Algoritma',
      courseColor: '#ef4444',
      title: 'Tugas Hari Ini',
      type: 'Tugas',
      dueDate: '2026-10-29T20:00:00',
      priority: 'Tinggi',
      isCompleted: false,
      subtasks: [],
      submissionPlatform: 'Moodle/LMS Kampus',
      createdAt: '2026-10-25T10:00:00',
    },
  ];

  const stats = calculateStats(tasks, refDate);
  assert.equal(stats.total, 2);
  assert.equal(stats.completed, 1);
  assert.equal(stats.active, 1);
  assert.equal(stats.dueToday, 1);
  assert.equal(stats.completionRate, 50);
});
