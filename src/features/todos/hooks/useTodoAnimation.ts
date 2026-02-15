// Hook that manages all animation shared values and styles for todo drag-and-drop.
// Handles translation, scaling, opacity, and shift animations for draggable items.

import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Custom hook that manages animation values and styles for draggable todo items.
 *
 * Creates and manages shared values for:
 * - isActive: Whether the item is currently being dragged
 * - translateX/Y: Horizontal and vertical drag translation
 * - lastHapticY: Tracks Y position for haptic feedback triggering
 * - shiftY: Vertical offset for sibling item animations
 *
 * Returns animated styles for:
 * - animatedStyle: Applied to the draggable item (scale, opacity, z-index, translation)
 * - shiftStyle: Applied to container for sibling shift animations
 * - ghostStyle: Applied to ghost placeholder that shows during drag
 */
export function useTodoAnimation() {
  // Tracks whether the item is currently being dragged
  const isActive = useSharedValue(false);

  // Track the last Y position where haptic feedback was triggered
  const lastHapticY = useSharedValue(0);

  // Horizontal translation distance from drag gesture
  const translateX = useSharedValue(0);

  // Vertical translation distance from drag gesture
  const translateY = useSharedValue(0);

  // Vertical offset set by siblings to animate this item's position
  const shiftY = useSharedValue(0);

  // Animated style for the draggable item
  // Handles translation, scaling, opacity, and z-index during drag
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      // Horizontal movement following finger
      { translateX: translateX.value },
      // Vertical movement following finger
      { translateY: translateY.value },
      // Item grows slightly (1.05x) when dragged to appear "lifted"
      { scale: withTiming(isActive.value ? 1.05 : 1, { duration: 150 }) },
    ],
    // Subtle transparency (0.85) so user can see what's behind the dragged item
    opacity: withTiming(isActive.value ? 0.85 : 1, { duration: 150 }),
    // Keeps the dragged item above its siblings
    zIndex: isActive.value ? 999 : 0,
  }));

  // Animated style for the container
  // Handles vertical shift animation when other items are dragged over this one
  const shiftStyle = useAnimatedStyle(() => ({
    transform: [
      // Smooth vertical shift animation (200ms) when sibling is dragged over
      { translateY: withTiming(shiftY.value, { duration: 200 }) },
    ],
  }));

  // Animated style for the ghost placeholder
  // Invisible when not dragging, fades in (0.3 opacity) when active
  const ghostStyle = useAnimatedStyle(() => ({
    // Position absolutely to hold space without affecting layout
    position: "absolute",
    left: 0,
    right: 0,
    // Fade in to 30% opacity when dragging, invisible otherwise
    opacity: withTiming(isActive.value ? 0.3 : 0, { duration: 150 }),
  }));

  // Return all animation values and styles for use in component
  return {
    // Shared values that gesture handlers can modify
    animationValues: {
      isActive,
      lastHapticY,
      translateX,
      translateY,
      shiftY,
    },
    // Animated styles to apply to rendered components
    animatedStyles: {
      animatedStyle,
      shiftStyle,
      ghostStyle,
    },
  };
}
