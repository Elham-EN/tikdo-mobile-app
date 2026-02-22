import { DragGhost, DragList, DragScrollView } from "@/components/Drag";
import FabButton from "@/components/ui/FabButton";
import { lists } from "@/data/data";
import { TaskItem } from "@/types/todoItem.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  tasks: TaskItem[];
}

/**
 * Home screen component that displays todo lists organized in accordions.
 *
 * FAB button: Opens bottom sheet to add new todos
 */
// ─── Inner screen content — needs context so DragScrollView can read scrollViewRef
function InboxScreen({ tasks }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();

  // Returns tasks for a given list, sorted by order field
  function getTasksForList(listId: string): TaskItem[] {
    return tasks
      .filter((task) => task.listId === listId)
      .sort((a, b) => a.order - b.order);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.header}>My Lists</Text>

      {/* DragScrollView pre-wires scrollViewRef, scrollEnabled, and currentScrollY
          from the drag context so auto-scroll and hit-test correction work */}
      <DragScrollView>
        {lists.map((list) => (
          <DragList
            key={list.listId}
            listId={list.listId}
            listName={list.listName}
            listIconLeft={<Ionicons name={list.listIcon} size={24} />}
            tasks={getTasksForList(list.listId)}
          />
        ))}
      </DragScrollView>

      {/* Ghost rendered above everything — outside the ScrollView so it isn't clipped */}
      <DragGhost />
      <FabButton onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-screen container with light background
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  // Screen title at the top
  header: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1C1C1E",
  },
});

export default InboxScreen;
