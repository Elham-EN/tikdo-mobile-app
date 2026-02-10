import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";

interface PlusButtonProps {
  onPress: () => void;
}

export default function PlusButton({
  onPress,
}: PlusButtonProps): React.ReactElement {
  const handlePress = async () => {
    // Trigger a light physical "tap" sensation
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Call the original onPress passed via props
    onPress();
  };
  return (
    <TouchableOpacity
      style={[styles.fabutton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <AntDesign name="plus" size={16} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabutton: {
    backgroundColor: "#038ff7",
    width: 30,
    height: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
