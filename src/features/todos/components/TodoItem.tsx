import type {
  ListType,
  TodoItem as TodoItemType,
} from "@/features/todos/types";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useDropZones } from "../context/DropZoneContext";
import { useMoveTodoItemMutation } from "../todosApi";

interface TodoItemProps {
  todo: TodoItemType;
}

export default function TodoItem({ todo }: TodoItemProps) {
  //  tracks whether the item is currently being dragged.
  const isActive = useSharedValue(false);
  // track the last haptic trigger point:
  const lastHapticY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const dropZones = useDropZones();
  const [moveTodo] = useMoveTodoItemMutation();

  // Defined in component body (RN Runtime scope) so it can be
  // safely passed to scheduleOnRN from the UI thread worklet.
  const handleDrop = (absoluteY: number) => {
    const zones = dropZones.current;
    let target: ListType | "trash" | null = null;
    for (const key in zones) {
      const zone = zones[key as ListType | "trash"]!;
      if (absoluteY >= zone.y && absoluteY <= zone.y + zone.height) {
        target = zone.listType;
        break;
      }
    }
    if (!target || target === todo.listType) return;

    if (target === "trash") {
      moveTodo({ id: todo.id, status: "deleted" });
    } else {
      moveTodo({ id: todo.id, listType: target });
    }
  };

  // updates those shared values as the finger moves:
  const panGesture = Gesture.Pan()
    // "don't start the pan until the finger has been held down for 200ms
    .activateAfterLongPress(200)
    .onStart(() => {
      isActive.value = true;
      // fire a medium impact — this tells the user "you grabbed it":
      scheduleOnRN(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
    })
    // fires continuously as the finger drags. event.translationX/Y
    // is how far the finger moved from where it started
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      // Fire light haptic every ~50px of vertical movement - passing over sibling
      if (Math.abs(event.translationY - lastHapticY.value) > 50) {
        lastHapticY.value = event.translationY;
        scheduleOnRN(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        });
      }
    })
    // fires when the finger lifts. withSpring(0) snaps the item back to
    // its original position (for now — later we'll add drop logic here)
    .onEnd((event) => {
      // To detect the target. Capture event.absoluteY (the finger's screen-level Y),
      // then use scheduleOnRN to run the detection on the JS thread
      const fingerY = event.absoluteY;

      // Pass handleDrop (defined in RN Runtime scope) and fingerY as
      // an argument — avoids closure capture issues across runtimes.
      scheduleOnRN(handleDrop, fingerY);

      // Snap back to original position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isActive.value = false;
      lastHapticY.value = 0;
    });

  // Connect the shared values to a style that moves the item:
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      // item grows slightly so it "lifts" off the list
      { scale: withTiming(isActive.value ? 1.05 : 1, { duration: 150 }) },
    ],
    // subtle transparency so you can see what's behind
    opacity: withTiming(isActive.value ? 0.85 : 1, { duration: 150 }),
    // keeps the dragged item above its siblings
    zIndex: isActive.value ? 999 : 0,
  }));

  //  it's invisible when not dragging, fades in when active:
  const ghostStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    opacity: withTiming(isActive.value ? 0.3 : 0, { duration: 150 }),
  }));

  return (
    <View>
      {/* Ghost placeholder — holds the layout space */}
      <Animated.View style={ghostStyle}>
        <View style={[styles.todoItem, styles.ghost]}>
          <View style={styles.checkbox} />
          <View style={styles.todoContent}>
            <Text style={styles.todoTitle}>{todo.title}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Draggable item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.todoItem, animatedStyle]}>
          <View style={styles.checkbox} />
          <View style={styles.todoContent}>
            <Text style={styles.todoTitle}>{todo.title}</Text>
            {todo.notes ? (
              <Text style={styles.todoNotes}>{todo.notes}</Text>
            ) : null}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    marginRight: 14,
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 16,
    color: "#1C1C1E",
  },
  todoNotes: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  ghost: {
    backgroundColor: "#F0F0F0",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderBottomWidth: 1,
    borderBottomColor: "#C7C7CC",
  },
});
