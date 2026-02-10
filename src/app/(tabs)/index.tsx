import Chip from "@/components/ui/Chip";
import PlusButton from "@/components/ui/PlusButton";
import { light_grey } from "@/utils/colors";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.inboxContainer}>
        <Text style={styles.headerText}>Receiving Area (Inbox)</Text>
        <View style={styles.addTodoSection}>
          <Chip
            title="Brain Dump Here"
            icon={require("../../../assets/icons/brain.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
      </View>
      <View style={styles.organizeContainer}>
        <Text style={styles.headerText}>Organize your to-do</Text>
        <View style={styles.addTodoSection}>
          <Chip
            title="Do It Today"
            icon={require("../../../assets/icons/sun.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
        <View style={styles.addTodoSection}>
          <Chip
            title="Upcoming: Plan Ahead"
            icon={require("../../../assets/icons/upcoming.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
        <View style={styles.addTodoSection}>
          <Chip
            title="Someday: Not Sure When?"
            icon={require("../../../assets/icons/box.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
        <View style={styles.addTodoSection}>
          <Chip
            title="Could Start At Anytime"
            icon={require("../../../assets/icons/anytime.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
        <View style={styles.addTodoSection}>
          <Chip
            title="Trash - Not Worth It"
            icon={require("../../../assets/icons/trash.png")}
            bgColor={light_grey}
          />
          <PlusButton onPress={() => {}} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inboxContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
  },
  organizeContainer: {
    flex: 4,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
  },
  headerText: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 24,
  },
  addTodoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
});
