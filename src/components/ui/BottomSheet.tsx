import React, { useEffect } from "react";
import {
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps): React.ReactElement | null {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  // Track mount state so we can unmount after close animation completes
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Animate in
      overlayOpacity.value = withTiming(1, TIMING_CONFIG);
      translateY.value = withTiming(0, TIMING_CONFIG);
    } else {
      // Dismiss keyboard in sync with close animation
      Keyboard.dismiss();
      // Animate out, then unmount
      overlayOpacity.value = withTiming(0, TIMING_CONFIG);
      translateY.value = withTiming(SCREEN_HEIGHT, TIMING_CONFIG, () => {
        runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * 0.5,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 100,
  },
  keyboardView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 101,
  },
  sheet: {
    width: "100%",
  },
});
