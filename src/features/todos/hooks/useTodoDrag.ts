// Main hook that orchestrates all drag-and-drop logic for todo items.
// Combines haptics, animations, drop detection, and gesture handling into one interface.

import type { TodoItem as TodoItemType } from "@/features/todos/types";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useItemPosition } from "../context/ItemPositionContext";
import { useTodoAnimation } from "./useTodoAnimation";
import { useDropDetection } from "./useDropDetection";
import { useTodoHaptics } from "./useTodoHaptics";

interface UseTodoDragParams {
  todo: TodoItemType;
  index: number;
}

/**
 * Main custom hook that orchestrates all drag-and-drop functionality for a todo item.
 *
 * Combines:
 * - Haptic feedback (useTodoHaptics)
 * - Animation values and styles (useTodoAnimation)
 * - Drop detection and insertion calculation (useDropDetection)
 * - Gesture handling (Pan gesture with long press activation)
 * - Position registration (tracking item's screen position)
 *
 * Returns:
 * - panGesture: Configured pan gesture for drag-and-drop
 * - containerRef: Ref to attach to container View for position measurement
 * - registerBounds: Function to measure and register item's screen position
 * - animatedStyles: Object containing animatedStyle, shiftStyle, ghostStyle
 */
export function useTodoDrag({ todo, index }: UseTodoDragParams) {
  // Get all haptic feedback trigger functions
  const {
    triggerStartHaptic,
    triggerMoveHaptic,
    triggerDropHaptic,
    triggerCancelHaptic,
  } = useTodoHaptics();

  // Get animation values and styles for drag animations
  const { animationValues, animatedStyles } = useTodoAnimation();

  // Destructure animation values for easier access
  const { isActive, lastHapticY, translateX, translateY, shiftY } =
    animationValues;

  // Get drop detection functions with haptic callbacks
  const {
    updateActiveDropZone,
    calculateInsertionIndex,
    handleDrop,
    resetShifts,
    clearActiveDropZone,
  } = useDropDetection({
    todo,
    index,
    triggerDropHaptic,
    triggerCancelHaptic,
  });

  // Get item position tracking from context
  const { positions: itemPosition, shiftValues } = useItemPosition();

  // Ref to the container View for measuring screen position
  const containerRef = useRef<View>(null);

  /**
   * Measures and stores this item's position on screen.
   * Called on layout to track where each item is located, allowing
   * other items to calculate insertion index during drag operations.
   */
  const registerBounds = () => {
    // Measure this item's position relative to the window (absolute screen coordinates)
    containerRef.current?.measureInWindow((_x, y, _width, height) => {
      // Store Y position, height, and index keyed by todo ID for sibling access
      itemPosition.current[todo.id] = { y, height, index };
    });
  };

  /**
   * Registers this item's shiftY shared value in the global context.
   * This allows sibling items to animate this item by updating its shiftY
   * during drag operations. Cleanup removes the item on unmount.
   */
  useEffect(() => {
    // Get references to shared position and shift contexts
    const positions = itemPosition.current;
    const shifts = shiftValues.current;

    // Register this item's shiftY so siblings can modify it during drag
    shifts[todo.id] = shiftY;

    // Cleanup: remove this item's data when component unmounts
    return () => {
      delete positions[todo.id];
      delete shifts[todo.id];
    };
  }, [todo.id, itemPosition, shiftValues, shiftY]);

  /**
   * Pan gesture configuration with long press activation.
   * Handles drag start, drag update, and drag end events.
   */
  const panGesture = Gesture.Pan()
    // Don't start the pan until the finger has been held down for 200ms
    .activateAfterLongPress(200)
    // Fired when long press completes and drag starts
    .onStart(() => {
      // Mark item as active to trigger scale/opacity animations
      isActive.value = true;
      // Fire medium impact haptic — tells user "you grabbed it"
      scheduleOnRN(triggerStartHaptic);
    })
    // Fired continuously as the finger drags
    // event.translationX/Y is how far the finger moved from start position
    .onUpdate((event) => {
      // Update horizontal translation to follow finger
      translateX.value = event.translationX;
      // Update vertical translation to follow finger
      translateY.value = event.translationY;

      // Get absolute screen Y coordinate of finger
      const screenY = event.absoluteY;

      // Calculate where the item would be inserted among siblings
      // Runs on JS thread because it needs to access context refs
      scheduleOnRN(calculateInsertionIndex, screenY);

      // Update which drop zone is being hovered for visual feedback
      // Runs on JS thread to avoid worklet serialization warnings
      scheduleOnRN(updateActiveDropZone, screenY);

      // Fire light haptic every ~50px of vertical movement (passing over siblings)
      if (Math.abs(event.translationY - lastHapticY.value) > 50) {
        // Update last haptic position to current Y
        lastHapticY.value = event.translationY;
        // Trigger light haptic feedback
        scheduleOnRN(triggerMoveHaptic);
      }
    })
    // Fired when the finger lifts (drag ends)
    .onEnd((event) => {
      // Capture finger's final screen-level Y position for drop detection
      const fingerY = event.absoluteY;

      // Pass handleDrop (defined in RN Runtime scope) and fingerY as argument
      // This avoids closure capture issues across runtimes (worklet vs JS)
      scheduleOnRN(handleDrop, fingerY);

      // Snap item back to original position with spring animation
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);

      // Mark item as no longer active to remove scale/opacity effects
      isActive.value = false;

      // Reset last haptic position tracker
      lastHapticY.value = 0;

      // Clear the active drop zone (on JS thread to avoid worklet warnings)
      scheduleOnRN(clearActiveDropZone);

      // Reset all sibling shifts back to 0 (via JS thread)
      scheduleOnRN(resetShifts);
    });

  // Return gesture, refs, and styles for use in component
  return {
    panGesture,
    containerRef,
    registerBounds,
    animatedStyles,
  };
}
