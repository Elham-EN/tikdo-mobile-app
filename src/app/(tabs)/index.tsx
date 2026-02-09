import Chip from "@/components/ui/Chip";
import FabButton from "@/components/ui/FabButton";
import { mutated_apricot } from "@/utils/colors";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Gather it all in one place (Inbox)
        </Text>
        <Chip
          title="Brain Dump"
          icon={require("../../../assets/icons/brain.png")}
          bgColor={mutated_apricot}
        ></Chip>
      </View>
      <FabButton onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flex: 1 / 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: 400,
    fontSize: 24,
  },
});
