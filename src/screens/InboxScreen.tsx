// InboxScreen — main home screen showing all todo lists in accordion format.
// Handles layout, list rendering, FAB placement, and scroll padding above the tab bar.
// Also wires the Today scheduling sheet: reads the pending drop from context,
// resolves the task data to show in the sheet, and forwards confirm/cancel to context.
// Wires the EditTaskSheet: tapping any item opens an inline edit sheet for that task.
import { DragGhost, DragList, DragScrollView } from "@/components/Drag";
import AddTaskSheet from "@/components/ui/AddTodoItem";
import EditTaskSheet from "@/components/ui/EditTaskSheet";
import FabButton from "@/components/ui/FabButton";
import TodayScheduleSheet from "@/components/ui/TodayScheduleSheet";
import { useDragContext } from "@/contexts/DragContext";
import { lists } from "@/data/data";
import { TaskItem } from "@/types/todoItem.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  tasks: TaskItem[]; // Full tasks array passed down from index.tsx
  onAddTask: (task: TaskItem) => void; // Called when user submits a new task
  onEditTask: (taskId: string, title: string, description: string) => void; // Called when user saves edits
  onDeleteTask: (taskId: string) => void; // Called when user deletes a task permanently
  isScheduleSheetVisible: boolean; // Whether the Today scheduling sheet is open
  onScheduleSheetClose: () => void; // Called when the sheet should close (confirm or cancel)
}

/**
 * Home screen component that displays todo lists organized in accordions.
 * Sits inside DragProvider so it can call useDragContext() to access
 * the pending drop data and confirm/cancel functions for scheduling.
 */
function InboxScreen({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isScheduleSheetVisible,
  onScheduleSheetClose,
}: Props): React.ReactElement {
  // Controls visibility of the "Add Task" sheet triggered by the FAB
  const [isSheetVisible, setIsSheetVisible] = React.useState(false);

  // The taskId of the item the user tapped — null means no edit sheet is open
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  // Safe area insets for proper spacing around notch and home indicator
  const insets = useSafeAreaInsets();

  // Pull scheduling-related values from drag context —
  // pendingDrop holds the intercepted Today drop data until confirmed/cancelled
  const { pendingDrop, confirmPendingDrop, cancelPendingDrop } =
    useDragContext();

  // Look up the pending task in the tasks array so we can display its title/description.
  // null when there is no pending drop (sheet is closed or just opened without data).
  const pendingTask = pendingDrop
    ? tasks.find((t) => t.taskId === pendingDrop.sourceTaskId) ?? null
    : null;

  // Resolve the task being edited from the tasks array so the sheet gets pre-fill data.
  // null when no item is being edited (sheet is closed).
  const editingTask = editingTaskId
    ? tasks.find((t) => t.taskId === editingTaskId) ?? null
    : null;

  /**
   * Confirm handler for the scheduling sheet.
   * Forwards edited text and scheduling choice to DragContext to finalise the move,
   * then signals the parent to close the sheet.
   */
  function handleScheduleConfirm(
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: "anytime" | "morning" | "afternoon" | "evening",
  ) {
    confirmPendingDrop(title, description, scheduledTime, timeSlot); // Commit move with edited text + scheduling
    onScheduleSheetClose(); // Tell the parent to hide the sheet
  }

  /**
   * Cancel handler for the scheduling sheet.
   * Discards the pending drop — the task stays in its original list.
   * Then signals the parent to close the sheet.
   */
  function handleScheduleCancel() {
    cancelPendingDrop(); // Discard the intercepted drop — no state mutation
    onScheduleSheetClose(); // Tell the parent to hide the sheet
  }

  /**
   * Confirm handler for the edit sheet.
   * Passes the edited title and description up to index.tsx to persist.
   * Then closes the edit sheet.
   */
  function handleEditConfirm(title: string, description: string) {
    if (!editingTaskId) return; // Safety guard — should never be null here
    onEditTask(editingTaskId, title, description); // Persist the changes
    setEditingTaskId(null); // Close the edit sheet
  }

  /**
   * Delete handler for the edit sheet.
   * Passes the task ID up to index.tsx to remove it permanently, then closes the sheet.
   */
  function handleDeleteTask() {
    if (!editingTaskId) return; // Safety guard
    onDeleteTask(editingTaskId); // Remove the task from state and storage
    setEditingTaskId(null); // Close the edit sheet
  }

  // Returns tasks for a given list, sorted by order field
  function getTasksForList(listId: string): TaskItem[] {
    return tasks
      .filter((task) => task.listId === listId) // Keep only tasks in this list
      .sort((a, b) => a.order - b.order); // Sort ascending by order number
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.header}>My Lists</Text>

      {/* DragScrollView pre-wires scrollViewRef, scrollEnabled, and currentScrollY
          from the drag context so auto-scroll and hit-test correction work */}
      {/* paddingBottom = tab bar (49) + safe area bottom + FAB height (60) + gap (16)
      so the last list clears the FAB */}
      <DragScrollView
        contentContainerStyle={{ paddingBottom: 49 + insets.bottom + 76 }}
      >
        {lists.map((list) => (
          <DragList
            key={list.listId}
            listId={list.listId}
            listName={list.listName}
            listIconLeft={<Ionicons name={list.listIcon} size={24} />}
            tasks={getTasksForList(list.listId)}
            // Tap on any item sets editingTaskId to open the edit sheet for that item
            onItemPress={(taskId) => setEditingTaskId(taskId)}
          />
        ))}
      </DragScrollView>

      {/* Ghost rendered above everything — outside the ScrollView so it isn't clipped */}
      <DragGhost />

      {/* Floating action button — opens the Add Task sheet */}
      <FabButton onPress={() => setIsSheetVisible(true)} />

      {/* Add Task bottom sheet — standard form for creating a new task */}
      <AddTaskSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onAddTask={onAddTask}
      />

      {/* Edit Task sheet — opens when the user taps an existing Inbox item.
          Pre-fills title and description from the tapped task. */}
      <EditTaskSheet
        visible={editingTaskId !== null}
        taskTitle={editingTask?.title ?? ""}
        taskDescription={editingTask?.description ?? ""}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditingTaskId(null)}
        onDelete={handleDeleteTask}
      />

      {/* Today Scheduling sheet — shown when a task is dropped onto the Today list.
          Displays the task read-only and lets the user pick Anytime or a time slot. */}
      <TodayScheduleSheet
        visible={isScheduleSheetVisible}
        taskTitle={pendingTask?.title ?? ""} // Task title shown read-only
        taskDescription={pendingTask?.description ?? ""} // Task description shown read-only
        onConfirm={handleScheduleConfirm} // Finalise the drop with scheduling data
        onCancel={handleScheduleCancel} // Abort the drop
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-screen container with light background
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  // Screen title at the top
  header: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1C1C1E",
  },
});

export default InboxScreen;
