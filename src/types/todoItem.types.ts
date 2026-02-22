import { type DragItem } from "@/types/dnd.types";
import Ionicons from "@expo/vector-icons/Ionicons";

// Re-export DragItem as TaskItem for backward compatibility with the demo app
export type TaskItem = DragItem;

export type ListData = {
  listId: string;
  listName: string;
  listIcon: keyof typeof Ionicons.glyphMap;
};
