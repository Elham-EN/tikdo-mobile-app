// Bottom sheet form component for creating new todo items.
// Features a title input, notes input, quick-action chips (date, priority, reminders),
// and section selector. Uses formKey pattern to fix React Native TextInput placeholder bug.
// Validates input with Zod schema and provides haptic feedback on success/error.

/**
 * Bottom sheet form for creating a new task with title, description,
 * and quick-action chips (date, priority, reminders).
 *
 * Implementation Notes:
 * - Uses formKey increment pattern to force TextInput remount on open
 * - This fixes a React Native bug where placeholder text renders stale values
 * - Validates with Zod schema before submission
 * - Provides haptic feedback (success/error) after submission
 */

import BottomSheet from "@/components/ui/BottomSheet";
import Chip from "@/components/ui/Chip";
import {
  addTodoSchema,
  type AddTodoFormInputs,
} from "@/features/todos/schemas/addTodoSchema";
import { useAddTodoItemMutation } from "@/features/todos/todosApi";
import { coral_red, light_chip, light_surface, white } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Props for AddTaskSheet component
interface AddTaskSheetProps {
  // Controls whether the bottom sheet is visible
  visible: boolean;
  // Callback to close the bottom sheet
  onClose: () => void;
}

export default function AddTaskSheet({
  visible,
  onClose,
}: AddTaskSheetProps): React.ReactElement {
  // Get safe area insets to avoid notch/home indicator overlap
  const insets = useSafeAreaInsets();

  // Increments each time sheet opens to force TextInput remount
  // This fixes React Native bug where placeholder text shows stale values
  const [formKey, setFormKey] = useState(0);

  // RTK Query mutation hook for adding new todo items
  const [addTodoItem] = useAddTodoItemMutation();

  // React Hook Form setup with Zod validation
  const {
    control, // Form field controllers
    handleSubmit, // Submit handler wrapper
    reset, // Reset form to default values
    formState: { errors }, // Validation errors
  } = useForm<AddTodoFormInputs>({
    resolver: zodResolver(addTodoSchema), // Zod schema validation
    defaultValues: { title: "", notes: null }, // Initial empty form
  });

  /**
   * Handles sheet open/close lifecycle.
   * On open: increments formKey to force TextInput remount (fixes placeholder bug).
   * On close: resets form to default values (empty).
   */
  useEffect(() => {
    if (visible) {
      // Each time the sheet opens, formKey increments, which forces
      // React Native to destroy and recreate the notes TextInput.
      // This avoids the stale placeholder rendering glitch.
      setFormKey((k) => k + 1);
    } else {
      // Reset form to default values when sheet closes
      reset();
    }
  }, [visible, reset]);

  /**
   * Handles form submission.
   * Validates input, creates todo via API, provides haptic feedback, and closes sheet.
   * On error, triggers error haptic and logs to console.
   */
  const onSubmit = async (data: AddTodoFormInputs) => {
    try {
      // Call mutation to create new todo item via API
      const task = await addTodoItem(data).unwrap();
      console.log("Task created:", task);

      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close the sheet after successful creation
      onClose();
    } catch (error) {
      // Log error to console for debugging
      console.error("Failed to create task:", error);

      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Form container with formKey to force remount on open (fixes placeholder bug) */}
      <View
        key={formKey} // Increments on open to destroy/recreate TextInputs
        style={[styles.container, { paddingBottom: insets.bottom + 8 }]}
      >
        {/* Title Input Field */}
        {/* Controlled title input with auto-focus */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoFocus // Auto-focus when sheet opens
              style={styles.titleInput}
              placeholder="New Task"
              placeholderTextColor="#aaa"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              selectionColor={coral_red} // Red cursor color
            />
          )}
          name="title"
        />
        {/* Display validation error for title field if present */}
        {errors.title && (
          <Text style={{ color: coral_red }}>{errors.title.message}</Text>
        )}

        {/* Controlled notes input with multiline support */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.noteInput}
              placeholder="Description about the new task"
              placeholderTextColor="#bbb"
              value={value ?? ""} // Convert null to empty string for TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              multiline // Allow multiple lines of text
              selectionColor={coral_red} // Red cursor color
            />
          )}
          name="notes"
        />
        {/* Display validation error for notes field if present */}
        {errors.notes && (
          <Text style={{ color: coral_red }}>{errors.notes.message}</Text>
        )}

        {/* Quick Action Chips Row (Date, Priority, Reminders, More) */}
        <View style={styles.chipsRow}>
          {/* Date chip (not functional yet) */}
          <Chip
            title="Date"
            icon={<AntDesign name="calendar" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          {/* Priority chip (not functional yet) */}
          <Chip
            title="Priority"
            icon={<AntDesign name="flag" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          {/* Reminders chip (not functional yet) */}
          <Chip
            title="Reminders"
            icon={<AntDesign name="clock-circle" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          {/* More options chip (not functional yet) */}
          <Chip
            icon={<AntDesign name="ellipsis" size={20} color="#666" />}
            bgColor={light_chip}
          />
        </View>

        {/* Bottom Row: Section Selector + Send Button */}
        <View style={styles.bottomRow}>
          {/* Section selector button (shows current section, not functional yet) */}
          <TouchableOpacity style={styles.sectionSelector} activeOpacity={0.7}>
            <AntDesign name="inbox" size={16} color="#777" />
            <Text style={styles.sectionText}>Inbox / This new section</Text>
            <AntDesign name="down" size={12} color="#777" />
          </TouchableOpacity>

          {/* Send button - submits form and creates todo */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSubmit(
              onSubmit, // Success callback
              // Error callback - triggers error haptic if validation fails
              () =>
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                )
            )}
            activeOpacity={0.7}
          >
            <AntDesign name="arrow-up" size={22} color={white} />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

// Styles for AddTaskSheet component layout
const styles = StyleSheet.create({
  // Main container style for the form
  container: {
    backgroundColor: light_surface, // Light background color
    borderTopLeftRadius: 16, // Rounded top-left corner
    borderTopRightRadius: 16, // Rounded top-right corner
    paddingHorizontal: 20, // Horizontal padding for content spacing
    paddingTop: 24, // Top padding for spacing from sheet edge
  },
  // Title input text style
  titleInput: {
    fontFamily: "BalsamiqSans-Bold", // Bold handwritten font
    fontSize: 20, // Large font size for title
    color: "#1a1a1a", // Dark text color
    paddingVertical: 0, // Remove default vertical padding
    marginBottom: 8, // Small gap before notes input
  },
  // Notes input text style
  noteInput: {
    fontFamily: "BalsamiqSans-Regular", // Regular handwritten font
    fontSize: 16, // Smaller than title
    color: "#555", // Medium gray text
    paddingVertical: 0, // Remove default vertical padding
    marginBottom: 20, // Gap before chips row
    maxHeight: 80, // Limit height to prevent excessive scrolling
  },
  // Row container for action chips
  chipsRow: {
    flexDirection: "row", // Horizontal layout
    alignItems: "center", // Vertically center chips
    gap: 10, // Space between chips
    marginBottom: 20, // Gap before bottom row
  },
  // Bottom row container for section selector and send button
  bottomRow: {
    flexDirection: "row", // Horizontal layout
    justifyContent: "space-between", // Space between left and right items
    alignItems: "center", // Vertically center items
  },
  // Section selector button style
  sectionSelector: {
    flexDirection: "row", // Horizontal layout for icon, text, chevron
    alignItems: "center", // Vertically center items
    gap: 6, // Space between icon, text, and chevron
  },
  // Section selector text style
  sectionText: {
    fontFamily: "BalsamiqSans-Regular", // Regular handwritten font
    fontSize: 14, // Small font size
    color: "#777", // Light gray text
  },
  // Send button style (circular red button with arrow)
  sendButton: {
    backgroundColor: coral_red, // Coral red background
    width: 44, // Circle width
    height: 44, // Circle height
    borderRadius: 22, // Half of width/height to make it circular
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
});
