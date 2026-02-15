// Hook that handles drop zone detection and insertion index calculation for drag-and-drop.
// Manages logic for determining where a dragged item should land based on screen position.

import type {
  ListType,
  TodoItem as TodoItemType,
} from "@/features/todos/types";
import { useRef } from "react";
import { useActiveDropZone, useDropZones } from "../context/DropZoneContext";
import { useItemPosition } from "../context/ItemPositionContext";
import {
  useMoveTodoItemMutation,
  useReorderTodoItemMutation,
} from "../todosApi";

interface UseDropDetectionParams {
  todo: TodoItemType;
  index: number;
  triggerDropHaptic: () => void;
  triggerCancelHaptic: () => void;
}

/**
 * Custom hook that provides drop detection and insertion calculation for drag-and-drop.
 *
 * Handles:
 * - Detecting which drop zone (accordion/trash) is being hovered
 * - Calculating where in a list the item would be inserted
 * - Animating sibling items to show insertion point
 * - Processing the drop event to trigger appropriate mutation
 *
 * Returns functions for use in gesture handlers:
 * - updateActiveDropZone: Updates which zone is hovered during drag
 * - calculateInsertionIndex: Determines insertion position among siblings
 * - handleDrop: Processes drop event and triggers mutation
 * - resetShifts: Clears sibling shift animations
 * - clearActiveDropZone: Clears the active drop zone highlight
 */
