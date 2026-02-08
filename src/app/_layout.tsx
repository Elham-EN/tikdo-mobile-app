/**
 * a simple Stack — this becomes the top-level navigator
 * that will eventually switch between groups
 */

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
