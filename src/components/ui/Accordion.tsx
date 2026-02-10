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

export default function Accordion({
  title,
  icon = require("../../../assets/icons/box.png"),
  bgColor = light_grey,
  headerRight,
  children,
}: AccordionProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const animatedHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const onContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
    }
  };

  const toggle = () => {
    const willExpand = !expanded;
    setExpanded(willExpand);

    const timingConfig = {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    };

    animatedHeight.value = withTiming(
      willExpand ? contentHeight : 0,
      timingConfig,
    );
    rotation.value = withTiming(willExpand ? 1 : 0, timingConfig);
  };

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight === 0 ? undefined : animatedHeight.value,
    overflow: "hidden",
  }));

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
