// Today tab — shows all tasks in the Today list split into four time sections:
// Anytime, Morning, Afternoon, and Evening. Each section is a collapsible DragList
// so the styling matches the Inbox screen exactly. Tasks are read from and written
// back to the same MMKV storage so changes persist across tab switches.

import { DragGhost, DragList, DragScrollView } from "@/components/Drag";
import TodayScheduleSheet, { TimeRange } from "@/components/ui/TodayScheduleSheet";
import { DragProvider, useDragContext } from "@/contexts/DragContext";
import { loadTasks, saveTasks, storage } from "@/storage/storage";
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

// Maps a section ID to the hour range the time picker should be restricted to.
// Returns undefined for Anytime (no restriction) or unknown section IDs.
// Hours are in 24-hour format: morning = 5–11, afternoon = 12–16, evening = 17–23.
function sectionTimeRange(sectionId: string | null): TimeRange | undefined {
  switch (sectionId) {
    case SECTION_IDS.morning:
      return { startHour: 5, endHour: 11 }; // 5:00 AM – 11:59 AM
    case SECTION_IDS.afternoon:
      return { startHour: 12, endHour: 16 }; // 12:00 PM – 4:59 PM
    case SECTION_IDS.evening:
      return { startHour: 17, endHour: 23 }; // 5:00 PM – 11:59 PM
    default:
      return undefined; // Anytime or no section — picker unrestricted
  }
}

// ─── TodayContent ─────────────────────────────────────────────────────────────
// Inner component that renders the four DragList sections and the reschedule sheet.
// Sits inside DragProvider so it can call useDragContext().

interface TodayContentProps {
  tasks: TaskItem[]; // All tasks — filtered per section below
  isSheetVisible: boolean; // Whether the reschedule sheet is open
  targetSectionId: string | null; // Which section the pending drop targets
  onSheetClose: () => void; // Called when the sheet should close
}

function TodayContent({
  tasks,
  isSheetVisible,
  targetSectionId,
  onSheetClose,
}: TodayContentProps): React.ReactElement {
  const insets = useSafeAreaInsets(); // Safe area for notch / home indicator
  const { pendingDrop, confirmPendingDrop, cancelPendingDrop } =
    useDragContext();

  // Look up the pending task so we can pre-fill title/description in the sheet
  const pendingTask = pendingDrop
    ? tasks.find((t) => t.taskId === pendingDrop.sourceTaskId) ?? null
    : null;

  // Determine chip pre-selection based on which section the task is being moved to.
  // Morning/Afternoon/Evening → pre-select "picktime" so user picks a time in that range.
  // Anytime → "anytime" (but the sheet won't open for Anytime drops anyway).
  const defaultSelection: "anytime" | "picktime" =
    targetSectionId === SECTION_IDS.anytime ? "anytime" : "picktime";

  /**
   * Confirm handler — forwards edited text and scheduling data to DragContext
   * to finalise the section move, then closes the sheet.
   */
  function handleConfirm(
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: "anytime" | "morning" | "afternoon" | "evening",
  ) {
    confirmPendingDrop(title, description, scheduledTime, timeSlot);
    onSheetClose();
  }

  /**
   * Cancel handler — discards the pending section move so the task stays put,
   * then closes the sheet.
   */
  function handleCancel() {
    cancelPendingDrop();
    onSheetClose();
  }

  // Filter Today tasks by timeSlot for each section, sorted by order
  function getSection(
    slot: "anytime" | "morning" | "afternoon" | "evening",
  ): TaskItem[] {
    return tasks
      .filter((t) => t.listId === TODAY_LIST_ID && t.timeSlot === slot)
      .sort((a, b) => a.order - b.order);
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

      {/* Reschedule sheet — opens when a task is dragged between timed sections.
          timeRange constrains the picker to the target section's valid hours. */}
      <TodayScheduleSheet
        visible={isSheetVisible}
        taskTitle={pendingTask?.title ?? ""}
        taskDescription={pendingTask?.description ?? ""}
        defaultSelection={defaultSelection}
        timeRange={sectionTimeRange(targetSectionId)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
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

  // Whether the reschedule sheet is open
  const [isSheetVisible, setIsSheetVisible] = React.useState(false);

  // The target section ID that triggered the pending drop — used to pre-select
  // the correct chip in the sheet (picktime for Morning/Afternoon/Evening)
  const [targetSectionId, setTargetSectionId] = React.useState<string | null>(
    null,
  );

  // Subscribe to MMKV "tasks" key changes so this tab stays in sync with the
  // Inbox tab. Fires immediately on mount (initial load) and again whenever
  // the Inbox tab writes new tasks — e.g. after a Today drop is confirmed.
  React.useEffect(() => {
    setTasks(loadTasks()); // Load on mount in case the key was written before the listener attached

    // addOnValueChangedListener fires whenever storage.set("tasks", ...) is called
    const subscription = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === "tasks") {
        setTasks(loadTasks()); // Re-read the full tasks array from MMKV
      }
    });

    return () => subscription.remove(); // Clean up listener on unmount
  }, []);

  /**
   * Persists task mutations back to MMKV.
   * Called by DragProvider on every reorder or cross-section commit.
   */
  function persistTasks(
    updater: TaskItem[] | ((prev: TaskItem[]) => TaskItem[]),
  ): void {
    setTasks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTasks(next);
      return next;
    });
  }

  /**
   * Called by DragProvider when a task is dragged from one timed section to another.
   * Saves which section was targeted then opens the reschedule sheet.
   */
  function handleSectionDropPending(sectionId: string) {
    setTargetSectionId(sectionId); // Remember target so TodayContent can read it
    setIsSheetVisible(true); // Open the reschedule sheet
  }

  return (
    <DragProvider setTasks={persistTasks} onSectionDropPending={handleSectionDropPending}>
      <TodayContent
        tasks={tasks}
        isSheetVisible={isSheetVisible}
        targetSectionId={targetSectionId}
        onSheetClose={() => setIsSheetVisible(false)}
      />
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
