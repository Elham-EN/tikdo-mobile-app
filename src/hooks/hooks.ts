// Typed Redux hooks for use throughout the application.
// These pre-typed versions of useDispatch and useSelector provide type safety
// by inferring AppDispatch and RootState types automatically.

import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// Provides type-safe access to Redux dispatch function
export const useAppDispatch = useDispatch.withTypes<AppDispatch>;

// Provides type-safe access to Redux store state
export const useAppSelector = useSelector.withTypes<RootState>();
