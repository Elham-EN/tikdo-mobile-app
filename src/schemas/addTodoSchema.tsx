import { z } from "zod";

export const addTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .nullable(),
});

export type AddTodoFormInputs = z.infer<typeof addTodoSchema>;
