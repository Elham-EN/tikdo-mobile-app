// ListPickerDropdown — reuses the Chip component with a floating dropdown menu
// for selecting which todo list a task belongs to.
// Tapping the chip toggles an absolutely-positioned dropdown above it.
import { lists } from "@/data/data";
import { brand, light_chip, light_surface } from "@/utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Chip from "./Chip";

interface ListPickerDropdownProps {
  selectedListId: string; // The currently selected list ID
  onSelect: (listId: string) => void; // Called when user picks a list
}

/**
 * Renders a Chip that opens a floating dropdown with the 4 list options.
 * The dropdown is absolutely positioned so it floats above without affecting layout.
 */
export default function ListPickerDropdown({
  selectedListId,
  onSelect,
}: ListPickerDropdownProps): React.ReactElement {
  // Controls whether the dropdown menu is open
  const [open, setOpen] = React.useState(false);

  // The currently selected list object for displaying its name/icon on the chip
  const selectedList =
    lists.find((l) => l.listId === selectedListId) ?? lists[0];

  return (
    <View style={styles.wrapper}>
      {/* Chip — reuses the shared Chip component, tapping toggles the dropdown */}
      <Chip
        icon={<Ionicons name={selectedList.listIcon} size={18} color="#333" />}
        title={selectedList.listName}
        trailingIcon={<Ionicons name="chevron-down" size={14} color="#666" />}
        bgColor={light_chip}
        textColor="#333"
        onPress={() => setOpen((prev) => !prev)}
      />

      {/* Dropdown menu — floats above the chip without changing parent layout */}
      {open && (
        <View style={styles.dropdown}>
          {lists.map((list) => {
            // Whether this list is currently selected
            const isSelected = list.listId === selectedListId;
            return (
              <Pressable
                key={list.listId}
                style={[
                  styles.dropdownItem,
                  isSelected && styles.dropdownItemSelected, // Highlight selected
                ]}
                onPress={() => {
                  onSelect(list.listId); // Notify parent of selection
                  setOpen(false); // Close dropdown after picking
                }}
              >
                <Ionicons
                  name={list.listIcon}
                  size={18}
                  color={isSelected ? brand : "#555"}
                />
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.dropdownItemTextSelected,
                  ]}
                >
                  {list.listName}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Wrapper — relative so the dropdown can be positioned absolutely above it
  wrapper: {
    position: "relative",
  },
  // Dropdown menu — absolutely positioned to float above the chip
  dropdown: {
    position: "absolute",
    left: 0,
    bottom: "100%", // Sits directly above the chip
    marginBottom: 4, // Small gap between dropdown and chip
    backgroundColor: light_surface,
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 180,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 6,
  },
  // Single row inside the dropdown
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  // Highlighted background for the currently selected item
  dropdownItemSelected: {
    backgroundColor: "#E2F0FD",
  },
  // Label text for each dropdown option
  dropdownItemText: {
    fontSize: 15,
    color: "#555",
  },
  // Bold + brand-colored text for the selected option
  dropdownItemTextSelected: {
    color: brand,
    fontWeight: "600",
  },
});
