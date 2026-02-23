// AddTaskSheet — bottom sheet form for creating a new todo item.
// Contains a title input (auto-focused to open keyboard), description input,
// and a bottom row with inbox selector and send button.
import { lists } from "@/data/data";
import { brand, light_surface } from "@/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import BottomSheet from "./BottomSheet";
import ListPickerDropdown from "./ListPickerDropdown";

interface AddTaskSheetProps {
  visible: boolean; // Whether the sheet is shown
  onClose: () => void; // Called when user dismisses the sheet
}

/**
 * Renders the "Add Task" bottom sheet with title, description, and a send row.
 * Title input auto-focuses so the keyboard slides up with the sheet.
 */
export default function AddTaskSheet({
  visible,
  onClose,
}: AddTaskSheetProps): React.ReactElement {
  // Controlled state for the task title input
  const [title, setTitle] = React.useState("");

  // Controlled state for the task description input
  const [description, setDescription] = React.useState("");

  // Tracks which list the task will be added to (defaults to Inbox)
  const [selectedListId, setSelectedListId] = React.useState(lists[0].listId);

  // Ref to auto-focus the title input when the sheet mounts
  const titleRef = React.useRef<TextInput>(null);

  /**
   * Focuses the title input after a short delay so the Modal has time to mount.
   * Without the delay, focus() fires before the input is laid out and does nothing.
   */
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer); // Clean up if sheet closes before timer fires
    }
  }, [visible]);

  /**
   * Handles the send button press.
   * Clears inputs and closes the sheet after submitting.
   */
  function handleSend() {
    if (!title.trim()) return; // Don't submit empty tasks

    // TODO: actually create the task here
    setTitle(""); // Reset title for next use
    setDescription(""); // Reset description for next use
    setSelectedListId(lists[0].listId); // Reset list to Inbox
    onClose(); // Dismiss the sheet
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Title input — large placeholder text, auto-focused */}
        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          placeholder="e.g., Submit travel form by next Wed p3"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description input — smaller, below the title */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description"
          placeholderTextColor="#BBB"
          value={description}
          onChangeText={setDescription}
          multiline // Allows multiple lines for longer descriptions
        />

        {/* Bottom row — list picker on the left, send button on the right */}
        <View style={styles.bottomRow}>
          {/* List picker dropdown — chip + floating menu */}
          <ListPickerDropdown
            selectedListId={selectedListId}
            onSelect={setSelectedListId}
          />

          {/* Send button — submits the task; blue circle with arrow icon */}
          <Pressable
            style={[
              styles.sendButton,
              !title.trim() && styles.sendButtonDisabled, // Dim when title is empty
            ]}
            onPress={handleSend}
            disabled={!title.trim()} // Prevent submitting empty tasks
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Sheet content container — white background with rounded top corners
  container: {
    backgroundColor: light_surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  // Title input — large text, no border, takes full width
  titleInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1C1C1E",
    paddingVertical: 4,
  },
  // Description input — smaller text below title, subtle styling
  descriptionInput: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 4,
    marginBottom: 16,
  },
  // Bottom row — flexes list picker left and send button right
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  // Send button — circular blue button on the right
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand,
    justifyContent: "center",
    alignItems: "center",
  },
  // Dimmed send button when title is empty
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
