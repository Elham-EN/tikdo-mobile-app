// Home screen (Inbox tab) that displays all todo lists in accordion format.
// Provides the main interface for viewing, organizing, and dragging todos between lists.

import { DragProvider } from "@/contexts/DragContext";
import { tasks as initialTasks } from "@/data/data";
import InboxScreen from "@/screens/InboxScreen";
import { TaskItem } from "@/types/todoItem.types";
import React from "react";

// ─── Index — root of the screen ──────────────────────
export default function Index(): React.ReactElement {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);

  /**
   * Adds a new task to the top of its target list.
   * Finds the lowest existing order in the list and assigns minOrder - 1
   * so the new task sorts above all others.
   */
  function handleAddTask(task: TaskItem): void {
    setTasks((prev) => {
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
    <DragProvider setTasks={setTasks}>
      <InboxScreen tasks={tasks} onAddTask={handleAddTask} />
    </DragProvider>
  );
}
