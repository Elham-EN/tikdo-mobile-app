// TodayScheduleSheet — bottom sheet shown when a task is dropped onto the Today list.
// Displays the task's title and description read-only, then lets the user choose
// "Anytime" or "Pick Time" (with a native time picker).
// Confirming commits the drop with scheduling metadata; cancelling aborts the move.
//
// iOS time picker: uses display="compact" which renders a tappable pill showing the
// selected time. Tapping it opens the native floating drum-roll popover above the chip.
// Android: uses the imperative DateTimePickerAndroid.open() dialog.

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
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";

// Props the parent must supply to drive this sheet
interface TodayScheduleSheetProps {
  visible: boolean; // Whether the sheet is open
  taskTitle: string; // Task title shown read-only at the top
  taskDescription: string; // Task description shown read-only below the title
  // Called when user presses Confirm; provides the chosen time and slot
  onConfirm: (
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
 * TodayScheduleSheet renders the scheduling bottom sheet.
 * The sheet stays open until the user either Confirms or Cancels.
 * All state resets when the sheet reopens so each task starts fresh.
 */
export default function TodayScheduleSheet({
  visible,
  taskTitle,
  taskDescription,
  onConfirm,
  onCancel,
}: TodayScheduleSheetProps): React.ReactElement {
  // Which chip is selected — defaults to "anytime" every time the sheet opens
  const [selection, setSelection] = React.useState<"anytime" | "picktime">(
    "anytime",
  );

  // The Date the user has picked; defaults to now, updated as the user changes the picker
  const [pickedTime, setPickedTime] = React.useState<Date>(new Date());

  // Reset all local state every time the sheet opens so it's always fresh
  React.useEffect(() => {
    if (visible) {
      setSelection("anytime"); // Default chip back to Anytime
      setPickedTime(new Date()); // Reset time to now
    }
  }, [visible]);

  /**
   * Opens the Android native time picker dialog imperatively.
   * Not used on iOS — iOS uses the inline compact DateTimePicker in the JSX.
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
   * then passes them up to the parent to finalise the drop.
   */
  function handleConfirm() {
    if (selection === "anytime") {
      // No specific time — categorised as "Anytime" on the Today screen
      onConfirm(null, "anytime");
      return;
    }

    // "Pick Time" — derive the slot and format the time string from pickedTime
    const timeSlot = resolveTimeSlot(pickedTime);
    const hh = pickedTime.getHours().toString().padStart(2, "0"); // Zero-pad hours
    const mm = pickedTime.getMinutes().toString().padStart(2, "0"); // Zero-pad minutes
    onConfirm(`${hh}:${mm}`, timeSlot); // e.g. "14:30", "afternoon"
  }

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        {/* Drag handle — visual affordance showing the sheet can be dismissed */}
        <View style={styles.handle} />

        {/* Sheet heading */}
        <Text style={styles.sheetTitle}>Schedule for Today</Text>

        {/* Task title displayed read-only — the user cannot edit it here */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {taskTitle}
        </Text>

        {/* Task description — only rendered when non-empty to save vertical space */}
        {taskDescription ? (
          <Text style={styles.taskDescription} numberOfLines={3}>
            {taskDescription}
          </Text>
        ) : null}

        {/* Thin horizontal rule separating task info from scheduling controls */}
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

          {/* "Pick Time" chip — on iOS renders a compact native time picker inline.
              On Android the chip is a plain Pressable that opens the system dialog. */}
          {Platform.OS === "ios" ? (
            // iOS: the chip pill contains a "Pick Time" label on the left and the
            // native compact DateTimePicker on the right. display="compact" renders
            // a tappable time label that opens the native floating drum-roll popover.
            // The picker needs an explicit width so iOS renders the full time label
            // instead of collapsing it to a tiny toggle.
            <View
              style={[
                styles.chip,
                styles.chipRow_ios, // Row layout so label + picker sit side by side
                selection === "picktime" && styles.chipSelected,
              ]}
            >
              {/* Label shown before the user picks a time */}
              <Text
                style={[
                  styles.chipText,
                  selection === "picktime" && styles.chipTextSelected,
                ]}
              >
                {selection === "picktime" ? "" : "Pick Time"}
              </Text>
              <DateTimePicker
                value={pickedTime} // The current time shown in the compact label
                mode="time" // Time picker only
                display="compact" // Compact pill that pops a floating picker on tap
                themeVariant="light" // Keep the label readable on both chip states
                style={styles.iosPickerInline} // Fixed width so iOS renders the time label fully
                onChange={(_event, selectedDate) => {
                  // Fires when the user picks a time in the popover
                  if (selectedDate) {
                    setPickedTime(selectedDate); // Store the chosen time
                    setSelection("picktime"); // Switch chip to Pick Time
                  }
                }}
              />
            </View>
          ) : (
            // Android: plain pressable chip that opens the system time dialog
            <Pressable
              style={[
                styles.chip,
                selection === "picktime" && styles.chipSelected,
              ]}
              onPress={() => {
                setSelection("picktime"); // Switch chip selection
                openAndroidTimePicker(); // Open the Android native time dialog
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selection === "picktime" && styles.chipTextSelected,
                ]}
              >
                {/* Show formatted time after the user picks one */}
                {selection === "picktime"
                  ? `${pickedTime.getHours() % 12 || 12}:${pickedTime.getMinutes().toString().padStart(2, "0")} ${pickedTime.getHours() >= 12 ? "PM" : "AM"}`
                  : "Pick Time"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Bottom button row — Cancel on the left, Confirm on the right */}
        <View style={styles.buttonRow}>
          {/* Cancel button — outlined style, aborts the drop */}
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          {/* Confirm button — filled blue, commits the drop with scheduling data */}
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32, // Extra bottom padding so content clears the home indicator
  },
  // Short horizontal bar at the top of the sheet — standard iOS/Android affordance
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    marginBottom: 16,
  },
  // Bold heading at the top of the sheet
  sheetTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  // Task title — displayed prominently, slightly larger than body text
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  // Task description — smaller, muted colour
  taskDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 4,
  },
  // Thin horizontal rule between task info and scheduling controls
  divider: {
    height: StyleSheet.hairlineWidth, // 0.5px on most screens — visually subtle
    backgroundColor: "#E5E5EA",
    marginVertical: 16,
  },
  // Row that holds the two chip pills side by side
  chipRow: {
    flexDirection: "row",
    gap: 10, // Space between chips
    marginBottom: 16,
    alignItems: "center", // Vertically centre chips even when DateTimePicker changes height
  },
  // iOS-only: makes the Pick Time chip a row so the label and picker sit side by side
  chipRow_ios: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  // Fixed width for the iOS compact DateTimePicker so it renders the full time label
  iosPickerInline: {
    width: 90,
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
  // Bottom row holding Cancel and Confirm buttons
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
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
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
