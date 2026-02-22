/**
 * a simple Stack — this becomes the top-level navigator
 * that will eventually switch between groups
 */

import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Sentry.init({
  dsn: "https://6693e471f5d477be8bc4542cd0ade86b@o4507083247452160.ingest.us.sentry.io/4507083249549312",
  sendDefaultPii: true,
  enableLogs: true,
});

// Native splash screen to remain visible
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded] = useFonts({
    BalsamiqSans: require("../../assets/fonts/Balsamiq_Sans/BalsamiqSans-Regular.ttf"),
  });

  // The standard and recommended way to asynchronously load custom fonts and manage
  // the splash screen's visibility.  This ensures a smooth user experience by preventing
  // unstyled text from flickering before the custom font is ready
  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
