import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TodoItemProps {
  title: string;
  note?: string;
}

export default function TodoItem({
  title,
  note,
}: TodoItemProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      {note !== undefined ? <Text>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "orange",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 30,
  },
});
