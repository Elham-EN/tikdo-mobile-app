// Initialises the single MMKV instance used across the app.
// Provides helpers to load and save the tasks array to phone storage
// so data survives app restarts.

import { tasks as defaultTasks } from "@/data/data";
import { TaskItem } from "@/types/todoItem.types";
import { createMMKV } from "react-native-mmkv";

// The single MMKV storage instance for the whole app.
// All reads/writes are synchronous — no async/await needed.
export const storage = createMMKV({ id: "tikdo-storage" });

// Key under which the tasks array is stored as a JSON string.
const TASKS_KEY = "tasks";

/**
 * Loads the persisted tasks array from MMKV.
 * Returns the default seed data if nothing has been saved yet,
 * so first-time users always see example tasks.
 */
export function loadTasks(): TaskItem[] {
  // Read the raw JSON string from storage — undefined if key doesn't exist
  const raw = storage.getString(TASKS_KEY);

  if (!raw) {
    // First launch: no data yet, return the seed tasks from data.ts
    return defaultTasks;
  }

  // Parse the stored JSON back to a TaskItem array
  return JSON.parse(raw) as TaskItem[];
}

/**
 * Saves the full tasks array to MMKV as a JSON string.
 * Called whenever tasks change so the latest state is always persisted.
 */
export function saveTasks(tasks: TaskItem[]): void {
  // Serialise the array to a JSON string and write it to storage
  storage.set(TASKS_KEY, JSON.stringify(tasks));
}
