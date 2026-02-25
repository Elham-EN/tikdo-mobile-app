// EditTodayTaskSheet — bottom sheet for editing a Today-list task.
// Opens when the user taps (no hold) a task in any Today section.
// Pre-fills title, description, and the current scheduling choice (Anytime / specific time).
// Confirming saves all edited values including any scheduling changes;
// cancelling discards changes and leaves the task unchanged.

import { brand, light_surface } from "@/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
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

// Props the parent supplies to drive this sheet
interface EditTodayTaskSheetProps {
  visible: boolean; // Whether the sheet is open
  taskTitle: string; // Current task title — pre-filled in the title input
  taskDescription: string; // Current description — pre-filled in the description input
  // Current scheduling state — "anytime" maps to the Anytime chip;
  // any other slot means Pick Time is pre-selected with the stored time
  currentTimeSlot?: "anytime" | "morning" | "afternoon" | "evening";
  currentScheduledTime?: string | null; // "HH:MM" 24-hour string or null for Anytime
  // Called when user confirms; provides updated text and scheduling data
  onConfirm: (
    title: string,
    description: string,
    scheduledTime: string | null,
    timeSlot: "anytime" | "morning" | "afternoon" | "evening",
  ) => void;
  onCancel: () => void; // Called when user cancels or taps the backdrop
  onDelete: () => void; // Called when user taps the delete button — removes the task permanently
}

/**
 * Converts a Date's time to the correct Today time-slot bucket.
 *  5:00 AM – 11:59 AM → "morning"
 * 12:00 PM –  4:59 PM → "afternoon"
 *  5:00 PM onwards   → "evening"
 */
function resolveTimeSlot(date: Date): "morning" | "afternoon" | "evening" {
  // Convert to total minutes past midnight for range comparison
  const totalMinutes = date.getHours() * 60 + date.getMinutes();

  if (totalMinutes >= 300 && totalMinutes < 720) {
    // 5:00 AM – 11:59 AM
    return "morning";
  }
  if (totalMinutes >= 720 && totalMinutes < 1020) {
    // 12:00 PM – 4:59 PM
    return "afternoon";
  }
  // 5:00 PM onwards (and midnight – 4:59 AM) = evening
  return "evening";
}

/**
 * Formats a Date to a readable 12-hour string like "3:10 PM".
 * Used as the label on the Pick Time chip after the user picks a time.
 */
function formatTime(date: Date): string {
  return format(date, "h:mm a"); // e.g. "3:10 PM"
}

/**
 * Parses a stored "HH:MM" string into a Date object for the time picker.
 * Returns a new Date (today + the stored hours/minutes) so the picker
 * opens at the right position.
 */
function parseStoredTime(scheduledTime: string): Date {
  // date-fns parse sets hours and minutes on today's date
  return parse(scheduledTime, "HH:mm", new Date());
}

/**
 * EditTodayTaskSheet renders the full edit sheet for Today-list tasks.
 * Includes title and description inputs plus the Anytime / Pick Time chip row
 * so the user can also change the scheduling while editing the text.
 * All state resets to the current task's data whenever the sheet opens.
 */
