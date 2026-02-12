import { useGetTodoItemsQuery } from "@/features/todos/todosApi";
import TodoItem from "@/features/todos/components/TodoItem";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Tab() {
  const insets = useSafeAreaInsets();
  const { data: todos = [], isLoading } = useGetTodoItemsQuery();

  const inboxTodos = todos.filter((t) => t.listType === "inbox");
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Today Screen</Text>
      {isLoading ? (
        <Text>Loading todos...</Text>
      ) : (
        inboxTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1C1C1E",
  },
});
