export type ListType = "inbox" | "today" | "upcoming" | "anytime" | "someday";
export type TaskStatus = "pending" | "completed" | "deleted";

// Server Body Response Type
export interface TodoItem {
  id: number;
  title: string;
  notes: string | null;
  listType: ListType;
  status: TaskStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  isOverdue: boolean;
  originalScheduledDate: string | null;
  originalScheduledTime: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  position: number;
}
