/**
 * Here's the challenge:
 * When a TodoItem is dropped, it needs to know the screen positions
 * of all accordions to figure out which one it landed on. But TodoItem
 * is a child buried inside a single Accordion — it has no visibility
 * into the others.
 *
 * The solution:
 * A shared context that every Accordion writes its position
 * into, and every TodoItem reads from.
 */

import React, { createContext, useContext, useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import { ListType } from "../types";

export interface DropZoneBounds {
  // absolute Y on screen
  y: number;
  // total height of the accordion
  height: number;
  listType: ListType | "trash";
}

// The ref holds a record keyed by listType
type DropZoneMap = Partial<Record<ListType | "trash", DropZoneBounds>>;

interface DropZoneContextValue {
  dropZonesRef: React.RefObject<DropZoneMap>;
  // Shared value that holds the currently hovered listType (or null)
  activeDropZone: ReturnType<typeof useSharedValue<ListType | "trash" | null>>;
}

// The context holds a ref to a map of accordion positions:
const DropZoneContext = createContext<DropZoneContextValue | null>(null);

export function DropZoneProvider({ children }: { children: React.ReactNode }) {
  // Because these positions update frequently (on every layout/scroll) and we
  // don't want React re-renders every time — the gesture handler reads the
  // values imperatively on drop.
  const dropZonesRef = useRef<DropZoneMap>({});
  // Shared value to track which drop zone is currently hovered
  const activeDropZone = useSharedValue<ListType | "trash" | null>(null);

  return (
    <DropZoneContext.Provider value={{ dropZonesRef, activeDropZone }}>
      {children}
    </DropZoneContext.Provider>
  );
}

export function useDropZones() {
  const context = useContext(DropZoneContext);
  if (!context)
    throw new Error("useDropZones must be used within DropZoneProvider");
  return context.dropZonesRef;
}

export function useActiveDropZone() {
  const context = useContext(DropZoneContext);
  if (!context)
    throw new Error("useActiveDropZone must be used within DropZoneProvider");
  return context.activeDropZone;
}
