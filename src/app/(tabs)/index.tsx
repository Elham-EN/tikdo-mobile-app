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

  return (
    <DragProvider setTasks={setTasks}>
      <InboxScreen tasks={tasks} />
    </DragProvider>
  );
}
