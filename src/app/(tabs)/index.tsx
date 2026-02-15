// Home screen (Inbox tab) that displays all todo lists in accordion format.
// Provides the main interface for viewing, organizing, and dragging todos between lists.
// Wraps everything in DropZoneProvider to enable drag-and-drop functionality.

import Accordion from "@/components/ui/Accordion";
import AddTodoRow from "@/components/ui/AddTodoRow";
import FabButton from "@/components/ui/FabButton";
import PlusButton from "@/components/ui/PlusButton";
import AddTaskSheet from "@/features/todos/components/AddTaskSheet";
import TodoItem from "@/features/todos/components/TodoItem";
import { DropZoneProvider } from "@/features/todos/context/DropZoneContext";
import { useGetTodoItemsQuery } from "@/features/todos/todosApi";
import {
  filterDeletedTodos,
  filterTodosByListType,
} from "@/features/todos/utils/todoFilters";
import { coral_red, light_grey } from "@/utils/colors";
import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Home screen component that displays todo lists organized in accordions.
 *
 * Features:
 * - Receiving Area: Brain Dump (inbox) for unprocessed thoughts
 * - Organize Area: Today, Upcoming, Someday lists for categorized todos
 * - Trash: Deleted items
 * - Drag & drop: Items can be dragged between accordions
 * - FAB button: Opens bottom sheet to add new todos
 */
export default function Index(): React.ReactElement {
  // Get safe area insets to avoid notch/status bar overlap
  const insets = useSafeAreaInsets();

  // Controls visibility of the add task bottom sheet
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  // Fetch all todos from Redux store (RTK Query)
  const { data: todos = [], isLoading } = useGetTodoItemsQuery();

  // Reference to ScrollView for potential programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter todos by list type using utility functions (eliminates repetition)
  const inboxes = filterTodosByListType(todos, "inbox");
  const todayItems = filterTodosByListType(todos, "today");
  const upcomingItems = filterTodosByListType(todos, "upcoming");
  const somedayItems = filterTodosByListType(todos, "someday");

  // Filter deleted items for trash accordion
  const trashedItems = filterDeletedTodos(todos);

  return (
    // DropZoneProvider enables drag-and-drop by tracking accordion positions
    // All accordions register themselves as drop zones within this context
    <DropZoneProvider>
      {/* Main container view */}
      <View style={{ flex: 1 }}>
        {/* Scrollable content area for all accordions */}
        <ScrollView
          ref={scrollViewRef}
          // Padding top to avoid status bar overlap
          style={[styles.container, { paddingTop: insets.top }]}
          contentContainerStyle={[
            styles.scrollContent,
            // Extra 100px bottom padding to ensure FAB doesn't cover last items
            { paddingBottom: insets.bottom + 100 },
          ]}
          // Hide vertical scroll indicator for cleaner UI
          showsVerticalScrollIndicator={false}
        >
          {/* Receiving Area Section: Brain Dump (Inbox) */}
          <View style={styles.section}>
            {/* Section header text */}
            <Text style={styles.headerText}>Receiving Area (Inbox)</Text>

            {/* Brain Dump accordion for unprocessed thoughts */}
            <Accordion
              title="Brain Dump"
              icon={require("../../../assets/icons/brain.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              // Sticky input row at top of accordion for quick adds
              stickyTop={
                <AddTodoRow placeholder="Unprocessed thought - add here" />
              }
              // Number of items in this list (for badge display)
              listSize={inboxes.length}
              // List type identifier for drag-and-drop targeting
              listType="inbox"
            >
              {/* Show loading state while fetching todos */}
              {isLoading ? (
                <Text>Loading todos...</Text>
              ) : (
                // Render each inbox todo item with index for position tracking
                inboxes.map((todo, index) => (
                  <TodoItem key={todo.id} todo={todo} index={index} />
                ))
              )}
            </Accordion>
          </View>

          {/* Organize Section: Today, Upcoming, Someday, Trash */}
          <View style={styles.section}>
            {/* Section header text */}
            <Text style={styles.headerText}>Organize your to-do</Text>
            {/* Today accordion for tasks to complete today */}
            <Accordion
              title="Today"
              icon={require("../../../assets/icons/sun.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={
                <AddTodoRow placeholder="Get it done today - add here" />
              }
              listSize={todayItems.length}
              listType="today"
            >
              {/* Render each today todo item */}
              {todayItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>

            {/* Upcoming accordion for future tasks */}
            <Accordion
              title="Upcoming"
              icon={require("../../../assets/icons/upcoming.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={<AddTodoRow placeholder="Planning ahead - add here" />}
              listSize={upcomingItems.length}
              listType="upcoming"
            >
              {/* Render each upcoming todo item */}
              {upcomingItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>

            {/* Someday accordion for tasks without specific timeline */}
            <Accordion
              title="Someday"
              icon={require("../../../assets/icons/box.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={<AddTodoRow placeholder="Not Sure When? - add here" />}
              listSize={somedayItems.length}
              listType="someday"
            >
              {/* Render each someday todo item */}
              {somedayItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>

            {/* Trash accordion for deleted items (red background) */}
            <Accordion
              title="Trash"
              icon={require("../../../assets/icons/trash.png")}
              bgColor={coral_red}
              stickyTop={<AddTodoRow placeholder="Trashed items here" />}
              listSize={trashedItems.length}
              listType="trash"
            >
              {/* Render each trashed todo item */}
              {trashedItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>
          </View>
        </ScrollView>

        {/* Floating Action Button (FAB) to open add task sheet */}
        <FabButton onPress={() => setIsSheetVisible(true)} />

        {/* Bottom sheet for adding new tasks */}
        <AddTaskSheet
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
        />
      </View>
    </DropZoneProvider>
  );
}

// Styles for the home screen layout
const styles = StyleSheet.create({
  // Main container style for ScrollView
  container: {
    flex: 1, // Fill available space
    paddingHorizontal: 16, // Horizontal padding for content spacing
  },
  // Content container for items inside ScrollView
  scrollContent: {
    gap: 24, // Vertical spacing between sections (Receiving Area, Organize Area)
  },
  // Section container for grouping accordions
  section: {
    gap: 12, // Vertical spacing between section header and accordions
  },
  // Header text style for section titles
  headerText: {
    fontFamily: "BalsamiqSans-Regular", // Custom handwritten font
    fontWeight: "400", // Normal weight
    fontSize: 24, // Large font size for section headers
    textAlign: "center", // Center align section titles
  },
});
