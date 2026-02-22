// index.ts — single public entry point for the drag-and-drop engine.
// Re-exports all components and types so consumers can import from one place.

// --- Types ---
export type { DragItem, ItemLayout, ListLayout } from "@/types/dnd.types";

// --- Context ---
export { DragProvider, useDragContext } from "@/contexts/DragContext";
export type { DragContextValue } from "@/contexts/DragContext";

// --- Components ---
export { default as DragGhost } from "./DragGhost";
export { default as DragItemComponent } from "./DragItemComponent";
export { default as DragList } from "./DragList";
export { default as DragScrollView } from "./DragScrollView";
