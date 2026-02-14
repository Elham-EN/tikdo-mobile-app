import { useDropZones } from "@/features/todos/context/DropZoneContext";
import { ListType } from "@/features/todos/types";
import { light_grey } from "@/utils/colors";
import { Entypo } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
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
  stickyTop?: React.ReactNode;
  children: React.ReactNode;
  listSize: number;
  listType: ListType | "trash";
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
  stickyTop,
  children,
  listSize,
  listType,
}: AccordionProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  // A ref is a mutable container that persists across renders.
  const expandedRef = useRef(false);
  const containerRef = useRef<View>(null);

  const dropZones = useDropZones();

  const animatedHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const registerBounds = () => {
    // measureInWindow gives the accordion's position on the actual screen,
    // which you can directly compare against the finger position.
    containerRef.current?.measureInWindow((x, y, width, height) => {
      dropZones.current[listType] = { y, height, listType };
    });
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0) {
      setContentHeight(height);
      // If expanded, animate to the new height so content isn't clipped
      if (expandedRef.current) {
        animatedHeight.value = withTiming(height, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
      }
    }
  };

  // Handles opening/closing the accordion
  const toggle = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    expandedRef.current = willExpand;

    // Animation settings for smooth motion
    const timingConfig = {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    };

    animatedHeight.value = withTiming(
      willExpand ? contentHeight : 0,
      timingConfig,
    );
    // Animate chevron: 0 (down) to 1 (up, rotated 180°)
    rotation.value = withTiming(willExpand ? 1 : 0, timingConfig);
  };

  // Animates the content height when expanding/collapsing
  const bodyStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: "hidden",
  }));

  // Rotates the chevron when expanding/collapsing
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View ref={containerRef} style={styles.container} onLayout={registerBounds}>
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
          <Text>({String(listSize)})</Text>
          <Animated.View style={chevronStyle}>
            <Entypo name="chevron-down" size={18} color="#555" />
          </Animated.View>
        </Pressable>
        {headerRight}
      </View>

      {/* Hidden measurer — always rendered so it re-measures when children change
        In short: it's an invisible clone of the content whose only job is to tell 
        you "this content is X pixels tall" so the animation knows where to expand to. 
        */}
      <View style={styles.measurer} onLayout={onContentLayout}>
        <View style={styles.content}>
          {stickyTop}
          {children}
        </View>
      </View>

      <Animated.View style={bodyStyle}>
        <View style={styles.content}>
          {stickyTop}
          {children}
        </View>
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
