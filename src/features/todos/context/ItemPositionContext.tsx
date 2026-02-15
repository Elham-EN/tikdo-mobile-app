// Context for tracking todo item positions and shift animations during drag-and-drop.
// Allows dragged items to calculate insertion index by comparing against sibling positions
// and animate siblings by updating their shift values.

/**
 * Each TodoItem needs to know where its siblings are on screen so it can
 * calculate the insertion index during drag. A shared ref (like
 * DropZoneContext) avoids re-renders.
 *
 * Also holds:
 *   - shiftValues: a map of todo.id → SharedValue<number> so the dragging
 *     item can tell each sibling how far to shift (on the JS thread).
 */

import React, { createContext, useContext, useRef } from "react";
import type { SharedValue } from "react-native-reanimated";

type ItemPositionMap = Record<
  number,
  { y: number; height: number; index: number }
>;

// Map of todo.id → the item's shiftY shared value
type ShiftValueMap = Record<number, SharedValue<number>>;

interface ItemPositionContextValue {
  positions: React.RefObject<ItemPositionMap>;
  shiftValues: React.RefObject<ShiftValueMap>;
}

const ItemPositionContext =
  createContext<ItemPositionContextValue | null>(null);

export function ItemPositionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const positions = useRef<ItemPositionMap>({});
  // Each TodoItem registers its shiftY shared value here
  const shiftValues = useRef<ShiftValueMap>({});

  return (
    <ItemPositionContext.Provider value={{ positions, shiftValues }}>
      {children}
    </ItemPositionContext.Provider>
  );
}

export function useItemPosition() {
  const ctx = useContext(ItemPositionContext);
  if (!ctx)
    throw new Error("useItemPosition must be used within ItemPositionProvider");
  return ctx;
}
