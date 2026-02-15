// Expandable accordion component for organizing todo lists by category.
// Features smooth expand/collapse animations, drag-and-drop drop zone detection,
// and visual feedback when items are dragged over it. Wraps children in ItemPositionProvider
// to enable sibling item position tracking for drag-and-drop insertion calculations.

import {
  useActiveDropZone,
  useDropZones,
} from "@/features/todos/context/DropZoneContext";
import { ItemPositionProvider } from "@/features/todos/context/ItemPositionContext";
import { ListType } from "@/features/todos/types";
import { light_grey } from "@/utils/colors";
import { Entypo } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Props for Accordion component
interface AccordionProps {
  // Accordion title displayed in pill header
  title: string;
  // Optional icon displayed before title
  icon?: ImageSourcePropType;
  // Background color for the pill header
  bgColor?: string;
  // Optional component rendered on right side of header (e.g., PlusButton)
  headerRight?: React.ReactNode;
  // Optional component sticky at top of expanded content (e.g., AddTodoRow)
  stickyTop?: React.ReactNode;
  // Accordion content (usually TodoItem components)
  children: React.ReactNode;
  // Number of items in this list (displayed in pill badge)
  listSize: number;
  // List type identifier for drag-and-drop targeting
  listType: ListType | "trash";
}

// Duration of expand/collapse animation in milliseconds
const ANIMATION_DURATION = 300;

// Hover background colors for drag-and-drop visual feedback
const HOVER_BG_TRASH = "#FFE5E5"; // Light red background when dragging over trash
const HOVER_BG_LIST = "#E3F2FD"; // Light blue background when dragging over regular lists

// Border colors for drag-and-drop visual feedback
const BORDER_COLOR_TRASH = "#FF6B6B"; // Red border for trash drop zone
const BORDER_COLOR_LIST = "#2196F3"; // Blue border for regular list drop zones

/**
 * Collapsible accordion with a pill-shaped header.
 * Tap the header to smoothly expand/collapse the content below it.
 */
/**
 * Collapsible accordion with smooth expand/collapse animation and drop zone support.
 * Displays a pill-shaped header with icon, title, and item count.
 * Content expands/collapses with animated height transition when header is tapped.
 * Highlights when a todo item is dragged over it (visual drop zone feedback).
 */
