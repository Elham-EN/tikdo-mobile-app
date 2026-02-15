// Hook that provides haptic feedback functions for todo drag-and-drop interactions.
// Returns trigger functions for different feedback types: start, move, drop, and cancel.

import * as Haptics from "expo-haptics";

/**
 * Custom hook that provides haptic feedback functions for todo drag-and-drop.
 *
 * Returns an object containing four trigger functions:
 * - triggerStartHaptic: Medium impact when drag starts
 * - triggerMoveHaptic: Light impact when passing over siblings
 * - triggerDropHaptic: Success notification when dropped successfully
 * - triggerCancelHaptic: Error notification when dropped in invalid zone
 */
export function useTodoHaptics() {
  // Trigger medium impact haptic when user starts dragging an item
  const triggerStartHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Trigger light impact haptic when dragging over sibling items
  const triggerMoveHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Trigger success notification haptic when item is dropped successfully
  const triggerDropHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Trigger error notification haptic when item is dropped in invalid zone
  const triggerCancelHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  // Return all haptic trigger functions for use in drag gesture handlers
  return {
    triggerStartHaptic,
    triggerMoveHaptic,
    triggerDropHaptic,
    triggerCancelHaptic,
  };
}
