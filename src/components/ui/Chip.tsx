/**
 * Chips are compact elements that represent an input, attribute, or action.
 * Chips allow users to enter information, make selections, filter content,
 * or trigger actions.
 */

import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ChipProps {
  title: string;
  icon: ImageSourcePropType;
  bgColor?: string;
}

function Chip({ title, icon, bgColor }: ChipProps): React.ReactElement {
  const styles = StyleSheet.create({
    chip: {
      backgroundColor: bgColor,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      gap: 6,
    },
    chipText: {
      fontFamily: "BalsamiqSans-Regular",
      fontWeight: 400,
      fontSize: 16,
      textAlign: "center",
    },
    chipIcon: {
      width: 24,
      height: 24,
    },
  });
  return (
    <View style={styles.chip}>
      <Image style={styles.chipIcon} source={icon} />
      <Text style={styles.chipText}>{title}</Text>
    </View>
  );
}

export default Chip;
