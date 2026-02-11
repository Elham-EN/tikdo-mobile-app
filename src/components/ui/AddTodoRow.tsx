import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AddTodoRowProps {
  placeholder: string;
}

export default function AddTodoRow({
  placeholder,
}: AddTodoRowProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>{placeholder}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  placeholder: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 15,
    color: "#666",
  },
});
