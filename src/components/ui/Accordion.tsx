import { light_grey } from "@/utils/colors";
import { Entypo } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AccordionProps {
  title: string;
  icon?: ImageSourcePropType;
  bgColor?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

const ANIMATION_DURATION = 300;

/**
 * Collapsible accordion with a pill-shaped header and animated expand/collapse.
 *
 * How the animation works:
 * 1. MEASUREMENT PHASE (contentHeight === 0):
 *    - Children are rendered inside an invisible, absolutely-positioned measurer
 *      (full-width via left:0/right:0) so onLayout captures the true content height.
 *    - The Animated.View body has height: undefined (auto) during this phase.
 *
 * 2. READY PHASE (contentHeight > 0):
 *    - The measurer is removed and children render in the normal content wrapper.
 *    - The Animated.View body height is driven by the `animatedHeight` shared value
 *      (starts at 0 = collapsed) with overflow: hidden to clip content.
 *
 * 3. TOGGLE (user taps the pill):
 *    - `animatedHeight` animates from 0 → contentHeight (expand) or back (collapse)
 *      using withTiming + a Material Design bezier curve for smooth motion.
 *    - `rotation` animates 0 → 1, which maps to 0° → 180° on the chevron icon.
 */
export default function Accordion({
  title,
  icon = require("../../../assets/icons/box.png"),
  bgColor = light_grey,
  headerRight,
  children,
}: AccordionProps): React.ReactElement {
  // Track whether the accordion is open or closed
  const [expanded, setExpanded] = useState(false);
  // Stores the measured pixel height of children (captured once on first render)
  const [contentHeight, setContentHeight] = useState(0);

  // Shared values live on the UI thread for 60fps animations without JS bridge delays
  const animatedHeight = useSharedValue(0); // 0 = collapsed, contentHeight = expanded
  const rotation = useSharedValue(0); // 0 = chevron pointing down, 1 = pointing up

  // Called once by the hidden measurer to capture the children's rendered height.
  // Uses paddingTop (not marginTop) on the content wrapper so padding is included
  // in the measurement — margin would be excluded, causing bottom clipping.
  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
    }
  };

  // Toggles expand/collapse and kicks off both animations in parallel
  const toggle = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);

    // Material Design standard easing: fast acceleration, gentle deceleration
    const timingConfig = {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    };

    // Animate body height between 0 (collapsed) and measured content height (expanded)
    animatedHeight.value = withTiming(
      willExpand ? contentHeight : 0,
      timingConfig,
    );
    // Animate chevron rotation: 0 → 1 maps to 0° → 180° in chevronStyle
    rotation.value = withTiming(willExpand ? 1 : 0, timingConfig);
  };

  // Runs on the UI thread each frame — controls the collapsible body height
  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight === 0 ? undefined : animatedHeight.value,
    overflow: "hidden",
  }));

  // Rotates the chevron icon: 0 = ▼ (down/collapsed), 180° = ▲ (up/expanded)
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Header row: pill (left-aligned, self-sizing) + optional right element (e.g. PlusButton) */}
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: bgColor },
            pressed && styles.pillPressed,
          ]}
          onPress={toggle}
        >
          <Image source={icon} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Animated.View style={chevronStyle}>
            <Entypo name="chevron-down" size={18} color="#555" />
          </Animated.View>
        </Pressable>
        {headerRight}
      </View>

      {/* Collapsible body — height animated between 0 and contentHeight */}
      <Animated.View style={bodyStyle}>
        {/* Phase 1: Invisible measurer captures children's height via onLayout.
            Absolutely positioned with left:0/right:0 so it gets the correct
            parent width for accurate text wrapping and height measurement. */}
        {contentHeight === 0 && (
          <View style={styles.measurer} onLayout={onContentLayout}>
            <View style={styles.content}>{children}</View>
          </View>
        )}
        {/* Phase 2: After measurement, render children normally.
            Height is controlled by animatedHeight + overflow:hidden. */}
        {contentHeight > 0 && (
          <View style={styles.content}>{children}</View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pillPressed: {
    opacity: 0.7,
  },
  icon: {
    width: 20,
    height: 20,
  },
  title: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 16,
    color: "#1a1a1a",
  },
  content: {
    paddingTop: 10,
  },
  measurer: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
  },
});
