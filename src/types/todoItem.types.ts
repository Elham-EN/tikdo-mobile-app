// todoItem.types.ts — data shapes for task items and list containers.
// TaskItem extends the base DragItem type with optional scheduling fields
// that are populated when a task is moved into the Today list.

import { type DragItem } from "@/types/dnd.types";
import Ionicons from "@expo/vector-icons/Ionicons";

// TaskItem extends DragItem with optional Today scheduling metadata.
// The scheduling fields are undefined for tasks not in the Today list —
// they are only set when the user schedules a task via the scheduling sheet.
export type TaskItem = DragItem & {
  // "HH:MM" 24-hour string (e.g. "14:30") when user picked a specific time.
  // null or undefined means the user chose "Anytime" — no specific time.
  scheduledTime?: string | null;

  // Time-of-day bucket derived from scheduledTime.
  // "anytime"   — no time picked; item appears in the Anytime section
  // "morning"   — 5:00 AM – 11:59 AM
  // "afternoon" — 12:00 PM – 4:59 PM
  // "evening"   — 5:00 PM – 11:59 PM
  // undefined   — task is not in the Today list
  timeSlot?: "anytime" | "morning" | "afternoon" | "evening";
};

// Shape of a list entry displayed in the UI sidebar / accordion
export type ListData = {
  listId: string; // Unique identifier used to filter tasks per list
  listName: string; // Display name shown in the list header
  listIcon: keyof typeof Ionicons.glyphMap; // Ionicons icon name for the list
};
