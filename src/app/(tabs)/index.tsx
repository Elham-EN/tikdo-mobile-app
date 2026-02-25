// Home screen (Inbox tab) that displays all todo lists in accordion format.
// Provides the main interface for viewing, organizing, and dragging todos between lists.
// Tasks are loaded from and saved to MMKV so they persist across app restarts.
// Intercepts drops to the Today list and opens a scheduling sheet before committing.
// Schedules a midnight timer to clear all Today tasks at the end of the day.

import { DragProvider } from "@/contexts/DragContext";
import InboxScreen from "@/screens/InboxScreen";
import { loadTasks, saveTasks, storage } from "@/storage/storage";
import { TaskItem } from "@/types/todoItem.types";
import React from "react";

// The listId for the Today list — tasks with this id are cleared at midnight
const TODAY_LIST_ID = "listToday002";

// ─── Index — root of the screen ──────────────────────
export default function Index(): React.ReactElement {
  // Initialise tasks from MMKV storage (falls back to seed data on first launch)
  const [tasks, setTasks] = React.useState<TaskItem[]>(() => loadTasks());

  // Whether the Today scheduling sheet is currently visible.
  // Flipped to true when DragProvider intercepts a drop onto the Today list.
  const [isScheduleSheetVisible, setIsScheduleSheetVisible] =
    React.useState(false);

  /**
   * Wraps setTasks so every update is also written to MMKV.
   * Any caller that mutates tasks (add, reorder, drag-drop) uses this
   * instead of raw setTasks, keeping phone storage always in sync.
   */
  function persistTasks(
    updater: TaskItem[] | ((prev: TaskItem[]) => TaskItem[]),
  ): void {
    // Support both a direct array and a functional updater — same signature as setState
    setTasks((prev) => {
      // Resolve the next state — either from the updater function or a direct value
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      // Write the new state to MMKV immediately so it survives app restarts
      saveTasks(next);
      return next;
    });
  }

  /**
   * Permanently removes a task by ID from the tasks array and persists the change.
   */
  function handleDeleteTask(taskId: string): void {
    persistTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  }

  /**
   * Saves edited title and description for an existing Inbox task.
   * Finds the task by ID and replaces its text fields, keeping everything else unchanged.
   */
  function handleEditTask(taskId: string, title: string, description: string): void {
    persistTasks((prev) =>
      prev.map((t) =>
        // Only update the matching task — leave all other tasks untouched
        t.taskId === taskId ? { ...t, title, description } : t,
      ),
    );
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
      // If the list has tasks, find the smallest order number among them;
      // otherwise default to 0 so the first item gets order -1 (top position)
      const minOrder =
        listTasks.length > 0
          ? Math.min(...listTasks.map((t) => t.order)) // Lowest existing order
          : 0;
      // Add the new task with order one below the minimum — places it at the top
      return [...prev, { ...task, order: minOrder - 1 }];
    });
  }

  /**
   * Called by DragProvider when a drop onto the Today list is intercepted.
   * Opens the scheduling sheet so the user can choose a time before the move commits.
   */
  function handleTodayDropPending() {
    setIsScheduleSheetVisible(true); // Show the scheduling sheet
  }

  // Subscribe to MMKV "tasks" key changes so this tab stays in sync with the
  // Today tab. Fires whenever the Today tab writes new tasks — e.g. after a
  // section move or reschedule is confirmed.
  React.useEffect(() => {
    const subscription = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === "tasks") {
        setTasks(loadTasks()); // Re-read the full tasks array from MMKV
      }
    });

    return () => subscription.remove(); // Clean up listener on unmount
  }, []);

  /**
   * Midnight clear — removes all tasks from the Today list at 12:00 AM.
   * Calculates the exact milliseconds until the next midnight and sets
   * a single timeout. The effect runs once on mount.
   */
  React.useEffect(() => {
    const now = new Date(); // Current date and time

    // Build a Date for tomorrow at exactly 00:00:00.000
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // +1 day advances the date to tomorrow
      0, 0, 0, 0, // Hours, minutes, seconds, milliseconds all zero = midnight
    );

    // How many milliseconds remain until midnight fires
    const delayMs = nextMidnight.getTime() - now.getTime();

    // Schedule the clear to run exactly at midnight
    const timer = setTimeout(() => {
      // Remove every task that belongs to the Today list and persist to MMKV
      persistTasks((prev) =>
        prev.filter((task) => task.listId !== TODAY_LIST_ID),
      );
    }, delayMs);

    // Clean up the timer if the component unmounts before midnight
    return () => clearTimeout(timer);
  }, []); // Empty deps — one timer per app session is sufficient

  return (
    // Pass persistTasks as setTasks so all drag-drop reorders also persist.
    // Pass handleTodayDropPending so DragProvider can signal us to open the sheet.
    <DragProvider
      setTasks={persistTasks}
      onTodayDropPending={handleTodayDropPending}
    >
      <InboxScreen
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        isScheduleSheetVisible={isScheduleSheetVisible}
        onScheduleSheetClose={() => setIsScheduleSheetVisible(false)} // Close the sheet
      />
    </DragProvider>
  );
}
