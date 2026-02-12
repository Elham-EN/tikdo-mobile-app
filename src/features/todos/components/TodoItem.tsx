import type { TodoItem as TodoItemType } from "@/features/todos/types";
import { StyleSheet, Text, View } from "react-native";

interface TodoItemProps {
  todo: TodoItemType;
}

export default function TodoItem({ todo }: TodoItemProps) {
  return (
    <View style={styles.todoItem}>
      <View style={styles.checkbox} />
      <View style={styles.todoContent}>
        <Text style={styles.todoTitle}>{todo.title}</Text>
        {todo.notes ? <Text style={styles.todoNotes}>{todo.notes}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    marginRight: 14,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 16,
    color: "#1C1C1E",
  },
  todoNotes: {
    fontFamily: "BalsamiqSans-Regular",

    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
});