export default function EditTodayTaskSheet({
  visible,
  taskTitle,
  taskDescription,
  currentTimeSlot,
  currentScheduledTime,
  onConfirm,
  onCancel,
  onDelete,
}: EditTodayTaskSheetProps): React.ReactElement {
  // Editable title — reset from prop each time the sheet opens
  const [title, setTitle] = React.useState(taskTitle);

  // Editable description — reset from prop each time the sheet opens
  const [description, setDescription] = React.useState(taskDescription);

  // Which chip is active: "anytime" or "picktime"
  // Derives from the task's current timeSlot — anytime maps to "anytime", others to "picktime"
  const [selection, setSelection] = React.useState<"anytime" | "picktime">(
    currentTimeSlot === "anytime" || !currentTimeSlot ? "anytime" : "picktime",
  );

  // The Date used by the time picker — initialised to the stored scheduled time
  // or falls back to the current time when no specific time was set
  const [pickedTime, setPickedTime] = React.useState<Date>(() => {
    if (currentScheduledTime) {
      return parseStoredTime(currentScheduledTime); // Restore the previously picked time
    }
    return new Date(); // Fallback to now when no stored time exists
  });

  // Ref to auto-focus the title input when the sheet mounts
  const titleRef = React.useRef<TextInput>(null);

  // Reset all local state whenever the sheet opens with task data.
  // Ensures the inputs always show the tapped task's current values.
  React.useEffect(() => {
    if (visible) {
      setTitle(taskTitle); // Restore title from task
      setDescription(taskDescription); // Restore description from task

      // Pre-select the chip that matches the task's current scheduling state
      const isPickTime =
        currentTimeSlot !== undefined &&
        currentTimeSlot !== "anytime" &&
        currentScheduledTime != null;
      setSelection(isPickTime ? "picktime" : "anytime");

      // Restore the picker position to the stored time, or fall back to now
      if (currentScheduledTime) {
        setPickedTime(parseStoredTime(currentScheduledTime));
      } else {
        setPickedTime(new Date());
      }

      // Auto-focus the title input after the Modal has time to mount
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer); // Clean up if sheet closes before timer fires
    }
  }, [
    visible,
    taskTitle,
    taskDescription,
    currentTimeSlot,
    currentScheduledTime,
  ]);

  /**
   * Opens the Android native time picker imperatively.
   * iOS shows the inline spinner in the JSX below instead.
   */
  function openAndroidTimePicker() {
    DateTimePickerAndroid.open({
      value: pickedTime, // Start picker at the currently selected time
      mode: "time", // Show time picker, not date picker
      is24Hour: false, // Use 12-hour AM/PM format
      onChange: (_event, selectedDate) => {
        // selectedDate is undefined when user taps Cancel on Android
        if (selectedDate) {
          setPickedTime(selectedDate); // Store the newly chosen time
        }
      },
    });
  }

  /**
   * Handles the Confirm button press.
   * Derives scheduledTime and timeSlot from the current selection,
   * then passes all edited values up to the parent to save.
   */
  function handleConfirm() {
    if (!title.trim()) return; // Block empty title from being saved

    if (selection === "anytime") {
      // No specific time — task stays/moves to the Anytime section
      onConfirm(title.trim(), description.trim(), null, "anytime");
      return;
    }

    // Pick Time — compute slot from the picked time and build the "HH:MM" string
    const timeSlot = resolveTimeSlot(pickedTime);
    const hh = pickedTime.getHours().toString().padStart(2, "0"); // Zero-pad hours
    const mm = pickedTime.getMinutes().toString().padStart(2, "0"); // Zero-pad minutes
    onConfirm(title.trim(), description.trim(), `${hh}:${mm}`, timeSlot);
  }

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        {/* Drag handle at the top — standard iOS bottom sheet visual cue */}
        <View style={styles.handle} />

        {/* Section label so the user knows they are editing */}
        <Text style={styles.sectionLabel}>Edit Task</Text>

        {/* Title input — large and auto-focused when sheet opens */}
        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          placeholder="Task title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Hairline rule between title and description */}
        <View style={styles.divider} />

        {/* Description input — multiline, cursor starts at top on Android */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add a description…"
          placeholderTextColor="#BBB"
          value={description}
          onChangeText={setDescription}
          multiline // Allow wrapping for longer descriptions
        />

        {/* Second divider before the scheduling controls */}
        <View style={styles.divider} />

        {/* Chip row — Anytime and Pick Time side by side */}
        <View style={styles.chipRow}>
          {/* Anytime chip — no specific time, task goes into the Anytime section */}
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

          {/* Pick Time chip — shows the chosen time as its label once a time is picked */}
          <Pressable
            style={[
              styles.chip,
              selection === "picktime" && styles.chipSelected, // Blue fill when active
            ]}
            onPress={() => {
              setSelection("picktime"); // Switch chip to pick-time mode
              // On Android open the native time dialog immediately
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
              {/* Show the formatted time once a time is chosen, else show label */}
              {selection === "picktime" ? formatTime(pickedTime) : "Pick Time"}
            </Text>
          </Pressable>
        </View>

        {/* Inline iOS spinner — only rendered when Pick Time is selected on iOS.
            display="spinner" puts the drum-roll wheels directly in the layout. */}
        {selection === "picktime" && Platform.OS === "ios" ? (
          <DateTimePicker
            value={pickedTime} // Current position of the spinner wheels
            mode="time" // Time picker only
            display="spinner" // Inline drum-roll rendered in the sheet
            onChange={(_event, selectedDate) => {
              // Fires continuously as the user scrolls the wheels
              if (selectedDate) {
                setPickedTime(selectedDate); // Track the live selection
              }
            }}
          />
        ) : null}

        {/* Bottom action row — Cancel on left, Confirm on right */}
        <View style={styles.bottomRow}>
          {/* Delete button — red circle with trash icon, permanently removes the task */}
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-bin" size={22} color="#fff" />
          </Pressable>
          <View style={styles.bottomRowRight}>
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
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Sheet content wrapper — white background, rounded top corners, generous padding
  container: {
    backgroundColor: light_surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  // Standard iOS sheet handle — short rounded bar at the top centre
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginBottom: 16,
  },
  // Small uppercase label at the top of the form
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Title input — large prominent text, no border
  titleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    paddingVertical: 4,
  },
  // Hairline rule between sections
  divider: {
    height: StyleSheet.hairlineWidth, // ~0.5px
    backgroundColor: "#E5E5EA",
    marginVertical: 12,
  },
  // Description input — smaller, multiline
  descriptionInput: {
    fontSize: 15,
    color: "#3C3C43",
    paddingVertical: 4,
    minHeight: 60, // Gives the user comfortable editing room
    textAlignVertical: "top", // Android: start cursor at top
  },
  // Row holding the two scheduling chips
  chipRow: {
    flexDirection: "row",
    gap: 10, // Space between chips
    marginBottom: 8,
    alignItems: "center",
  },
  // Base chip — outlined grey pill
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100, // Fully rounded pill
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    backgroundColor: "#F2F2F7", // Subtle grey background when unselected
    justifyContent: "center",
    alignItems: "center",
  },
  // Selected chip override — brand blue fill
  chipSelected: {
    backgroundColor: brand,
    borderColor: brand,
  },
  // Chip label text — dark when unselected
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C3C43",
  },
  // Chip label text — white on blue background when selected
  chipTextSelected: {
    color: "#FFFFFF",
  },
  // Bottom row pushes buttons to the right edge
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  bottomRowRight: {
    flexDirection: "row",
    gap: 12,
  },
  // Cancel button — grey circle
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  // Confirm button — brand-blue circle
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DA3D20",
    alignItems: "center",
    justifyContent: "center",
  },
  // Dimmed confirm when title is empty
  confirmButtonDisabled: {
    opacity: 0.4,
  },
});
