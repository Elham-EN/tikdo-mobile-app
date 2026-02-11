/**
 * BottomSheet Component
 *
 * A reusable modal-style bottom sheet that slides up from the bottom of the screen
 * with smooth animations. Features include:
 * - Animated backdrop overlay with semi-transparent black background
 * - Slide-up/slide-down animations using react-native-reanimated
 * - Keyboard avoidance for both iOS and Android platforms
 * - Backdrop tap-to-dismiss functionality
 * - Proper mounting/unmounting lifecycle with animation completion
 * - Automatic keyboard dismissal on close
 */
import React from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
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
  // Animation values: Initial State: Hidden off-screen and transparent
  // translateY controls sheet position (starts off-screen),
  const translateY = useSharedValue(SCREEN_HEIGHT);
  // overlayOpacity controls backdrop fade
  const overlayOpacity = useSharedValue(0);
  // Track mount state so we can unmount after close animation completes
  const [mounted, setMounted] = React.useState(false);

  // When visible changes: slide sheet up/down and fade backdrop in/out
  // Waits for close animation to finish before unmounting
  React.useEffect(() => {
    // When visible is true (Opening)
    if (visible) {
      // It immediately adds the component
      setMounted(true);
      // Animate in:
      // Fade in from it's current opacity 0 to fully opaque over the
      // duration
      overlayOpacity.value = withTiming(1, TIMING_CONFIG);
      // The main content slides up from the bottom of the screen to
      // its final position (0)
      translateY.value = withTiming(0, TIMING_CONFIG);
      // When visible is false (Closing)
    } else {
      // Dismiss keyboard in sync with close animation
      Keyboard.dismiss();
      // Animate out, then unmount:
      // overlayOpacity.value = withTiming(0...):
      overlayOpacity.value = withTiming(0, TIMING_CONFIG);
      // The content slides down off the bottom of the screen.
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        TIMING_CONFIG,
        // It waits for the slide-down animation to finish before
        // removing the component from the React tree.
        () => {
          runOnJS(setMounted)(false);
        },
      );
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
        style={styles.sheetWrapper}
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
  sheetWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 101,
  },
  sheet: {
    width: "100%",
  },
});
