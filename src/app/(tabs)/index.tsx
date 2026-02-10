import Accordion from "@/components/ui/Accordion";
import PlusButton from "@/components/ui/PlusButton";
import { light_grey } from "@/utils/colors";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.headerText}>Receiving Area (Inbox)</Text>
        <Accordion
          title="Brain Dump Here"
          icon={require("../../../assets/icons/brain.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>
              Unprocessed thought - add here
            </Text>
          </View>
        </Accordion>
      </View>

      <View style={styles.section}>
        <Text style={styles.headerText}>Organize your to-do</Text>
        <Accordion
          title="Today"
          icon={require("../../../assets/icons/sun.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>Get it done today - add here</Text>
          </View>
        </Accordion>

        <Accordion
          title="Upcoming"
          icon={require("../../../assets/icons/upcoming.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>Planning ahead - add here</Text>
          </View>
        </Accordion>
        <Accordion
          title="Someday"
          icon={require("../../../assets/icons/box.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>Not Sure When? - add here</Text>
          </View>
        </Accordion>
        <Accordion
          title="Anytime"
          icon={require("../../../assets/icons/anytime.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>
              Could start at anytime - add here
            </Text>
          </View>
        </Accordion>
        <Accordion
          title="Trash"
          icon={require("../../../assets/icons/trash.png")}
          bgColor={light_grey}
        >
          <View style={styles.addTodoRow}>
            <Text style={styles.placeholder}>Trashed items here</Text>
          </View>
        </Accordion>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  headerText: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 24,
    textAlign: "center",
  },
  addTodoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  placeholder: {
    fontFamily: "BalsamiqSans-Regular",
    fontSize: 15,
    color: "#666",
  },
});
