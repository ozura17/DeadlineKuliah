import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, X, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTimerModalProps {
  task: Task | null;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  task,
  onClose,
  onCompleteTask,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
    setIsActive(false);
  }, [durationMinutes, task]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Play web audio chime
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch {
        // audio might be blocked without user gesture
      }
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  if (!task) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: task.courseColor }}
            />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {task.courseName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Tutup focus timer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info */}
        <div className="px-6 mb-4">
          <h2 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
            {task.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Mode Fokus: Selesaikan tugas ini tanpa distraksi
          </p>
        </div>

        {/* Circular / Big Timer Display */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 border-y border-slate-100">
          <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-200"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                stroke="currentColor"
                strokeWidth="10"
                className="text-indigo-600 transition-all duration-500"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-slate-900">
                {formattedTime}
              </span>
              <span className="text-xs font-medium text-slate-400 mt-1">
                {isActive ? 'Sedang Fokus...' : secondsLeft === 0 ? 'Selesai!' : 'Siap Mulai'}
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex gap-2 mt-4">
            {[15, 25, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDurationMinutes(mins);
                  setIsActive(false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                  durationMinutes === mins
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mins} Menit
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Jeda
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Mulai Fokus
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsActive(false);
                setSecondsLeft(durationMinutes * 60);
              }}
              className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onCompleteTask(task.id);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tandai Tugas Sudah Selesai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