export function useDropDetection({
  todo,
  index,
  triggerDropHaptic,
  triggerCancelHaptic,
}: UseDropDetectionParams) {
  // Get all registered drop zones (accordions and trash) from context
  const dropZones = useDropZones();

  // Get active drop zone shared value for visual highlighting
  const activeDropZone = useActiveDropZone();

  // Mutation to move item to different list or trash
  const [moveTodo] = useMoveTodoItemMutation();

  // Mutation to reorder item within same list
  const [reorderTodo] = useReorderTodoItemMutation();

  // Get item position and shift value maps from context
  const { positions: itemPosition, shiftValues } = useItemPosition();

  // Store the calculated insertion index during drag for use on drop
  const insertionIndexRef = useRef<number>(index);

  /**
   * Resets all sibling shiftY values back to 0 after drop.
   * Clears the visual shift animations that show insertion point.
   */
  const resetShifts = () => {
    // Get map of all sibling shift values
    const shifts = shiftValues.current;
    // Loop through each todo's shift value and reset to 0
    for (const id in shifts) {
      shifts[Number(id)].value = 0;
    }
  };

  /**
   * Clears the active drop zone highlight.
   * Called after drop to remove visual feedback.
   */
  const clearActiveDropZone = () => {
    // Set active zone to null to remove highlight
    activeDropZone.value = null;
  };

  /**
   * Continuously updates which drop zone is being hovered during drag.
   * Provides visual feedback by highlighting the zone under the dragged item.
   *
   * @param screenY - Absolute Y coordinate of finger on screen
   */
  const updateActiveDropZone = (screenY: number) => {
    // Get all registered drop zones (accordions and trash)
    const zones = dropZones.current;

    // Track which zone the finger is currently hovering over
    let hoveredZone: ListType | "trash" | null = null;

    // Loop through each available drop zone
    for (const key in zones) {
      // Get this zone's boundaries and type
      const zone = zones[key as ListType | "trash"]!;

      // Check if current drag position is within this zone's boundaries
      if (screenY >= zone.y && screenY <= zone.y + zone.height) {
        // Found the zone being hovered
        hoveredZone = zone.listType;
        // Stop searching once we found the match
        break;
      }
    }

    // Update shared value to trigger visual highlight on the active zone
    activeDropZone.value = hoveredZone;
  };

  /**
   * Handles the drop event when user releases a dragged todo item.
   * Determines which zone was dropped into and triggers appropriate action.
   *
   * @param screenY - Absolute Y coordinate where item was dropped
   */
  const handleDrop = (screenY: number) => {
    // Get all registered drop zones (accordions and trash)
    const zones = dropZones.current;

    // Track which zone the item was dropped into
    let target: ListType | "trash" | null = null;

    // Loop through each available drop zone
    for (const key in zones) {
      // Get this zone's boundaries and type
      const zone = zones[key as ListType | "trash"]!;

      // Check if drop Y position is within this zone's boundaries
      if (screenY >= zone.y && screenY <= zone.y + zone.height) {
        // Found the target zone where item was dropped
        target = zone.listType;
        // Stop searching once we found the match
        break;
      }
    }

    // Edge case: dropped outside any valid zone
    if (!target) {
      // Trigger error haptic to indicate invalid drop
      triggerCancelHaptic();
      return;
    }

    // Trigger success haptic on valid drop
    triggerDropHaptic();

    // Dropped in the same list — reorder within list
    if (target === todo.listType) {
      // Get the calculated insertion index from drag calculation
      const newIndex = insertionIndexRef.current;
      // Position is 1-based in database, index is 0-based in UI
      const newPosition = newIndex + 1;
      // Only trigger mutation if position actually changed
      if (newPosition !== todo.position) {
        reorderTodo({ id: todo.id, newPosition });
      }
      return;
    }

    // Dropped in a different list or trash
    if (target === "trash") {
      // Move to trash by setting status to deleted
      moveTodo({ id: todo.id, status: "deleted" });
    } else {
      // Move to different list by updating listType
      moveTodo({ id: todo.id, listType: target });
    }
  };

  /**
   * Calculates where the dragged item would be inserted among siblings.
   * Updates sibling shift animations to show visual insertion point.
   *
   * @param screenY - Absolute Y coordinate of dragged item
   */
  const calculateInsertionIndex = (screenY: number) => {
    // Get all registered item positions from shared context
    const positions = itemPosition.current;

    // Get all sibling items (excluding this dragged item) sorted by their list order
    const siblings = Object.entries(positions)
      // Filter out the current item being dragged (exclude self)
      .filter(([id]) => Number(id) !== todo.id)
      // Sort siblings top-to-bottom based on their original index
      .sort((a, b) => a[1].index - b[1].index);

    // Edge case: empty list (no siblings) - insert at position 0
    if (siblings.length === 0) {
      insertionIndexRef.current = 0;
      return;
    }

    // Start with insertion at beginning of list
    let targetIndex = 0;

    // Walk siblings top-to-bottom to find insertion point
    for (const [, position] of siblings) {
      // The vertical center of this sibling on screen
      const midpoint = position.y + position.height / 2;

      // Finger is below this sibling's center — we've passed it
      if (screenY > midpoint) {
        // Insert after this sibling
        targetIndex = position.index + 1;
      } else {
        // Finger is above — this is where we belong, stop looking
        break;
      }
    }

    // Store the insertion index for use in handleDrop
    insertionIndexRef.current = targetIndex;

    // Height of one todo item row in pixels (measured from design)
    const ITEM_HEIGHT = 52;

    // Update each sibling's shiftY shared value directly
    const shifts = shiftValues.current;
    for (const [id, position] of siblings) {
      // Convert string key to number for todo ID
      const todoId = Number(id);
      // Get this sibling's shift value from map
      const shiftValue = shifts[todoId];

      // Safety check: log warning if shift value not found
      if (!shiftValue) {
        console.log(`No shift value found for todo ${todoId}`);
        continue;
      }

      // Sibling is at or after the insertion point — shift it down by one row
      const shouldShift = position.index >= targetIndex;
      // Update shift value to animate sibling (0 = no shift, ITEM_HEIGHT = shift down)
      shiftValue.value = shouldShift ? ITEM_HEIGHT : 0;
    }
  };

  // Return all detection functions for use in gesture handlers
  return {
    updateActiveDropZone,
    calculateInsertionIndex,
    handleDrop,
    resetShifts,
    clearActiveDropZone,
  };
}
