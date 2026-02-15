// Component that renders a draggable todo item with drag-and-drop support.
// Allows users to long-press to drag, reorder within lists, move between lists, and delete via trash.
// Uses custom hooks to separate concerns: haptics, animations, drop detection, and gesture handling.

import type { TodoItem as TodoItemType } from "@/features/todos/types";
import { StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useTodoDrag } from "../hooks/useTodoDrag";

// Props for TodoItem component
interface TodoItemProps {
  // The todo object containing id, title, notes, listType, position, etc.
  todo: TodoItemType;
  // The item's 0-based position in the filtered list (set by parent Accordion)
  index: number;
}

/**
 * Draggable todo item component with haptic feedback and drop zone detection.
 *
 * Features:
 * - Long-press (200ms) to activate drag mode
 * - Visual feedback: scaling, opacity, ghost placeholder
 * - Haptic feedback: different patterns for start, move, drop, cancel
 * - Drop zones: can be dropped into any accordion or trash
 * - Reordering: drag within same list to reorder
 * - Moving: drag to different list to move
 * - Deleting: drag to trash to delete
 */
export default function TodoItem({ todo, index }: TodoItemProps) {
  // Load all drag-and-drop functionality from custom hook
  // This hook orchestrates haptics, animations, drop detection, and gesture handling
  const { panGesture, containerRef, registerBounds, animatedStyles } =
    useTodoDrag({ todo, index });

  // Destructure animated styles for easier access
  const { animatedStyle, shiftStyle, ghostStyle } = animatedStyles;

  return (
    // Container View with shift animation (for sibling animations during drag)
    <Animated.View
      ref={containerRef}
      onLayout={registerBounds}
      style={shiftStyle}
    >
      {/* Ghost placeholder — holds the layout space and fades in during drag */}
      {/* This provides visual feedback showing where the item was originally */}
      <Animated.View style={ghostStyle}>
        <View style={[styles.todoItem, styles.ghost]}>
          {/* Checkbox visual placeholder */}
          <View style={styles.checkbox} />
          {/* Todo content placeholder */}
          <View style={styles.todoContent}>
            <Text style={styles.todoTitle}>{todo.title}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Draggable item with gesture detection */}
      {/* This is the actual todo item that follows the finger during drag */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.todoItem, animatedStyle]}>
          {/* Checkbox circle (not functional yet, just visual) */}
          <View style={styles.checkbox} />

          {/* Todo content area with title and optional notes */}
          <View style={styles.todoContent}>
            {/* Todo title text */}
            <Text style={styles.todoTitle}>{todo.title}</Text>

            {/* Optional notes text (only shown if notes exist) */}
            {todo.notes ? (
              <Text style={styles.todoNotes}>{todo.notes}</Text>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// Styles for TodoItem component
const styles = StyleSheet.create({
  // Main todo item container style
  todoItem: {
    flexDirection: "row", // Horizontal layout: checkbox on left, content on right
    alignItems: "flex-start", // Align items to top
    paddingVertical: 14, // Vertical padding for comfortable touch target
    paddingHorizontal: 16, // Horizontal padding for spacing from edges
    backgroundColor: "#FFFFFF", // White background
    borderBottomWidth: StyleSheet.hairlineWidth, // Thin separator line
    borderBottomColor: "#E0E0E0", // Light gray separator
  },
  // Checkbox circle style
  checkbox: {
    width: 24, // Circle width
    height: 24, // Circle height
    borderRadius: 12, // Half of width/height to make it circular
    borderWidth: 2, // Border thickness
    borderColor: "#C7C7CC", // Light gray border color
    marginRight: 14, // Space between checkbox and content
    marginTop: 2, // Slight top margin to align with text baseline
  },
  // Todo content container (title + notes)
  todoContent: {
    flex: 1, // Take remaining horizontal space
  },
  // Todo title text style
  todoTitle: {
    fontFamily: "BalsamiqSans-Regular", // Custom handwritten font
    fontWeight: "400", // Normal weight
    fontSize: 16, // Readable font size
    color: "#1C1C1E", // Dark gray text
  },
  // Todo notes text style (smaller, lighter)
  todoNotes: {
    fontFamily: "BalsamiqSans-Regular", // Same font as title
    fontSize: 13, // Smaller than title
    color: "#8E8E93", // Lighter gray for secondary text
    marginTop: 2, // Small gap between title and notes
  },
  // Ghost placeholder style (dashed border, light background)
  ghost: {
    backgroundColor: "#F0F0F0", // Light gray background
    borderStyle: "dashed", // Dashed border style
    borderWidth: 1, // Border thickness
    borderColor: "#C7C7CC", // Light gray border
    borderBottomWidth: 1, // Ensure bottom border is also dashed
    borderBottomColor: "#C7C7CC", // Same color for bottom border
  },
});
