/**
 * Chips are compact elements that represent an input, attribute, or action.
 * Chips allow users to enter information, make selections, filter content,
 * or trigger actions.
 */

import { dark_chip } from "@/utils/colors";
import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ChipProps {
  title?: string;
  icon: ReactNode;
  trailingIcon?: ReactNode; // Optional icon rendered after the title (e.g. chevron)
  bgColor?: string;
  textColor?: string;
  onPress?: () => void;
}

function Chip({
  title,
  icon,
  trailingIcon,
  bgColor = dark_chip,
  textColor = "#ccc",
  onPress,
}: ChipProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: bgColor },
        !title && styles.iconOnly,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {icon}
      {title && (
        <Text style={[styles.chipText, { color: textColor }]}>{title}</Text>
      )}
      {trailingIcon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  iconOnly: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 14,
  },
});

export default Chip;
