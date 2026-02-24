// DragContext — owns all shared drag state (shared values) and the layout registry.
// Every component reads from and writes to these values during a drag.
// Generic over T so users can extend DragItem with their own fields.
// Also owns the pending-drop intercept so drops to the Today list can be
// confirmed with scheduling data before being committed to state.
import { DragItem, ItemLayout, ListLayout } from "@/types/dnd.types";
import { TaskItem } from "@/types/todoItem.types";
import * as React from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef, useSharedValue } from "react-native-reanimated";

// The listId of the "Today" list — drops to this list are intercepted for scheduling
const TODAY_LIST_ID = "listToday002";

// Holds the four drop parameters saved when a Today drop is intercepted.
// Stored until the user confirms or cancels the scheduling sheet.
type PendingDrop = {
  sourceTaskId: string; // The task being moved
  sourceListId: string; // Where it came from
  targetListId: string; // Always the Today list when pending
  targetSlot: string; // hitTest slot key: taskId to insert before, or "end:<listId>"
};

// Everything the drag engine and child components need, passed via context
export type DragContextValue = {
  // --- Drag identity ---
  isDragging: ReturnType<typeof useSharedValue<boolean>>;
  draggedTaskId: ReturnType<typeof useSharedValue<string | null>>;
  draggedFromListId: ReturnType<typeof useSharedValue<string | null>>;

  // --- Ghost position (absolute screen coordinates) ---
  ghostX: ReturnType<typeof useSharedValue<number>>;
  ghostY: ReturnType<typeof useSharedValue<number>>;
  ghostOriginX: ReturnType<typeof useSharedValue<number>>;
  ghostOriginY: ReturnType<typeof useSharedValue<number>>;
  ghostHeight: ReturnType<typeof useSharedValue<number>>;
  ghostWidth: ReturnType<typeof useSharedValue<number>>;

  // --- Drop target tracking ---
  activeDropListId: ReturnType<typeof useSharedValue<string | null>>;
  // Slot key: taskId of the item the dragged item will land BEFORE,
  // or "end:<listId>" when dropping after the last item.
  // Stored as a string so InsertionLine can match by item identity,
  // not by fragile index arithmetic that breaks as list order changes.
  activeDropSlot: ReturnType<typeof useSharedValue<string>>;

  // --- ScrollView control ---
  scrollEnabled: ReturnType<typeof useSharedValue<boolean>>;
  scrollViewRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  currentScrollY: ReturnType<typeof useSharedValue<number>>;

  // --- Layout registry (updated by each DragItem and DragList on layout) ---
  itemLayouts: ReturnType<typeof useSharedValue<ItemLayout[]>>;
  listLayouts: ReturnType<typeof useSharedValue<ListLayout[]>>;

  // --- Ghost content (title/description to render inside the ghost) ---
  ghostTitle: ReturnType<typeof useSharedValue<string>>;
  ghostDescription: ReturnType<typeof useSharedValue<string>>;

  // --- State commit — called from RN thread after drop animation completes ---
  commitDrop: (
    sourceTaskId: string,
    sourceListId: string,
    targetListId: string,
    // Slot key set by hitTest: taskId of the item to insert BEFORE,
    // or "end:<listId>" when inserting after the last item.
    targetSlot: string,
  ) => void;

  // --- Today drop scheduling intercept ---
  // The drop that is awaiting scheduling confirmation; null when no drop is pending.
  // Non-null means the scheduling sheet should be open.
  pendingDrop: PendingDrop | null;

  // Finalises a pending drop by applying edited text + scheduling fields and running the state mutation.
  // Called by TodayScheduleSheet when the user presses Confirm.
  confirmPendingDrop: (
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: TaskItem["timeSlot"],
  ) => void;

  // Discards the pending drop — no state changes, task stays in its original list.
  // Called by TodayScheduleSheet on Cancel or backdrop tap.
  cancelPendingDrop: () => void;
};

// The context — undefined until the provider mounts
const DragContext = React.createContext<DragContextValue | undefined>(
  undefined,
);

// Props for the provider — generic so users can pass their own extended DragItem type
type DragProviderProps<T extends DragItem> = {
  children: React.ReactNode;
  setTasks: React.Dispatch<React.SetStateAction<T[]>>;
  // Optional callback fired when a drop to Today is intercepted.
  // Parent uses this signal to open the scheduling sheet.
  onTodayDropPending?: () => void;
};

