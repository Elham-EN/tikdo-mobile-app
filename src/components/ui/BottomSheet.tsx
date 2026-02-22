// BottomSheet — animated modal sheet that slides up from the bottom of the screen.
// Uses RN Modal so it renders above the native tab bar and all screen content.
// Handles show/hide animation, backdrop dimming, keyboard avoidance, and unmounting after close.
import React from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// Full screen height — used to start the sheet off-screen below the visible area
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Shared animation config — 300ms with a smooth material-style ease curve
const TIMING_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design standard easing
};

interface BottomSheetProps {
  visible: boolean; // Whether the sheet is open or closed
  onClose: () => void; // Called when the user taps the backdrop to dismiss
  children: React.ReactNode; // Content rendered inside the sheet
}

/**
 * Renders an animated bottom sheet inside a transparent RN Modal.
 * Modal is used because zIndex cannot escape the native tab bar stacking context.
 * Animation is split into two effects: mount first, then animate on the next render.
 */
export default function BottomSheet({
  visible,
  onClose,
  children,
}: BottomSheetProps): React.ReactElement | null {
  // Y offset of the sheet — starts off-screen and animates to 0 when open
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Opacity of the dark backdrop — animates between 0 and 1 (displayed at 50% via style)
  const overlayOpacity = useSharedValue(0);

  // Controls whether the Modal is in the tree — stays true until close animation finishes
  const [mounted, setMounted] = React.useState(false);

  /**
   * Step 1 — controls mounting and close animation.
   * On open: sets mounted true so the Modal enters the tree.
   * On close: runs the slide-down + fade animation, then unmounts after it finishes.
   */
  React.useEffect(() => {
    if (visible) {
      setMounted(true); // Mount the Modal so its views exist before we animate
    } else {
      Keyboard.dismiss(); // Dismiss keyboard before animating out to avoid layout conflict

      overlayOpacity.value = withTiming(0, TIMING_CONFIG); // Fade backdrop out

      // Slide sheet back off-screen, then unmount the Modal after animation completes
      translateY.value = withTiming(
        SCREEN_HEIGHT, // Return to fully off-screen position
        TIMING_CONFIG,
        () => {
          // scheduleOnRN moves this callback back to the JS thread from the UI thread worklet
          scheduleOnRN(setMounted, false); // Unmount Modal once animation is done
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // translateY and overlayOpacity are stable refs — safe to omit

  /**
   * Step 2 — triggers the open animation after the Modal is mounted.
   * Split from Step 1 so React has a full render cycle to mount the Modal views first.
   */
  React.useEffect(() => {
    if (mounted && visible) {
      overlayOpacity.value = withTiming(1, TIMING_CONFIG); // Fade backdrop in
      translateY.value = withTiming(0, TIMING_CONFIG); // Slide sheet up into view
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Runs when mounted flips to true — visible is stable at this point

  // Animated style for the backdrop — multiplied by 0.5 so max visible opacity is 50%
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * 0.5,
  }));

  // Animated style for the sheet — slides vertically based on translateY shared value
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Don't render the Modal while closed — avoids native overhead when sheet is hidden
  if (!mounted) return null;

  return (
    // transparent Modal renders above all native UI including the tab bar
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible={mounted}
    >
      {/* Dark backdrop — fills the Modal; tapping it calls onClose to dismiss */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* KeyboardAvoidingView pushes the sheet up when the software keyboard appears */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS needs padding mode, Android needs height mode
        style={styles.sheetWrapper}
        pointerEvents="box-none" // Lets taps on empty space fall through to the backdrop
      >
        {/* The sliding sheet panel — height is determined by its children */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Full-screen dark backdrop inside the Modal
  overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire Modal surface
    backgroundColor: "#000",
  },
  // Wrapper that anchors the sheet to the bottom edge of the Modal
  sheetWrapper: {
    ...StyleSheet.absoluteFillObject, // Fills the Modal so flex-end works correctly
    justifyContent: "flex-end", // Pushes the sheet panel to the bottom
  },
  // Sheet panel — full width, height driven by children content
  sheet: {
    width: "100%",
  },
});
