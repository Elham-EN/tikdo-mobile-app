// EditTaskSheet — bottom sheet for editing an Inbox task's title and description.
// Opens when the user taps (no hold) a task in the Inbox list.
// Pre-fills both fields with the current task data so the user can make changes.
// Confirming saves the edited values; cancelling discards any changes.

import { brand, light_surface } from "@/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";

// Props the parent must supply to drive this sheet
interface EditTaskSheetProps {
  visible: boolean; // Whether the sheet is open
  taskTitle: string; // Current title — pre-filled in the title input
  taskDescription: string; // Current description — pre-filled in the description input
  // Called when user confirms edits; provides the updated title and description
  onConfirm: (title: string, description: string) => void;
  onCancel: () => void; // Called when user cancels or taps the backdrop
}

/**
 * EditTaskSheet renders a simple editing sheet for Inbox tasks.
 * Contains only a title input and a description input since Inbox items
 * do not have scheduling data. Both inputs are pre-filled from the task.
 * All state resets whenever the sheet opens with new task data.
 */
export default function EditTaskSheet({
  visible,
  taskTitle,
  taskDescription,
  onConfirm,
  onCancel,
}: EditTaskSheetProps): React.ReactElement {
  // Editable title — initialised from prop and reset each time sheet opens
  const [title, setTitle] = React.useState(taskTitle);

  // Editable description — initialised from prop and reset each time sheet opens
  const [description, setDescription] = React.useState(taskDescription);

  // Ref used to auto-focus the title input when the sheet opens
  const titleRef = React.useRef<TextInput>(null);

  // Sync local state whenever the sheet opens with a (potentially different) task.
  // The setTimeout gives the Modal time to fully mount before focusing.
  React.useEffect(() => {
    if (visible) {
      setTitle(taskTitle); // Pre-fill with the tapped task's title
      setDescription(taskDescription); // Pre-fill with the tapped task's description

      // Auto-focus after a short delay so the Modal has time to mount first
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer); // Clean up if the sheet closes before the timer fires
    }
  }, [visible, taskTitle, taskDescription]);

  /**
   * Handles the Confirm button press.
   * Passes trimmed title and description up to the parent to save.
   */
  function handleConfirm() {
    if (!title.trim()) return; // Prevent saving an empty title
    onConfirm(title.trim(), description.trim()); // Forward the edited values
  }

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        {/* Sheet drag handle — decorative notch at the top */}
        <View style={styles.handle} />

        {/* Section label so the user knows they are editing */}
        <Text style={styles.sectionLabel}>Edit Task</Text>

        {/* Title input — large and prominent, auto-focused on open */}
        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          placeholder="Task title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          returnKeyType="next" // Tapping Return on iOS moves focus to description
        />

        {/* Thin rule separating title from description */}
        <View style={styles.divider} />

        {/* Description input — multiline, no forced length limit in the input itself */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add a description…"
          placeholderTextColor="#BBB"
          value={description}
          onChangeText={setDescription}
          multiline // Allow multiple lines for longer notes
        />

        {/* Bottom action row — Cancel on left, Confirm on right */}
        <View style={styles.bottomRow}>
          {/* Cancel button — grey circle with X icon, discards changes */}
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={22} color="#3C3C43" />
          </Pressable>

          {/* Confirm button — brand-blue circle with checkmark, saves changes */}
          <Pressable
            style={[
              styles.confirmButton,
              !title.trim() && styles.confirmButtonDisabled, // Dim when title is empty
            ]}
            onPress={handleConfirm}
            disabled={!title.trim()} // Prevent submitting with an empty title
          >
            <Ionicons name="checkmark" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Sheet content wrapper — white with rounded top corners and padding
  container: {
    backgroundColor: light_surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    // Tall minimum height so it feels like a proper edit screen
    minHeight: 320,
  },
  // Short rounded bar at the top — standard iOS sheet drag handle visual
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginBottom: 16,
  },
  // Small uppercase label above the title input
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Title input — large text, prominent, no border
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    paddingVertical: 4,
  },
  // Hairline divider between title and description areas
  divider: {
    height: StyleSheet.hairlineWidth, // ~0.5px — visually subtle
    backgroundColor: "#E5E5EA",
    marginVertical: 12,
  },
  // Description input — smaller text, allows multiple lines
  descriptionInput: {
    fontSize: 15,
    color: "#3C3C43",
    paddingVertical: 4,
    minHeight: 80, // Gives the user room to write before the field scrolls
    textAlignVertical: "top", // Android: cursor starts at top not middle
  },
  // Bottom row pushes buttons to the right edge
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  // Cancel — grey circle
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  // Confirm — brand-blue circle
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand,
    alignItems: "center",
    justifyContent: "center",
  },
  // Dimmed confirm when title is empty
  confirmButtonDisabled: {
    opacity: 0.4,
  },
});
