// FabButton — floating action button that sits above the native tab bar.
// NativeTabs renders outside the JS view hierarchy, so we manually account for
// the iOS tab bar height (49px, a fixed OS constant) + safe area bottom inset.
import { brand, white } from "@/utils/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// iOS native tab bar is always 49px tall — this is a fixed OS constant
const IOS_TAB_BAR_HEIGHT = 49;

interface FabButtonProps {
  onPress: () => void;
}

export default function FabButton({
  onPress,
}: FabButtonProps): React.ReactElement {
  // insets.bottom = home indicator height (≈34px on modern iPhones, 0 on older ones)
  const insets = useSafeAreaInsets();

  // Total offset = tab bar + home indicator + 16px breathing room above the tab bar
  const bottomOffset = IOS_TAB_BAR_HEIGHT + insets.bottom + 16;

  const handlePress = async () => {
    // Trigger a light physical "tap" sensation
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Call the original onPress passed via props
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.fabutton, { bottom: bottomOffset }]}
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
    right: 16,
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
