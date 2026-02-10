import { brand, white } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FabButtonProps {
  onPress: () => void;
}

export default function FabButton({
  onPress,
}: FabButtonProps): React.ReactElement {
  // Use safe area insets to avoid the notch or navigation bar
  const insets = useSafeAreaInsets();

  const handlePress = async () => {
    // Trigger a light physical "tap" sensation
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Call the original onPress passed via props
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.fabutton,
        {
          // Position above the safe area
          bottom: insets.bottom + 80,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <AntDesign name="plus" size={24} color={white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabutton: {
    position: "absolute",
    right: 10,
    backgroundColor: brand,
    width: 60,
    height: 60,
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
