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
 * Collapsible accordion with a pill-shaped header.
 * Tap the header to smoothly expand/collapse the content below it.
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
  // How tall the content is (needed so the animation
  // knows where to expand to)
  const [contentHeight, setContentHeight] = useState(0);

  // Animated values for smooth expand/collapse and
  // chevron rotation
  const animatedHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Captures the actual pixel height of the children when
  // they first render
  const onContentLayout = (event: LayoutChangeEvent) => {
    // Get the rendered height of the children content
    // (how much space it takes up)
    const height = event.nativeEvent.layout.height;
    // Save this height only once (the first time the content
    // renders and has a valid height)
    // This tells the animation how far to expand to when
    // opening the accordion
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
    }
  };

  // Handles opening/closing the accordion
  const toggle = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);

    // Animation settings for smooth motion
    const timingConfig = {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    };

    // Animate height: 0 (collapsed) to contentHeight (expanded)
    animatedHeight.value = withTiming(
      willExpand ? contentHeight : 0,
      timingConfig,
    );
    // Animate chevron: 0 (down) to 1 (up, rotated 180°)
    rotation.value = withTiming(willExpand ? 1 : 0, timingConfig);
  };

  // Animates the content height when expanding/collapsing
  const bodyStyle = useAnimatedStyle(() => ({
    // If we haven't measured yet, don't set a height (let content show
    // naturally to measure it) Once measured, use the animated value to
    // control height (for smooth expand/collapse)
    height: contentHeight === 0 ? undefined : animatedHeight.value,
    // Hide any content that exceeds the current height
    overflow: "hidden",
  }));

  // Rotates the chevron when expanding/collapsing
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={styles.container}>
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

      <Animated.View style={bodyStyle}>
        {contentHeight === 0 && (
          <View style={styles.measurer} onLayout={onContentLayout}>
            <View style={styles.content}>{children}</View>
          </View>
        )}
        {contentHeight > 0 && <View style={styles.content}>{children}</View>}
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
