// TodayScheduleSheet — bottom sheet shown when a task is dropped onto the Today list.
// Similar to AddTaskSheet: editable title and description inputs, plus scheduling
// chips (Anytime / Pick Time). Tapping "Pick Time" reveals an inline spinner picker.
// On Android the system time dialog opens instead.
// Confirming commits the drop with edited text and scheduling metadata;
// cancelling aborts the move entirely.

import { brand, light_surface } from "@/utils/colors";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";

// Props the parent must supply to drive this sheet
interface TodayScheduleSheetProps {
  visible: boolean; // Whether the sheet is open
  taskTitle: string; // Initial task title — pre-filled, editable
  taskDescription: string; // Initial task description — pre-filled, editable
  // Called when user presses Confirm; provides edited text, chosen time, and slot
  onConfirm: (
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: "anytime" | "morning" | "afternoon" | "evening",
  ) => void;
  onCancel: () => void; // Called when user cancels or taps the backdrop
}

/**
 * Converts a Date object's time to the correct time-of-day bucket.
 * Used to categorise a task into the appropriate section on the Today screen.
 *  5:00 AM – 11:59 AM → "morning"
 * 12:00 PM –  4:59 PM → "afternoon"
 *  5:00 PM – 11:59 PM → "evening"  (includes late-night picks before 5 AM)
 */
function resolveTimeSlot(date: Date): "morning" | "afternoon" | "evening" {
  // Convert the time to total minutes past midnight for easy range comparison
  const totalMinutes = date.getHours() * 60 + date.getMinutes();

  if (totalMinutes >= 300 && totalMinutes < 720) {
    // 300 min = 5:00 AM, 720 min = 12:00 PM — morning window
    return "morning";
  }
  if (totalMinutes >= 720 && totalMinutes < 1020) {
    // 720 min = 12:00 PM, 1020 min = 5:00 PM — afternoon window
    return "afternoon";
  }
  // Everything else (5:00 PM onwards, and 12:00 AM – 4:59 AM) = evening
  return "evening";
}

/**
 * Formats a Date into a 12-hour time string like "3:10 PM".
 * Used to display the picked time on the Pick Time chip label.
 */
function formatTime(date: Date): string {
  const hours = date.getHours(); // 0–23
  const minutes = date.getMinutes(); // 0–59
  const h12 = hours % 12 || 12; // Convert to 12-hour; 0 becomes 12
  const mm = minutes.toString().padStart(2, "0"); // Zero-pad minutes
  const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
  return `${h12}:${mm} ${ampm}`;
}

/**
 * TodayScheduleSheet renders the scheduling bottom sheet.
 * Follows the same pattern as AddTaskSheet — editable title/description inputs
 * at the top, with scheduling controls (chip row + inline spinner) below.
 * All state resets when the sheet reopens so each task starts fresh.
 */
