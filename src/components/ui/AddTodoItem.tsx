// AddTaskSheet — bottom sheet form for creating a new todo item.
// Contains a title input (auto-focused to open keyboard), description input,
// and a bottom row with inbox selector and send button.
// When the Today list is selected, scheduling chips (Anytime / Pick Time) appear
// above the bottom row. The send button stays disabled until a chip is chosen.
import { lists } from "@/data/data";
import { TaskItem } from "@/types/todoItem.types";
import { brand, light_surface } from "@/utils/colors";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
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
import ListPickerDropdown from "./ListPickerDropdown";

// The listId for the Today list — used to conditionally show scheduling chips
const TODAY_LIST_ID = "listToday002";

interface AddTaskSheetProps {
  visible: boolean; // Whether the sheet is shown
  onClose: () => void; // Called when user dismisses the sheet
  onAddTask: (task: TaskItem) => void; // Called with the new task when user submits
}

/**
 * Converts a Date's time to a time-of-day bucket string.
 * Mirrors the same logic in TodayScheduleSheet so task lands in the right section.
 */
function resolveTimeSlot(date: Date): "morning" | "afternoon" | "evening" {
  const totalMinutes = date.getHours() * 60 + date.getMinutes(); // Minutes since midnight
  if (totalMinutes >= 300 && totalMinutes < 720) return "morning"; // 5:00 AM – 11:59 AM
  if (totalMinutes >= 720 && totalMinutes < 1020) return "afternoon"; // 12:00 PM – 4:59 PM
  return "evening"; // 5:00 PM onwards
}

/**
 * Formats a Date to a 12-hour readable string e.g. "3:10 PM".
 * Used as the label on the Pick Time chip once the user has scrolled the spinner.
 */
function formatTime(date: Date): string {
  return format(date, "h:mm a"); // h = 12-hour no leading zero, a = AM/PM
}

/**
 * Renders the "Add Task" bottom sheet with title, description, and a send row.
 * Title input auto-focuses so the keyboard slides up with the sheet.
 * When Today is selected, Anytime / Pick Time chips appear and a chip must be
 * chosen before the send button becomes enabled.
 */
