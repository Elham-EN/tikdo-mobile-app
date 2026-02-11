import AddTaskSheet from "@/components/AddTaskSheet";
import Accordion from "@/components/ui/Accordion";
import AddTodoRow from "@/components/ui/AddTodoRow";
import FabButton from "@/components/ui/FabButton";
import PlusButton from "@/components/ui/PlusButton";
import { light_grey } from "@/utils/colors";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 100 },
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
          <AddTodoRow placeholder="Unprocessed thought - add here" />
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
          <AddTodoRow placeholder="Get it done today - add here" />
        </Accordion>

        <Accordion
          title="Upcoming"
          icon={require("../../../assets/icons/upcoming.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <AddTodoRow placeholder="Planning ahead - add here" />
        </Accordion>
        <Accordion
          title="Someday"
          icon={require("../../../assets/icons/box.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <AddTodoRow placeholder="Not Sure When? - add here" />
        </Accordion>
        <Accordion
          title="Anytime"
          icon={require("../../../assets/icons/anytime.png")}
          bgColor={light_grey}
          headerRight={<PlusButton onPress={() => {}} />}
        >
          <AddTodoRow placeholder="Could start at anytime - add here" />
        </Accordion>
        <Accordion
          title="Trash"
          icon={require("../../../assets/icons/trash.png")}
          bgColor={light_grey}
        >
          <AddTodoRow placeholder="Trashed items here" />
        </Accordion>
      </View>
    </ScrollView>

      <FabButton onPress={() => setIsSheetVisible(true)} />

      <AddTaskSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
      />
    </View>
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
});
