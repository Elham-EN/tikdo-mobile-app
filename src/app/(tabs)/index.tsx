// Home screen (Inbox tab) that displays all todo lists in accordion format.
// Provides the main interface for viewing, organizing, and dragging todos between lists.

import { mutated_apricot } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Task item data structure with title and description
interface Task {
  id: string;
  title: string;
  description: string;
}

// Task list category data structure with name and tasks
interface TaskList {
  id: string;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  tasks: Task[];
}

// Dummy data for 5 tasks grouped into categories
const DUMMY_DATA: TaskList[] = [
  {
    id: "1",
    name: "Brain Dump",
    iconName: "archive-outline",
    tasks: [
      {
        id: "1",
        title: "Complete project proposal",
        description: "Finish the Q1 project proposal and submit to management",
      },
      {
        id: "2",
        title: "Review code changes",
        description: "Review pull requests from the development team",
      },
    ],
  },
  {
    id: "2",
    name: "Today",
    iconName: "sunny-outline",
    tasks: [
      {
        id: "3",
        title: "Buy groceries",
        description: "Get milk, eggs, bread, and vegetables from the store",
      },
      {
        id: "4",
        title: "Schedule dentist appointment",
        description: "Call the dentist office to book a checkup appointment",
      },
      {
        id: "5",
        title: "Plan weekend trip",
        description: "Research and plan a weekend getaway to the mountains",
      },
    ],
  },
  {
    id: "3",
    name: "Upcoming",
    iconName: "calendar-number-outline",
    tasks: [
      {
        id: "1",
        title: "Complete project proposal",
        description: "Finish the Q1 project proposal and submit to management",
      },
      {
        id: "2",
        title: "Review code changes",
        description: "Review pull requests from the development team",
      },
    ],
  },
  {
    id: "4",
    name: "Someday",
    iconName: "albums-outline",
    tasks: [
      {
        id: "1",
        title: "Complete project proposal",
        description: "Finish the Q1 project proposal and submit to management",
      },
      {
        id: "2",
        title: "Review code changes",
        description: "Review pull requests from the development team",
      },
    ],
  },
];

/**
 * TaskItemRow component displays a single task with title and description.
 * Shows task metadata in a clean, readable format.
 *
 * @param task - The task object containing title and description
 */
function TaskItemRow({ task }: { task: Task }): React.ReactElement {
  return (
    <View style={styles.taskItem}>
      {/* Task title - bold and prominent */}
      <Text style={styles.taskTitle}>{task.title}</Text>
      {/* Task description - smaller and gray */}
      <Text style={styles.taskDescription}>{task.description}</Text>
    </View>
  );
}

/**
 * TaskListView component displays a collapsible list of tasks.
 * Shows list name on left, chevron icon on right to indicate collapse state.
 *
 * @param taskList - The task list object containing name and tasks array
 */
function TaskListView({
  taskList,
}: {
  taskList: TaskList;
}): React.ReactElement {
  // Track whether this list is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(true);
  // Store the measured height of the content
  const [contentHeight, setContentHeight] = useState(0);

  // Animated value for chevron rotation (0 = right/collapsed, 90 = down/expanded)
  const rotation = useSharedValue(90);
  // Animated value for content progress (0 = collapsed, 1 = expanded)
  const progress = useSharedValue(1);

  /**
   * Toggle the expanded/collapsed state of the task list
   * Animates both the chevron rotation and content visibility
   */
  const toggleExpand = () => {
    // Toggle the expanded state
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Animate chevron rotation: 90deg when expanded, 0deg when collapsed
    rotation.value = withTiming(newExpandedState ? 90 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    // Animate content progress: 1 when expanded, 0 when collapsed
    progress.value = withTiming(newExpandedState ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  };

  /**
   * Animated style for chevron icon rotation
   * Smoothly rotates between 0deg (collapsed) and 90deg (expanded)
   */
  const chevronAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  /**
   * Animated style for task items container
   * Animates height and opacity using measured content height
   */
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate height from 0 to measured content height
    const animatedHeight = interpolate(
      progress.value,
      [0, 1],
      [0, contentHeight],
      Extrapolation.CLAMP,
    );

    return {
      // Animate height from 0 to full content height
      height: animatedHeight,
      // Fade opacity from 0 to 1
      opacity: progress.value,
      // Prevent overflow during animation
      overflow: "hidden",
    };
  });

  return (
    <View style={styles.taskListContainer}>
      {/* Header: List name on left, chevron icon on right */}
      <TouchableOpacity
        style={styles.taskListHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* List name text */}
        <View style={styles.listTypeContainer}>
          <Ionicons name={taskList.iconName} size={24} />
          <Text style={styles.taskListName}>{taskList.name}</Text>
        </View>
        {/* Chevron icon with smooth rotation animation */}
        <Animated.View style={chevronAnimatedStyle}>
          <Ionicons name="chevron-forward" size={24} color="#8E8E93" />
        </Animated.View>
      </TouchableOpacity>

      {/* Task items with smooth expand/collapse animation */}
      <Animated.View style={contentAnimatedStyle}>
        <View
          style={styles.taskItemsContainer}
          onLayout={(event) => {
            // Measure the actual height of the content once it renders
            const height = event.nativeEvent.layout.height;
            if (height > 0 && contentHeight !== height) {
              setContentHeight(height);
            }
          }}
        >
          {taskList.tasks.map((task) => (
            <TaskItemRow key={task.id} task={task} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Home screen component that displays todo lists organized in accordions.
 *
 * FAB button: Opens bottom sheet to add new todos
 */
export default function Index(): React.ReactElement {
  // Get safe area insets to avoid notch/status bar overlap
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header text */}
      <Text style={styles.header}>Inbox Screen</Text>

      {/* Scrollable list of task lists, extra bottom padding to clear native tab bar */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
      >
        {DUMMY_DATA.map((taskList) => (
          <TaskListView key={taskList.id} taskList={taskList} />
        ))}
      </ScrollView>
    </View>
  );
}

// Styles for the home screen layout
const styles = StyleSheet.create({
  // Main container with light gray background
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  // Header text styling
  header: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1C1C1E",
  },
  // Scrollable area for task lists
  scrollView: {
    flex: 1,
  },
  // Container for each task list (category)
  taskListContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  // Header row with list name and chevron icon
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },

  // List Type Container
  listTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    backgroundColor: mutated_apricot,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },

  // List name text styling
  taskListName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  // Container for all task items in a list
  taskItemsContainer: {
    paddingTop: 4,
  },
  // Individual task item row
  taskItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  // Task title text styling
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  // Task description text styling
  taskDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
});
