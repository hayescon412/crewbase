"use client";

import { useState, useEffect } from "react";

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export function useTasks(jobId: string, defaultTasks: string[]) {
  const key = `crewbase_tasks_${jobId}`;

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as Task[];
    return defaultTasks.map((text, i) => ({ id: `${jobId}_${i}`, text, done: false }));
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, key]);

  // Seed on first load
  useEffect(() => {
    if (!localStorage.getItem(key)) {
      const initial = defaultTasks.map((text, i) => ({
        id: `${jobId}_${i}`,
        text,
        done: false,
      }));
      localStorage.setItem(key, JSON.stringify(initial));
      setTasks(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask(text: string) {
    const task: Task = { id: `${jobId}_${Date.now()}`, text, done: false };
    setTasks((prev) => [...prev, task]);
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return { tasks, toggle, addTask, removeTask, doneCount };
}
