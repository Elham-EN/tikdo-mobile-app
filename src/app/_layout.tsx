import * as Sentry from "@sentry/react-native";
import { Provider } from "react-redux";
import { store } from "../store";

/**
 * a simple Stack — this becomes the top-level navigator
 * that will eventually switch between groups
 */

import { Stack } from "expo-router";

Sentry.init({
  dsn: "https://6693e471f5d477be8bc4542cd0ade86b@o4507083247452160.ingest.us.sentry.io/4507083249549312",
  sendDefaultPii: true,
  enableLogs: true,
});

function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}

export default Sentry.wrap(RootLayout);