/**
 * DragProvider wraps the whole screen and creates all shared values.
 * Pass setTasks down so commitDrop can update React state after a drop.
 * Generic over T so the setTasks updater can work with extended item types.
 * Pass onTodayDropPending to be notified when a Today drop needs scheduling.
 */
export function DragProvider<T extends DragItem>({
  children,
  setTasks,
  onTodayDropPending,
}: DragProviderProps<T>) {
  // --- Drag identity ---
  const isDragging = useSharedValue(false);
  const draggedTaskId = useSharedValue<string | null>(null);
  const draggedFromListId = useSharedValue<string | null>(null);

  // --- Ghost absolute position on screen ---
  const ghostX = useSharedValue(0);
  const ghostY = useSharedValue(0);
  const ghostOriginX = useSharedValue(0);
  const ghostOriginY = useSharedValue(0);
  const ghostHeight = useSharedValue(0);
  const ghostWidth = useSharedValue(0);

  // --- Drop target ---
  const activeDropListId = useSharedValue<string | null>(null);
  // Empty string = no active drop slot
  const activeDropSlot = useSharedValue("");

  // --- ScrollView ---
  const scrollEnabled = useSharedValue(true);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const currentScrollY = useSharedValue(0);

  // --- Layout registry ---
  const itemLayouts = useSharedValue<ItemLayout[]>([]);
  const listLayouts = useSharedValue<ListLayout[]>([]);

  // --- Ghost display content ---
  const ghostTitle = useSharedValue("");
  const ghostDescription = useSharedValue("");

  // Holds the intercepted Today drop until the user confirms or cancels scheduling.
  // null = no pending drop; non-null = scheduling sheet should be visible.
  const [pendingDrop, setPendingDrop] = React.useState<PendingDrop | null>(
    null,
  );

  /**
   * Executes the actual tasks state mutation for a completed drop.
   * Extracted from commitDrop so confirmPendingDrop can call it separately
   * after the user has provided scheduling data.
   *
   * Uses the .order field (React state) as the source of truth for item ordering.
   * The targetSlot (taskId or "end:<listId>") was computed by hitTest on the UI thread
   * and identifies which item to insert before.
   *
   * An optional schedulingPatch is applied to the moved task when moving to Today,
   * saving the user's chosen scheduledTime and timeSlot directly onto the task.
   */
  function executeCommit(
    sourceTaskId: string,
    sourceListId: string,
    targetListId: string,
    // Slot key from hitTest: taskId of item to insert BEFORE, or "end:<listId>"
    targetSlot: string,
    // Optional patch applied to the moved task — only used for Today drops.
    // Includes edited title/description and the user's scheduling choice.
    todayPatch?: {
      title: string;
      description: string;
      scheduledTime: string | null;
      timeSlot: TaskItem["timeSlot"];
    },
  ) {
    setTasks((prevTasks) => {
      // Work on a shallow copy so we don't mutate state directly
      const updated = prevTasks.map((t) => ({ ...t }));

      // Sort tasks by their .order field — this is the canonical ordering
      // maintained by React state and always consistent with what was rendered.
      function byOrder(arr: typeof updated) {
        return arr.sort((a, b) => a.order - b.order);
      }

      if (sourceListId === targetListId) {
        // --- SAME-LIST REORDER ---
        // Get all tasks in the list except the dragged one, sorted by order
        const otherTasks = byOrder(
          updated.filter(
            (t) => t.listId === sourceListId && t.taskId !== sourceTaskId,
          ),
        );
        const dragged = updated.find((t) => t.taskId === sourceTaskId)!;

        // Find where to splice — the index of the item we insert before
        const isEnd = targetSlot === `end:${targetListId}`;
        const spliceAt = isEnd
          ? otherTasks.length
          : otherTasks.findIndex((t) => t.taskId === targetSlot);

        // If slot key is not found (stale reference), append at end
        const insertAt = spliceAt < 0 ? otherTasks.length : spliceAt;
        otherTasks.splice(insertAt, 0, dragged);

        // Write fresh sequential order values back to updated
        otherTasks.forEach((task, i) => {
          const idx = updated.findIndex((t) => t.taskId === task.taskId);
          updated[idx].order = i;
        });
      } else {
        // --- CROSS-LIST MOVE ---
        // 1. Move the dragged task to the target list
        const draggedGlobalIdx = updated.findIndex(
          (t) => t.taskId === sourceTaskId,
        );
        updated[draggedGlobalIdx].listId = targetListId;

        // Apply edited text and scheduling metadata if provided (only for Today drops)
        if (todayPatch) {
          const task = updated[draggedGlobalIdx] as TaskItem;
          task.title = todayPatch.title; // User may have edited the title
          task.description = todayPatch.description; // User may have edited the description
          task.scheduledTime = todayPatch.scheduledTime; // Chosen time or null for Anytime
          task.timeSlot = todayPatch.timeSlot; // Time-of-day bucket
        }

        // 2. Re-index the source list (dragged item is now gone from it)
        const sourceRemaining = byOrder(
          updated.filter((t) => t.listId === sourceListId),
        );
        sourceRemaining.forEach((task, i) => {
          const idx = updated.findIndex((t) => t.taskId === task.taskId);
          updated[idx].order = i;
        });

        // 3. Build the target list without the dragged item, splice it in at
        //    the slot hitTest identified, then assign fresh sequential order values
        const targetExisting = byOrder(
          updated.filter(
            (t) => t.listId === targetListId && t.taskId !== sourceTaskId,
          ),
        );

        const isEnd = targetSlot === `end:${targetListId}`;
        const spliceAt = isEnd
          ? targetExisting.length
          : targetExisting.findIndex((t) => t.taskId === targetSlot);

        // If targetSlot key not found (stale), append at end
        const insertAt = spliceAt < 0 ? targetExisting.length : spliceAt;
        targetExisting.splice(insertAt, 0, updated[draggedGlobalIdx]);

        targetExisting.forEach((task, i) => {
          const idx = updated.findIndex((t) => t.taskId === task.taskId);
          updated[idx].order = i;
        });
      }

      return updated;
    });
  }

  /**
   * Public drop entry point — called from the RN thread via scheduleOnRN after
   * the drop animation finishes in DragItemComponent.
   *
   * If the target is the Today list: intercepts the drop, saves it as pending,
   * and fires onTodayDropPending so the parent can open the scheduling sheet.
   * The actual state mutation is deferred until the user confirms.
   *
   * For all other lists: runs executeCommit immediately (existing behaviour).
   */
  function commitDrop(
    sourceTaskId: string,
    sourceListId: string,
    targetListId: string,
    targetSlot: string,
  ) {
    if (targetListId === TODAY_LIST_ID) {
      // Store drop parameters — the scheduling sheet will read them via pendingDrop
      setPendingDrop({ sourceTaskId, sourceListId, targetListId, targetSlot });
      // Notify the parent to open the scheduling sheet
      onTodayDropPending?.();
      return; // Do NOT commit yet — wait for the user's scheduling choice
    }
    // Non-Today drop: commit immediately with no scheduling data
    executeCommit(sourceTaskId, sourceListId, targetListId, targetSlot);
  }

  /**
   * Finalises a pending Today drop with edited text and scheduling data.
   * Runs executeCommit with the saved pending parameters plus the today patch,
   * then clears the pending state so the sheet closes.
   * Called by TodayScheduleSheet when the user presses Confirm.
   */
  function confirmPendingDrop(
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: TaskItem["timeSlot"],
  ) {
    if (!pendingDrop) return; // Guard: nothing to confirm
    executeCommit(
      pendingDrop.sourceTaskId,
      pendingDrop.sourceListId,
      pendingDrop.targetListId,
      pendingDrop.targetSlot,
      { title, description, scheduledTime, timeSlot }, // Attach edited text + scheduling
    );
    setPendingDrop(null); // Clear pending drop — sheet will close
  }

  /**
   * Discards the pending drop without moving the task.
   * The task stays in its original list — no state mutation occurs.
   * Called by TodayScheduleSheet on Cancel or backdrop tap.
   */
  function cancelPendingDrop() {
    setPendingDrop(null); // Clear pending drop — sheet will close
  }

  // All shared values and functions bundled into a single context value
  const value: DragContextValue = {
    isDragging,
    draggedTaskId,
    draggedFromListId,
    ghostX,
    ghostY,
    ghostOriginX,
    ghostOriginY,
    ghostHeight,
    ghostWidth,
    activeDropListId,
    activeDropSlot,
    scrollEnabled,
    scrollViewRef,
    currentScrollY,
    itemLayouts,
    listLayouts,
    ghostTitle,
    ghostDescription,
    commitDrop,
    pendingDrop,
    confirmPendingDrop,
    cancelPendingDrop,
  };

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}

/**
 * useDragContext — consume the drag context from any child component.
 * Throws if used outside of DragProvider.
 */
export function useDragContext(): DragContextValue {
  const ctx = React.useContext(DragContext);
  if (!ctx) {
    throw new Error("useDragContext must be used inside DragProvider");
  }
  return ctx;
}
