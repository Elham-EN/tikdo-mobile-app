import { coral_red, dark_chip, dark_surface, white } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "./ui/BottomSheet";

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
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          selectionColor={coral_red}
        />

        {/* Note Input */}
        <TextInput
          style={styles.noteInput}
          placeholder="Description about the new task"
          placeholderTextColor="#777"
          value={note}
          onChangeText={setNote}
          multiline
          selectionColor={coral_red}
        />

        {/* Action Chips Row */}
        <View style={styles.chipsRow}>
          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <AntDesign name="calendar" size={16} color="#ccc" />
            <Text style={styles.chipText}>Date</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <AntDesign name="flag" size={16} color="#ccc" />
            <Text style={styles.chipText}>Priority</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
            <AntDesign name="clock-circle" size={16} color="#ccc" />
            <Text style={styles.chipText}>Reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chipMore} activeOpacity={0.7}>
            <AntDesign name="ellipsis" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Bottom Row: Section Selector + Send Button */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.sectionSelector} activeOpacity={0.7}>
            <AntDesign name="inbox" size={16} color="#aaa" />
            <Text style={styles.sectionText}>Inbox / This new section</Text>
            <AntDesign name="down" size={12} color="#aaa" />
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
    backgroundColor: dark_surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleInput: {
    fontFamily: "BalsamiqSans-Bold",
    fontSize: 20,
    color: white,
    paddingVertical: 0,
    marginBottom: 8,
  },
  noteInput: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 16,
    color: "#ccc",
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
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: dark_chip,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipMore: {
    backgroundColor: dark_chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 14,
    color: "#ccc",
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
    color: "#aaa",
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
