import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

/**
 * The mock replaces the native react-native-safe-area-context module with a
 * pure JavaScript implementation. In the real app, SafeAreaProvider is a
 * native component (RNCSafeAreaProvider) that communicates with the device
 * to get safe area insets (notch, status bar, etc.). In the Jest test
 * environment, there's no native runtime, so it renders as an empty shell
 * and swallows all its children.
 */
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
