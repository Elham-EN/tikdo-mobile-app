// Home screen (Inbox tab) that displays all todo lists in accordion format.
// Provides the main interface for viewing, organizing, and dragging todos between lists.
// Tasks are loaded from and saved to MMKV so they persist across app restarts.

import { DragProvider } from "@/contexts/DragContext";
import { loadTasks, saveTasks } from "@/storage/storage";
import InboxScreen from "@/screens/InboxScreen";
import { TaskItem } from "@/types/todoItem.types";
import React from "react";

// ─── Index — root of the screen ──────────────────────
export default function Index(): React.ReactElement {
  // Initialise tasks from MMKV storage (falls back to seed data on first launch)
  const [tasks, setTasks] = React.useState<TaskItem[]>(() => loadTasks());

  /**
   * Wraps setTasks so every update is also written to MMKV.
   * Any caller that updates tasks (add, reorder via drag) uses this
   * instead of raw setTasks, keeping storage always in sync.
   */
  function persistTasks(
    updater: TaskItem[] | ((prev: TaskItem[]) => TaskItem[]),
  ): void {
    // Support both direct arrays and functional updaters (same signature as setState)
    setTasks((prev) => {
      // Resolve the new state — either from the updater function or a direct value
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      // Persist the new state to MMKV immediately after every update
      saveTasks(next);
      return next;
    });
  }

  /**
   * Adds a new task to the top of its target list.
   * Finds the lowest existing order in the list and assigns minOrder - 1
   * so the new task sorts above all others.
   */
  function handleAddTask(task: TaskItem): void {
    persistTasks((prev) => {
      // Get tasks belonging to the same list to find the current top order
      const listTasks = prev.filter((t) => t.listId === task.listId);
      // If the list has tasks, find the smallest order number among them
      // — otherwise default to 0
      const minOrder =
        listTasks.length > 0
          ? // Spread all order values and pick the lowest
            Math.min(...listTasks.map((t) => t.order))
          : 0;
      // Add the new task with order one less than the current minimum — so it sorts to the top
      return [...prev, { ...task, order: minOrder - 1 }];
    });
  }

  return (
    // Pass persistTasks instead of raw setTasks so drag-drop reorders also persist
    <DragProvider setTasks={persistTasks}>
      <InboxScreen tasks={tasks} onAddTask={handleAddTask} />
    </DragProvider>
  );
}