export default function TodayScheduleSheet({
  visible,
  taskTitle,
  taskDescription,
  onConfirm,
  onCancel,
}: TodayScheduleSheetProps): React.ReactElement {
  // Editable title — pre-filled from the dragged task
  const [title, setTitle] = React.useState(taskTitle);

  // Editable description — pre-filled from the dragged task
  const [description, setDescription] = React.useState(taskDescription);

  // Which chip is selected — defaults to "anytime" every time the sheet opens
  const [selection, setSelection] = React.useState<"anytime" | "picktime">(
    "anytime",
  );

  // The Date the user has picked; defaults to now, updated by the spinner
  const [pickedTime, setPickedTime] = React.useState<Date>(new Date());

  // Ref to auto-focus the title input when the sheet mounts
  const titleRef = React.useRef<TextInput>(null);

  // Reset all local state every time the sheet opens with fresh task data
  React.useEffect(() => {
    if (visible) {
      setTitle(taskTitle); // Pre-fill from the dragged task
      setDescription(taskDescription); // Pre-fill from the dragged task
      setSelection("anytime"); // Default chip back to Anytime
      setPickedTime(new Date()); // Reset time to now

      // Auto-focus the title input after a short delay so the Modal has time to mount
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer); // Clean up if sheet closes before timer fires
    }
  }, [visible, taskTitle, taskDescription]);

  /**
   * Opens the Android native time picker dialog imperatively.
   * Not used on iOS — iOS shows the inline spinner in the JSX below.
   */
  function openAndroidTimePicker() {
    DateTimePickerAndroid.open({
      value: pickedTime, // Start at the current picked time
      mode: "time", // Show time picker, not date
      is24Hour: false, // Use 12-hour AM/PM format
      onChange: (_event, selectedDate) => {
        // selectedDate is undefined if the user tapped Cancel on Android
        if (selectedDate) {
          setPickedTime(selectedDate); // Store the chosen time
        }
      },
    });
  }

  /**
   * Handles the Confirm button press.
   * Derives scheduledTime (HH:MM string or null) and timeSlot from the selection,
   * then passes edited text and scheduling data up to the parent.
   */
  function handleConfirm() {
    if (!title.trim()) return; // Don't submit with empty title

    if (selection === "anytime") {
      // No specific time — categorised as "Anytime" on the Today screen
      onConfirm(title.trim(), description.trim(), null, "anytime");
      return;
    }

    // "Pick Time" — derive the slot and format the time string from pickedTime
    const timeSlot = resolveTimeSlot(pickedTime);
    const hh = pickedTime.getHours().toString().padStart(2, "0"); // Zero-pad hours
    const mm = pickedTime.getMinutes().toString().padStart(2, "0"); // Zero-pad minutes
    onConfirm(title.trim(), description.trim(), `${hh}:${mm}`, timeSlot);
  }

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        {/* Editable title input — pre-filled from dragged task, auto-focused */}
        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          placeholder="Task title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Editable description input — pre-filled, multiline */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description"
          placeholderTextColor="#BBB"
          value={description}
          onChangeText={setDescription}
          multiline // Allows multiple lines for longer descriptions
        />

        {/* Thin horizontal rule separating text inputs from scheduling controls */}
        <View style={styles.divider} />

        {/* Chip row — Anytime pill on left, Pick Time pill on right */}
        <View style={styles.chipRow}>
          {/* "Anytime" chip — selected by default */}
          <Pressable
            style={[
              styles.chip,
              selection === "anytime" && styles.chipSelected, // Blue fill when active
            ]}
            onPress={() => setSelection("anytime")} // Switch to Anytime
          >
            <Text
              style={[
                styles.chipText,
                selection === "anytime" && styles.chipTextSelected,
              ]}
            >
              Anytime
            </Text>
          </Pressable>

          {/* "Pick Time" chip — tapping it selects and on Android opens the system dialog */}
          <Pressable
            style={[
              styles.chip,
              selection === "picktime" && styles.chipSelected, // Blue fill when active
            ]}
            onPress={() => {
              setSelection("picktime"); // Switch chip selection
              // On Android, open the native time dialog immediately
              if (Platform.OS === "android") {
                openAndroidTimePicker();
              }
            }}
          >
            <Text
              style={[
                styles.chipText,
                selection === "picktime" && styles.chipTextSelected,
              ]}
            >
              {/* Show formatted time when a time has been picked, otherwise show label */}
              {selection === "picktime" ? formatTime(pickedTime) : "Pick Time"}
            </Text>
          </Pressable>
        </View>

        {/* Inline iOS spinner — shown below chips when "Pick Time" is selected.
            display="spinner" renders the drum-roll wheels directly in the layout. */}
        {selection === "picktime" && Platform.OS === "ios" ? (
          <DateTimePicker
            value={pickedTime} // The current time shown on the spinner wheels
            mode="time" // Time picker only
            display="spinner" // Inline drum-roll wheels rendered in the layout
            onChange={(_event, selectedDate) => {
              // Fires as the user scrolls the spinner wheels
              if (selectedDate) {
                setPickedTime(selectedDate); // Update the picked time
              }
            }}
          />
        ) : null}

        {/* Bottom row — Cancel on the left, Confirm (send) on the right */}
        <View style={styles.bottomRow}>
          {/* Cancel button — outlined style, aborts the drop */}
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          {/* Confirm button — filled blue, commits the drop with scheduling data */}
          <Pressable
            style={[
              styles.confirmButton,
              !title.trim() && styles.confirmButtonDisabled, // Dim when title is empty
            ]}
            onPress={handleConfirm}
            disabled={!title.trim()} // Prevent submitting empty title
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
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
    marginBottom: 8,
  },
  // Thin horizontal rule between text inputs and scheduling controls
  divider: {
    height: StyleSheet.hairlineWidth, // 0.5px on most screens — visually subtle
    backgroundColor: "#E5E5EA",
    marginVertical: 12,
  },
  // Row that holds the two chip pills side by side
  chipRow: {
    flexDirection: "row",
    gap: 10, // Space between chips
    marginBottom: 12,
    alignItems: "center",
  },
  // Base pill chip style — outlined by default
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100, // Fully rounded pill shape
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    backgroundColor: "#F2F2F7", // Subtle grey fill when unselected
    justifyContent: "center",
    alignItems: "center",
  },
  // Active/selected chip overrides — blue fill, no border
  chipSelected: {
    backgroundColor: brand, // App brand blue
    borderColor: brand,
  },
  // Base chip label text — dark grey when unselected
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C3C43",
  },
  // Active chip label text — white for contrast on blue background
  chipTextSelected: {
    color: "#FFFFFF",
  },
  // Bottom row — Cancel and Confirm buttons side by side
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingVertical: 8,
  },
  // Cancel button — outlined, flexible width to fill remaining space
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3C3C43",
  },
  // Confirm button — filled brand blue
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: brand,
    alignItems: "center",
    justifyContent: "center",
  },
  // Dimmed confirm button when title is empty
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
