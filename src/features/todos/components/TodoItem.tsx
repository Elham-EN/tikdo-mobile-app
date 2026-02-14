import type {
  ListType,
  TodoItem as TodoItemType,
} from "@/features/todos/types";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useActiveDropZone, useDropZones } from "../context/DropZoneContext";
import { useItemPosition } from "../context/ItemPositionContext";
import {
  useMoveTodoItemMutation,
  useReorderTodoItemMutation,
} from "../todosApi";

interface TodoItemProps {
  todo: TodoItemType;
  index: number; // the item's position in the list,
}

export default function TodoItem({ todo, index }: TodoItemProps) {
  //  tracks whether the item is currently being dragged.
  const isActive = useSharedValue(false);
  // track the last haptic trigger point:
  const lastHapticY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Each item's vertical offset — set by calculateInsertionIndex on JS thread
  const shiftY = useSharedValue(0);

  const dropZones = useDropZones();
  const activeDropZone = useActiveDropZone();
  const [moveTodo] = useMoveTodoItemMutation();
  const [reorderTodo] = useReorderTodoItemMutation();
  const { positions: itemPosition, shiftValues } = useItemPosition();

  const containerRef = useRef<View>(null);
  // Store the calculated insertion index during drag
  const insertionIndexRef = useRef<number>(index);

  // Reset all sibling shiftY values back to 0 on drop
  const resetShifts = () => {
    const shifts = shiftValues.current;
    for (const id in shifts) {
      shifts[Number(id)].value = 0;
    }
  };

  // Trigger haptic feedback - defined in RN Runtime so scheduleOnRN can call it
  const triggerStartHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerMoveHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerDropHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerCancelHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const clearActiveDropZone = () => {
    activeDropZone.value = null;
  };

  // Measures and stores this item's position on screen.
  // Called on layout to track where each item is located, allowing
  // other items to calculate insertion index during drag operations.
  const registerBounds = () => {
    // Measure this item's position relative to the window
    containerRef.current?.measureInWindow((_x, y, _width, height) => {
      // Store Y position, height, and index keyed by todo ID for sibling access
      itemPosition.current[todo.id] = { y, height, index };
    });
  };

  // Registers this item's shiftY shared value in the global context.
  // This allows sibling items to animate this item by updating its shiftY
  // during drag operations. Cleanup removes the item on unmount.
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

  // Continuously updates which drop zone is being hovered during drag.
  // This provides visual feedback by highlighting the zone under the dragged item.
  // Runs on JS thread to avoid worklet serialization warnings.
  const updateActiveDropZone = (absoluteY: number) => {
    // Get all registered drop zones (accordions and trash)
    const zones = dropZones.current;
    // Track which zone the finger is currently hovering over
    let hoveredZone: ListType | "trash" | null = null;
    // Loop through each available drop zone
    for (const key in zones) {
      const zone = zones[key as ListType | "trash"]!;
      // Check if current drag position is within this zone's boundaries
      if (absoluteY >= zone.y && absoluteY <= zone.y + zone.height) {
        // Found the zone being hovered
        hoveredZone = zone.listType;
        // Stop searching once we found the match
        break;
      }
    }
    // Update shared value to trigger visual highlight on the active zone
    activeDropZone.value = hoveredZone;
  };

  // Handles the drop event when user releases a dragged todo item.
  // Determines which zone (accordion list or trash) the item was dropped into
  // based on the Y coordinate, then triggers appropriate action (move/reorder/delete).
  const handleDrop = (absoluteY: number) => {
    // Get all registered drop zones (accordions and trash)
    const zones = dropZones.current;
    // Track which zone the item was dropped into
    let target: ListType | "trash" | null = null;
    // Loop through each available drop zone
    for (const key in zones) {
      const zone = zones[key as ListType | "trash"]!;
      // Check if drop Y position is within this zone's boundaries
      if (absoluteY >= zone.y && absoluteY <= zone.y + zone.height) {
        // Found the target zone where item was dropped
        target = zone.listType;
        // Stop searching once we found the match
        break;
      }
    }

    // Edge case: dropped outside any accordion
    if (!target) {
      // Trigger error haptic to indicate invalid drop
      triggerCancelHaptic();
      return;
    }

    // Trigger success haptic on valid drop
    triggerDropHaptic();

    // Dropped in the same list — reorder
    if (target === todo.listType) {
      const newIndex = insertionIndexRef.current;
      // Position is 1-based in database, index is 0-based in UI
      const newPosition = newIndex + 1;
      if (newPosition !== todo.position) {
        reorderTodo({ id: todo.id, newPosition });
      }
      return;
    }

    // Dropped in a different list or trash
    if (target === "trash") {
      moveTodo({ id: todo.id, status: "deleted" });
    } else {
      moveTodo({ id: todo.id, listType: target });
    }
  };

  // where it can safely iterate sibling
  // positions and figure out where the dragged item would land.
  const calculateInsertionIndex = (absoluteY: number) => {
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

    let insertAt = 0;
    // Walk siblings top-to-bottom:
    for (const [, pos] of siblings) {
      // The vertical center of this sibling on screen
      const midpoint = pos.y + pos.height / 2;
      // Finger is below this sibling's center — we've passed it
      if (absoluteY > midpoint) {
        insertAt = pos.index + 1;
      } else {
        // Finger is above — this is where we belong, stop looking
        break;
      }
    }

    // Store the insertion index for use in handleDrop
    insertionIndexRef.current = insertAt;

    // Estimated height of one todo item row
    const ITEM_HEIGHT = 52;
    // Update each sibling's shiftY shared value directly
    const shifts = shiftValues.current;
    for (const [id, pos] of siblings) {
      const todoId = Number(id);
      const sv = shifts[todoId];
      if (!sv) {
        console.log(`No shift value found for todo ${todoId}`);
        continue;
      }
      // Sibling is at or after the insertion point — shift it down
      const shouldShift = pos.index >= insertAt;
      sv.value = shouldShift ? ITEM_HEIGHT : 0;
    }
  };

  // updates those shared values as the finger moves:
  const panGesture = Gesture.Pan()
    // "don't start the pan until the finger has been held down for 200ms
    .activateAfterLongPress(200)
    .onStart(() => {
      isActive.value = true;
      // fire a medium impact — this tells the user "you grabbed it":
      scheduleOnRN(triggerStartHaptic);
    })
    // fires continuously as the finger drags. event.translationX/Y
    // is how far the finger moved from where it started
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      const absoluteY = event.absoluteY;

      // Calculate where the item would be inserted among its siblings (runs on JS thread)
      scheduleOnRN(calculateInsertionIndex, absoluteY);

      // Update which drop zone is being hovered (runs on JS thread to avoid worklet warnings)
      scheduleOnRN(updateActiveDropZone, absoluteY);

      // Fire light haptic every ~50px of vertical movement - passing over sibling
      if (Math.abs(event.translationY - lastHapticY.value) > 50) {
        lastHapticY.value = event.translationY;
        scheduleOnRN(triggerMoveHaptic);
      }
    })
    // fires when the finger lifts. withSpring(0) snaps the item back to
    // its original position (for now — later we'll add drop logic here)
    .onEnd((event) => {
      // To detect the target. Capture event.absoluteY (the finger's screen-level Y),
      // then use scheduleOnRN to run the detection on the JS thread
      const fingerY = event.absoluteY;

      // Pass handleDrop (defined in RN Runtime scope) and fingerY as
      // an argument — avoids closure capture issues across runtimes.
      scheduleOnRN(handleDrop, fingerY);

      // Snap back to original position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isActive.value = false;
      lastHapticY.value = 0;
      // Clear the active drop zone (on JS thread to avoid worklet warnings)
      scheduleOnRN(clearActiveDropZone);
      // Reset all sibling shifts back to 0 (via JS thread)
      scheduleOnRN(resetShifts);
    });

  // Connect the shared values to a style that moves the item:
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      // item grows slightly so it "lifts" off the list
      { scale: withTiming(isActive.value ? 1.05 : 1, { duration: 150 }) },
    ],
    // subtle transparency so you can see what's behind
    opacity: withTiming(isActive.value ? 0.85 : 1, { duration: 150 }),
    // keeps the dragged item above its siblings
    zIndex: isActive.value ? 999 : 0,
  }));

  const shiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(shiftY.value, { duration: 200 }) }],
  }));

  //  it's invisible when not dragging, fades in when active:
  const ghostStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    opacity: withTiming(isActive.value ? 0.3 : 0, { duration: 150 }),
  }));

  return (
    <Animated.View
      ref={containerRef}
      onLayout={registerBounds}
      style={shiftStyle}
    >
      {/* Ghost placeholder — holds the layout space */}
      <Animated.View style={ghostStyle}>
        <View style={[styles.todoItem, styles.ghost]}>
          <View style={styles.checkbox} />
          <View style={styles.todoContent}>
            <Text style={styles.todoTitle}>{todo.title}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Draggable item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.todoItem, animatedStyle]}>
          <View style={styles.checkbox} />
          <View style={styles.todoContent}>
            <Text style={styles.todoTitle}>{todo.title}</Text>
            {todo.notes ? (
              <Text style={styles.todoNotes}>{todo.notes}</Text>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    marginRight: 14,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 16,
    color: "#1C1C1E",
  },
  todoNotes: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  ghost: {
    backgroundColor: "#F0F0F0",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderBottomWidth: 1,
    borderBottomColor: "#C7C7CC",
  },
});
