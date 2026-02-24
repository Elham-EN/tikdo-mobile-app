// Today tab — shows all tasks in the Today list split into four time sections:
// Anytime, Morning, Afternoon, and Evening. Each section is a collapsible DragList
// so the styling matches the Inbox screen exactly. Tasks are read from and written
// back to the same MMKV storage so changes persist across tab switches.

import { DragGhost, DragList, DragScrollView } from "@/components/Drag";
import { DragProvider } from "@/contexts/DragContext";
import { loadTasks, saveTasks } from "@/storage/storage";
import { TaskItem } from "@/types/todoItem.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// The listId for the Today list — must match the value in DragContext and index.tsx
const TODAY_LIST_ID = "listToday002";

// Virtual list IDs for each time section — used as the listId for each DragList.
// These are display-only groupings; the actual task.listId is always TODAY_LIST_ID.
// We use separate IDs so the drag engine treats each section as its own drop target.
const SECTION_IDS = {
  anytime: "todaySection_anytime",
  morning: "todaySection_morning",
  afternoon: "todaySection_afternoon",
  evening: "todaySection_evening",
} as const;

// ─── TodayContent ─────────────────────────────────────────────────────────────
// Inner component that renders the four DragList sections.
// Sits inside DragProvider so it can read/write drag context.

interface TodayContentProps {
  tasks: TaskItem[]; // All tasks — will be filtered per section below
}

function TodayContent({ tasks }: TodayContentProps): React.ReactElement {
  const insets = useSafeAreaInsets(); // Safe area for notch / home indicator

  // Filter Today tasks by timeSlot for each section, sorted by order
  // Tasks with timeSlot undefined are not in Today and are excluded entirely
  function getSection(
    slot: "anytime" | "morning" | "afternoon" | "evening",
  ): TaskItem[] {
    return tasks
      .filter((t) => t.listId === TODAY_LIST_ID && t.timeSlot === slot)
      .sort((a, b) => a.order - b.order); // Keep user-defined order within section
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Screen title */}
      <Text style={styles.header}>Today</Text>

      {/* DragScrollView wires scrollViewRef and scroll tracking from drag context */}
      <DragScrollView
        contentContainerStyle={{ paddingBottom: 49 + insets.bottom + 32 }}
      >
        {/* Anytime section — tasks with no specific time */}
        <DragList
          listId={SECTION_IDS.anytime}
          listName="Anytime"
          listIconLeft={<Ionicons name="infinite-outline" size={24} />}
          tasks={getSection("anytime")}
        />

        {/* Morning section — tasks scheduled 5:00 AM – 11:59 AM */}
        <DragList
          listId={SECTION_IDS.morning}
          listName="Morning"
          listIconLeft={<Ionicons name="partly-sunny-outline" size={24} />}
          tasks={getSection("morning")}
        />

        {/* Afternoon section — tasks scheduled 12:00 PM – 4:59 PM */}
        <DragList
          listId={SECTION_IDS.afternoon}
          listName="Afternoon"
          listIconLeft={<Ionicons name="sunny-outline" size={24} />}
          tasks={getSection("afternoon")}
        />

        {/* Evening section — tasks scheduled 5:00 PM – 11:59 PM */}
        <DragList
          listId={SECTION_IDS.evening}
          listName="Evening"
          listIconLeft={<Ionicons name="moon-outline" size={24} />}
          tasks={getSection("evening")}
        />
      </DragScrollView>

      {/* Ghost floats above everything during a drag */}
      <DragGhost />
    </View>
  );
}

// ─── Today (root export) ──────────────────────────────────────────────────────
// Loads tasks from MMKV, wraps content in its own DragProvider so reordering
// within sections works and persists. Uses the same saveTasks helper as the
// Inbox tab so both tabs always read from the same source of truth.

export default function Today(): React.ReactElement {
  // Load tasks from MMKV on mount — same store as the Inbox tab
  const [tasks, setTasks] = React.useState<TaskItem[]>(() => loadTasks());

  // Reload tasks whenever the screen comes into focus so changes made on the
  // Inbox tab (drag to Today, new tasks) are reflected here immediately.
  // Using a focus listener would require navigation context; instead we reload
  // on every render cycle via a simple interval check is overkill — the simplest
  // correct approach is to reload on mount + expose a manual refresh via state.
  // For now, reload on mount. A future improvement could use a shared store.
  React.useEffect(() => {
    setTasks(loadTasks()); // Re-read MMKV when the component mounts / tab is focused
  }, []);

  /**
   * Persists task mutations back to MMKV.
   * Called by DragProvider when the user reorders tasks within a section.
   * We merge the updated Today tasks back into the full tasks array so
   * non-Today tasks (Inbox, Upcoming, etc.) are preserved.
   */
  function persistTasks(
    updater: TaskItem[] | ((prev: TaskItem[]) => TaskItem[]),
  ): void {
    setTasks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTasks(next); // Write merged array to MMKV
      return next;
    });
  }

  return (
    // Each tab gets its own DragProvider — they do not share drag state,
    // but both read/write the same MMKV store for task data.
    <DragProvider setTasks={persistTasks}>
      <TodayContent tasks={tasks} />
    </DragProvider>
  );
}

const styles = StyleSheet.create({
  // Full-screen container matching the Inbox screen background
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  // Screen title — same style as InboxScreen header
  header: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1C1C1E",
  },
});