export default function Accordion({
  title,
  icon = require("../../../assets/icons/box.png"),
  bgColor = light_grey,
  headerRight,
  stickyTop,
  children,
  listSize,
  listType,
}: AccordionProps): React.ReactElement {
  // Tracks whether the accordion is currently expanded (state for re-renders)
  const [expanded, setExpanded] = useState(false);

  // Stores the measured height of content for animation target
  const [contentHeight, setContentHeight] = useState(0);

  // Ref to track expanded state without causing re-renders (for layout calculations)
  const expandedRef = useRef(false);

  // Ref to the container View for measuring screen position (drop zone registration)
  const containerRef = useRef<View>(null);

  // Get drop zones map to register this accordion as a drop target
  const dropZones = useDropZones();

  // Get active drop zone shared value to check if item is hovering over this accordion
  const activeDropZone = useActiveDropZone();

  // Shared value for animating content height (0 when collapsed, contentHeight when expanded)
  const animatedHeight = useSharedValue(0);

  // Shared value for animating chevron rotation (0 = down, 1 = up/180°)
  const rotation = useSharedValue(0);

  /**
   * Registers this accordion's screen position as a drop zone.
   * Called on layout to track where the accordion is located,
   * allowing dragged items to detect when they're over this zone.
   */
  const registerBounds = () => {
    // measureInWindow gives absolute screen position (not relative to parent)
    // This can be directly compared against finger position during drag
    containerRef.current?.measureInWindow((x, y, width, height) => {
      // Store this accordion's bounds in the shared drop zones map
      dropZones.current[listType] = { y, height, listType };
    });
  };

  /**
   * Measures the content height whenever it changes (children added/removed).
   * Updates contentHeight state and re-animates if currently expanded.
   */
  const onContentLayout = (event: LayoutChangeEvent) => {
    // Get the measured height from the layout event
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      // Store height for future expand/collapse animations
      setContentHeight(height);

      // If currently expanded, animate to the new height to prevent clipping
      if (expandedRef.current) {
        animatedHeight.value = withTiming(height, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.4, 0, 0.2, 1), // Smooth easing curve
        });
      }
    }
  };

  /**
   * Toggles the accordion between expanded and collapsed states.
   * Animates height and chevron rotation with smooth timing.
   */
  const toggle = () => {
    // Calculate new expanded state
    const willExpand = !expanded;

    // Update both state and ref (ref avoids re-renders in layout calculations)
    setExpanded(willExpand);
    expandedRef.current = willExpand;

    // Shared animation settings for smooth, consistent motion
    const timingConfig = {
      duration: ANIMATION_DURATION, // 300ms
      easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design standard easing
    };

    // Animate height: 0 (collapsed) to contentHeight (expanded)
    animatedHeight.value = withTiming(
      willExpand ? contentHeight : 0,
      timingConfig,
    );

    // Animate chevron rotation: 0° (down) to 180° (up)
    rotation.value = withTiming(willExpand ? 1 : 0, timingConfig);
  };

  /**
   * Animated style for the content container.
   * Animates height to smoothly expand/collapse, with overflow hidden to clip content.
   */
  const bodyStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value, // Animated height value (0 to contentHeight)
    overflow: "hidden", // Clip content that exceeds current height
  }));

  /**
   * Animated style for the chevron icon.
   * Rotates from pointing down (0°) to pointing up (180°) when expanded.
   */
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }], // 0 or 180 degrees
  }));

  // Highlights the accordion when an item is hovering over it during drag
  const containerStyle = useAnimatedStyle(() => {
    // Check if a todo item is currently being dragged over this accordion
    const isHovered = activeDropZone.value === listType;
    return {
      // Animate background color: white normally, light red/blue when hovered
      backgroundColor: withTiming(
        isHovered
          ? // interpolateColor smoothly transitions from white to hover color
            interpolateColor(
              1, // Progress value (1 = fully transitioned)
              [0, 1], // Input range
              // Output range: white to light red (trash) or light blue (lists)
              [
                "#FFFFFF",
                listType === "trash" ? HOVER_BG_TRASH : HOVER_BG_LIST,
              ],
            )
          : "#FFFFFF", // Not hovered: white background
        { duration: 200 }, // Smooth 200ms transition
      ),
      // Animate border radius: 0 normally, 12 when hovered (rounded corners)
      borderRadius: withTiming(isHovered ? 12 : 0, { duration: 200 }),
      // Animate border width: 0 normally, 2 when hovered (visible border)
      borderWidth: withTiming(isHovered ? 2 : 0, { duration: 200 }),
      // Border color: red for trash, blue for regular lists
      borderColor:
        listType === "trash" ? BORDER_COLOR_TRASH : BORDER_COLOR_LIST,
    };
  });

  return (
    // Main container with animated hover styles (background, border, radius)
    <Animated.View
      ref={containerRef}
      style={[styles.container, containerStyle]}
      // Register this accordion's position as a drop zone on layout
      onLayout={registerBounds}
    >
      {/* Header row with pill button and optional right component */}
      <View style={styles.headerRow}>
        {/* Pill-shaped header button that toggles expand/collapse */}
        <Pressable
          style={({ pressed }) => [
            styles.pill, // Base pill shape and padding
            { backgroundColor: bgColor }, // Custom background color (light_grey or coral_red)
            pressed && styles.pillPressed, // Reduce opacity when pressed
          ]}
          onPress={toggle}
        >
          {/* List icon (brain, sun, upcoming, box, trash) */}
          <Image source={icon} style={styles.icon} />

          {/* Accordion title text */}
          <Text style={styles.title}>{title}</Text>

          {/* Item count badge (number of todos in this list) */}
          <Text>({String(listSize)})</Text>

          {/* Animated chevron that rotates when expanded/collapsed */}
          <Animated.View style={chevronStyle}>
            <Entypo name="chevron-down" size={18} color="#555" />
          </Animated.View>
        </Pressable>

        {/* Optional right component (e.g., PlusButton) */}
        {headerRight}
      </View>

      {/* Hidden measurer: invisible clone of content that measures height for animation */}
      {/* This stays rendered even when collapsed so it can re-measure when children change */}
      {/* The measured height tells the animation how tall to expand to */}
      <ItemPositionProvider>
        {/* Invisible measurer view (opacity: 0, position: absolute) */}
        <View style={styles.measurer} onLayout={onContentLayout}>
          <View style={styles.content}>
            {/* Sticky top component (e.g., AddTodoRow) */}
            {stickyTop}
            {/* Accordion children (usually TodoItem components) */}
            {children}
          </View>
        </View>

        {/* Visible animated content that expands/collapses */}
        <Animated.View style={bodyStyle}>
          <View style={styles.content}>
            {/* Sticky top component (e.g., AddTodoRow) */}
            {stickyTop}
            {/* Accordion children (usually TodoItem components) */}
            {children}
          </View>
        </Animated.View>
      </ItemPositionProvider>
    </Animated.View>
  );
}

// Styles for Accordion component layout
const styles = StyleSheet.create({
  // Main container style for the accordion
  container: {
    width: "100%", // Full width of parent
  },
  // Header row containing pill button and optional right component
  headerRow: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center", // Vertically center items
    justifyContent: "space-between", // Space between pill and right component
  },
  // Pill-shaped button style for accordion header
  pill: {
    flexDirection: "row", // Horizontal layout for icon, title, count, chevron
    alignItems: "center", // Vertically center all elements
    alignSelf: "flex-start", // Don't stretch to full width
    paddingHorizontal: 14, // Horizontal padding inside pill
    paddingVertical: 8, // Vertical padding inside pill
    borderRadius: 20, // Rounded pill shape
    gap: 6, // Space between icon, title, count, and chevron
  },
  // Style applied when pill is pressed (visual feedback)
  pillPressed: {
    opacity: 0.7, // Reduce opacity to show press state
  },
  // Icon style for list icons
  icon: {
    width: 20, // Icon width
    height: 20, // Icon height
  },
  // Title text style for accordion header
  title: {
    fontFamily: "BalsamiqSans-Regular", // Custom handwritten font
    fontSize: 16, // Readable font size
    color: "#1a1a1a", // Dark gray text
  },
  // Content container style (for both measurer and visible content)
  content: {
    paddingTop: 10, // Top padding to separate from header
  },
  // Hidden measurer style (invisible clone for height measurement)
  measurer: {
    position: "absolute", // Don't affect layout
    left: 0, // Align to left edge
    right: 0, // Align to right edge
    opacity: 0, // Invisible (but still rendered for measurement)
  },
});
