// Utility functions for filtering and sorting todo items by list type and status.
// Centralizes filtering logic to avoid repetition across components.

import type { ListType, TodoItem } from "../types";

/**
 * Filters todos by list type and excludes deleted items, then sorts by position.
 *
 * This helper function replaces repetitive filter/sort chains throughout the app.
 * It filters todos to only include items matching the specified listType,
 * excludes any items with status="deleted", and sorts by position (ascending).
 *
 * @param todos - Array of all todo items to filter
 * @param listType - Which list type to filter by (inbox, today, upcoming, anytime, someday)
 * @returns Filtered and sorted array of todos for the specified list
 */
export function filterTodosByListType(
  todos: TodoItem[],
  listType: ListType
): TodoItem[] {
  return (
    todos
      // Keep only todos matching the specified list type
      .filter((todo) => todo.listType === listType)
      // Exclude any deleted items (deleted items only appear in trash)
      .filter((todo) => todo.status !== "deleted")
      // Sort by position in ascending order (1, 2, 3, ...)
      .sort((a, b) => a.position - b.position)
  );
}

/**
 * Filters todos to only show deleted items (trash), then sorts by position.
 *
 * This is a special case filter for the trash accordion.
 * It returns only items with status="deleted", regardless of their listType,
 * and sorts them by position (ascending).
 *
 * @param todos - Array of all todo items to filter
 * @returns Filtered and sorted array of deleted todos
 */
export function filterDeletedTodos(todos: TodoItem[]): TodoItem[] {
  return (
    todos
      // Keep only todos that are marked as deleted
      .filter((todo) => todo.status === "deleted")
      // Sort by position in ascending order (1, 2, 3, ...)
      .sort((a, b) => a.position - b.position)
  );
}
