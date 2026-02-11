/**
 * Bottom sheet form for creating a new task with title, description,
 * and quick-action chips (date, priority, reminders).
 */

import { coral_red, light_chip, light_surface, white } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "./ui/BottomSheet";
import Chip from "./ui/Chip";

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTaskSheet({
  visible,
  onClose,
}: AddTaskSheetProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) {
      setTitle("");
      setNote("");
    }
  }, [visible]);

  const handleSend = () => {
    // TODO: handle task creation
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
        {/* Title Input */}
        <TextInput
          autoFocus
          style={styles.titleInput}
          placeholder="New Task"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          selectionColor={coral_red}
        />

        {/* Note Input */}
        <TextInput
          style={styles.noteInput}
          placeholder="Description about the new task"
          placeholderTextColor="#bbb"
          value={note}
          onChangeText={setNote}
          multiline
          selectionColor={coral_red}
        />

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
            onPress={handleSend}
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
