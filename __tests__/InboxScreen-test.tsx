import { render, screen } from "@testing-library/react-native";

import InboxScreen from "@/app/(tabs)/index";

describe("Inbox Screen", () => {
  test("It should render text corretly on Inbox screen", () => {
    // Arrange
    render(<InboxScreen />);
    //  Act
    const text = screen.getByRole("text", { name: /Inbox Screen/i });
    // Assert
    expect(text).toBeOnTheScreen();
  });
});
