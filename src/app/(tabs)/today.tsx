// // Today screen displays tasks scheduled for today in a single draggable list.
// // Users can long-press (1 second) to reorder tasks via drag-and-drop.

// import * as Haptics from "expo-haptics";
// import React, { useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import {
//   NestableDraggableFlatList,
//   NestableScrollContainer,
//   RenderItemParams,
//   ScaleDecorator,
// } from "react-native-draggable-flatlist";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// // Task item data structure with title and description
// interface Task {
//   id: string;
//   title: string;
//   description: string;
// }

// // Dummy data for today's tasks
// const TODAY_TASKS: Task[] = [
//   {
//     id: "1",
//     title: "Morning standup meeting",
//     description: "Daily sync with the engineering team at 9:30 AM",
//   },
//   {
//     id: "2",
//     title: "Fix login page bug",
//     description: "Resolve the issue where users get logged out on refresh",
//   },
//   {
//     id: "3",
//     title: "Write unit tests",
//     description: "Add test coverage for the new authentication module",
//   },
//   {
//     id: "4",
//     title: "Reply to client emails",
//     description: "Respond to feedback from the product demo yesterday",
//   },
//   {
//     id: "5",
//     title: "Update project documentation",
//     description: "Add API endpoint details to the developer wiki",
//   },
//   {
//     id: "6",
//     title: "Code review for PR #42",
//     description: "Review the payment integration pull request",
//   },
//   {
//     id: "7",
//     title: "Prepare sprint retrospective",
//     description: "Gather notes and action items for the end-of-sprint retro",
//   },
//   {
//     id: "8",
//     title: "Lunch with design team",
//     description: "Discuss upcoming UI redesign over lunch at 12:30 PM",
//   },
//   {
//     id: "9",
//     title: "Deploy staging build",
//     description: "Push the latest changes to the staging environment for QA",
//   },
//   {
//     id: "10",
//     title: "Plan tomorrow's priorities",
//     description: "Review backlog and pick top tasks for tomorrow",
//   },
// ];

// /**
//  * TaskItemRow renders a single task with title and description.
//  * Supports 1-second long-press to drag for reordering.
//  * Wrapped in ScaleDecorator for a subtle scale-up effect while dragging.
//  *
//  * @param item - The task object containing title and description
//  * @param drag - Function to call on long press to start dragging
//  * @param isActive - Whether this item is currently being dragged
//  */
// function TaskItemRow({
//   item,
//   drag,
//   isActive,
// }: RenderItemParams<Task>): React.ReactElement {
//   return (
//     // ScaleDecorator adds a subtle scale effect when the item is being dragged
//     <ScaleDecorator activeScale={1.03}>
//       <TouchableOpacity
//         onLongPress={drag}
//         disabled={isActive}
//         activeOpacity={0.7}
//         style={[
//           styles.taskItem,
//           // Slightly elevate the item when being dragged
//           isActive && styles.taskItemActive,
//         ]}
//       >
//         {/* Task title - bold and prominent */}
//         <Text style={styles.taskTitle}>{item.title}</Text>
//         {/* Task description - smaller and gray */}
//         <Text style={styles.taskDescription}>{item.description}</Text>
//       </TouchableOpacity>
//     </ScaleDecorator>
//   );
// }

// /**
//  * Today screen component that displays today's tasks in a single draggable list.
//  * Tasks can be reordered by long-pressing and dragging.
//  */
// export default function Today(): React.ReactElement {
//   // Get safe area insets to avoid notch/status bar overlap
//   const insets = useSafeAreaInsets();

//   // Mutable task data so drag reordering persists
//   const [tasks, setTasks] = useState<Task[]>(TODAY_TASKS);

//   return (
//     <View
//       style={[
//         styles.container,
//         { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
//       ]}
//     >
//       {/* Header text */}
//       <Text style={styles.header}>Today</Text>

//       {/* NestableScrollContainer for proper scroll + drag interaction */}
//       <NestableScrollContainer
//         style={styles.scrollView}
//         contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
//       >
//         {/* Single draggable list of today's tasks */}
//         <View style={styles.listContainer}>
//           <NestableDraggableFlatList
//             data={tasks}
//             renderItem={TaskItemRow}
//             keyExtractor={(item) => item.id}
//             onDragEnd={({ data }) => setTasks(data)}
//             onDragBegin={() =>
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
//             }
//             // activationDistance={10}
//             // autoscrollThreshold={80}
//             // autoscrollSpeed={200}
//             // dragItemOverflow={false}
//           />
//         </View>
//       </NestableScrollContainer>
//     </View>
//   );
// }

// // Styles for the today screen layout
// const styles = StyleSheet.create({
//   // Main container with light gray background
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F8F8",
//   },
//   // Header text styling
//   header: {
//     fontSize: 20,
//     fontWeight: "700",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     color: "#1C1C1E",
//   },
//   // Scrollable area
//   scrollView: {
//     flex: 1,
//   },
//   // White card container for the task list
//   listContainer: {
//     marginHorizontal: 16,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   // Individual task item row
//   taskItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5EA",
//     backgroundColor: "#FFFFFF",
//   },
//   // Elevated style when a task item is being dragged
//   taskItemActive: {
//     backgroundColor: "#F0F0F5",
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   // Task title text styling
//   taskTitle: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#1C1C1E",
//     marginBottom: 4,
//   },
//   // Task description text styling
//   taskDescription: {
//     fontSize: 14,
//     color: "#8E8E93",
//     lineHeight: 20,
//   },
// });

import { StyleSheet, Text, View } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
