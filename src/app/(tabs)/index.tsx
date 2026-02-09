import FabButton from "@/components/ui/FAB/FabButton";
import * as Sentry from "@sentry/react-native";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text>Inbox Screen</Text>
        <FabButton
          onPress={() => {
            Sentry.captureException(new Error("First error"));
          }}
        />
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
