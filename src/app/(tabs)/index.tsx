import FabButton from "@/components/ui/FAB/FabButton";
import { increment } from "@/features/counter/counterSlice";
import { RootState } from "@/store";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function Index(): React.ReactElement {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text
          style={{
            fontFamily: "BalsamiqSans-Regular",
            fontWeight: 400,
            fontSize: 24,
          }}
        >
          Inbox Screen: {count}
        </Text>
        <FabButton onPress={() => dispatch(increment())} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
