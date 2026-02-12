/**
 * Bottom sheet form for creating a new task with title, description,
 * and quick-action chips (date, priority, reminders).
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

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTaskSheet({
  visible,
  onClose,
}: AddTaskSheetProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [formKey, setFormKey] = useState(0);

  const [addTodoItem] = useAddTodoItemMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTodoFormInputs>({
    resolver: zodResolver(addTodoSchema),
    defaultValues: { title: "", notes: null },
  });

  useEffect(() => {
    if (visible) {
      // Each time the sheet opens, formKey increments, which forces
      // React Native to destroy and recreate the notes TextInput.
      // This avoids the stale placeholder rendering glitch.
      setFormKey((k) => k + 1);
    } else {
      reset();
    }
  }, [visible, reset]);

  const onSubmit = async (data: AddTodoFormInputs) => {
    try {
      const task = await addTodoItem(data).unwrap();
      console.log("Task created:", task);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View
        key={formKey}
        style={[styles.container, { paddingBottom: insets.bottom + 8 }]}
      >
        {/* Title Input */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoFocus
              style={styles.titleInput}
              placeholder="New Task"
              placeholderTextColor="#aaa"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              selectionColor={coral_red}
            />
          )}
          name="title"
        />
        {errors.title && (
          <Text style={{ color: coral_red }}>{errors.title.message}</Text>
        )}

        {/* Note Input */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.noteInput}
              placeholder="Description about the new task"
              placeholderTextColor="#bbb"
              value={value ?? ""}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              selectionColor={coral_red}
            />
          )}
          name="notes"
        />
        {errors.notes && (
          <Text style={{ color: coral_red }}>{errors.notes.message}</Text>
        )}

        {/* Action Chips Row */}
        <View style={styles.chipsRow}>
          <Chip
            title="Date"
            icon={<AntDesign name="calendar" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          <Chip
            title="Priority"
            icon={<AntDesign name="flag" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          <Chip
            title="Reminders"
            icon={<AntDesign name="clock-circle" size={16} color="#666" />}
            bgColor={light_chip}
            textColor="#444"
          />
          <Chip
            icon={<AntDesign name="ellipsis" size={20} color="#666" />}
            bgColor={light_chip}
          />
        </View>

        {/* Bottom Row: Section Selector + Send Button */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.sectionSelector} activeOpacity={0.7}>
            <AntDesign name="inbox" size={16} color="#777" />
            <Text style={styles.sectionText}>Inbox / This new section</Text>
            <AntDesign name="down" size={12} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSubmit(onSubmit, () =>
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: light_surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleInput: {
    fontFamily: "BalsamiqSans-Bold",
    fontSize: 20,
    color: "#1a1a1a",
    paddingVertical: 0,
    marginBottom: 8,
  },
  noteInput: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 16,
    color: "#555",
    paddingVertical: 0,
    marginBottom: 20,
    maxHeight: 80,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionText: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 14,
    color: "#777",
  },
  sendButton: {
    backgroundColor: coral_red,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