export default function AddTaskSheet({
  visible,
  onClose,
  onAddTask,
}: AddTaskSheetProps): React.ReactElement {
  // Controlled state for the task title input
  const [title, setTitle] = React.useState("");

  // Controlled state for the task description input
  const [description, setDescription] = React.useState("");

  // Tracks which list the task will be added to (defaults to first list = Inbox)
  const [selectedListId, setSelectedListId] = React.useState(lists[0].listId);

  // Scheduling chip selection — null means the user hasn't chosen yet (Today only).
  // Must be non-null when Today is selected before the send button enables.
  const [scheduling, setScheduling] = React.useState<
    "anytime" | "picktime" | null
  >(null);

  // The time the user has picked via the spinner; defaults to current time
  const [pickedTime, setPickedTime] = React.useState<Date>(new Date());

  // Ref to auto-focus the title input when the sheet mounts
  const titleRef = React.useRef<TextInput>(null);

  // True when the selected list is the Today list — drives scheduling UI visibility
  const isTodaySelected = selectedListId === TODAY_LIST_ID;

  // Send button is only enabled when:
  // 1. Title is non-empty
  // 2. If Today is selected, a scheduling chip must be chosen
  const canSend =
    title.trim().length > 0 && (!isTodaySelected || scheduling !== null);

  /**
   * Resets all state and auto-focuses the title input each time the sheet opens.
   * Without the reset, a previous session's values would persist on re-open.
   */
  React.useEffect(() => {
    if (visible) {
      setTitle("");
      setDescription("");
      setSelectedListId(lists[0].listId); // Reset to first list (Inbox)
      setScheduling(null); // No scheduling chip chosen yet
      setPickedTime(new Date()); // Reset time to now
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer); // Clean up if sheet closes before timer fires
    }
  }, [visible]);

  /**
   * Handles list selection from the dropdown.
   * When switching away from Today, clears the scheduling chip selection
   * so switching back always starts fresh.
   */
  function handleListSelect(listId: string) {
    setSelectedListId(listId);
    if (listId !== TODAY_LIST_ID) {
      setScheduling(null); // Clear scheduling — irrelevant for non-Today lists
    }
  }

  /**
   * Opens the Android native time picker dialog imperatively.
   * Not used on iOS — iOS shows the inline spinner in the JSX below.
   */
  function openAndroidTimePicker() {
    DateTimePickerAndroid.open({
      value: pickedTime, // Start at the current picked time
      mode: "time", // Show time picker only — no date
      is24Hour: false, // 12-hour AM/PM format
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          setPickedTime(selectedDate); // Store the user's chosen time
        }
      },
    });
  }

  /**
   * Handles the send button press.
   * Builds a TaskItem with scheduling metadata if Today was selected,
   * then passes it up to the parent and closes the sheet.
   */
  function handleSend() {
    if (!canSend) return; // Guard — button should already be disabled

    // Derive scheduling fields — only populated when Today is the target list
    let scheduledTime: string | null = null; // "HH:MM" or null for Anytime
    let timeSlot: TaskItem["timeSlot"] = undefined; // Bucket or undefined for non-Today

    if (isTodaySelected) {
      if (scheduling === "anytime") {
        timeSlot = "anytime"; // No time — task goes into the Anytime section
      } else {
        // "picktime" — compute slot and format the time string from pickedTime
        timeSlot = resolveTimeSlot(pickedTime);
        const hh = pickedTime.getHours().toString().padStart(2, "0"); // Zero-pad hours
        const mm = pickedTime.getMinutes().toString().padStart(2, "0"); // Zero-pad minutes
        scheduledTime = `${hh}:${mm}`; // Store as 24-hour "HH:MM"
      }
    }

    const newTask: TaskItem = {
      taskId: `task_${Date.now()}`, // Unique ID from current timestamp
      listId: selectedListId,
      order: 0, // Placeholder — parent overwrites to insert at the top of the list
      title: title.trim(),
      description: description.trim(),
      scheduledTime, // null for Anytime or non-Today; "HH:MM" when a time was picked
      timeSlot, // undefined for non-Today; bucket string for Today tasks
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Tactile feedback
    onAddTask(newTask); // Hand the task to the parent
    onClose(); // Close the sheet — state resets on next open via the effect above
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

        {/* iOS inline spinner — shown above the bottom row when Pick Time is active on iOS */}
        {isTodaySelected && scheduling === "picktime" && Platform.OS === "ios" ? (
          <DateTimePicker
            value={pickedTime} // Current time shown on the drum-roll wheels
            mode="time" // Time picker only — no date
            display="spinner" // Inline drum-roll rendered in the layout, not a modal
            onChange={(_event, selectedDate) => {
              if (selectedDate) {
                setPickedTime(selectedDate); // Update time as user scrolls the wheels
              }
            }}
          />
        ) : null}

        {/* Bottom row — list picker, scheduling chips (Today only), and send button */}
        <View style={styles.bottomRow}>
          {/* List picker dropdown — chip + floating menu */}
          <ListPickerDropdown
            selectedListId={selectedListId}
            onSelect={handleListSelect}
          />

          {/* Scheduling chips — inline next to the selector, only when Today is selected */}
          {isTodaySelected && (
            <View style={styles.chipRow}>
              {/* Anytime chip — task goes into the Anytime section, no time set */}
              <Pressable
                style={[
                  styles.chip,
                  scheduling === "anytime" && styles.chipSelected, // Blue fill when active
                ]}
                onPress={() => setScheduling("anytime")}
              >
                <Text
                  style={[
                    styles.chipText,
                    scheduling === "anytime" && styles.chipTextSelected,
                  ]}
                >
                  Anytime
                </Text>
              </Pressable>

              {/* Pick Time chip — selects chip and opens time picker */}
              <Pressable
                style={[
                  styles.chip,
                  scheduling === "picktime" && styles.chipSelected, // Blue fill when active
                ]}
                onPress={() => {
                  setScheduling("picktime"); // Mark chip as selected
                  if (Platform.OS === "android") {
                    openAndroidTimePicker(); // Android opens native dialog immediately
                  }
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    scheduling === "picktime" && styles.chipTextSelected,
                  ]}
                >
                  {/* Show formatted time once a time has been picked, otherwise label */}
                  {scheduling === "picktime" ? formatTime(pickedTime) : "Pick Time"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Send button — disabled until title is filled and scheduling is resolved */}
          <Pressable
            style={[
              styles.sendButton,
              !canSend && styles.sendButtonDisabled, // Dim when not ready
            ]}
            onPress={handleSend}
            disabled={!canSend}
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
  // Inline chip group — sits between the list picker and send button in the bottom row
  chipRow: {
    flexDirection: "row",
    gap: 8, // Tight gap between the two chips
    alignItems: "center",
  },
  // Base pill chip style — compact size to fit inline in the bottom row
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100, // Fully rounded pill shape
    borderWidth: 1.5,
    borderColor: "#D1D1D6",
    backgroundColor: "#F2F2F7", // Subtle grey fill when unselected
    justifyContent: "center",
    alignItems: "center",
  },
  // Selected chip override — brand-blue fill and border
  chipSelected: {
    backgroundColor: brand,
    borderColor: brand,
  },
  // Chip label — dark grey when unselected
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C3C43",
  },
  // Chip label — white for contrast on blue background
  chipTextSelected: {
    color: "#FFFFFF",
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
  // Dimmed send button when title is empty or scheduling is not resolved
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
