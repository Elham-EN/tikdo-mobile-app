import { type AddTodoFormInputs } from "@/schemas/addTodoSchema";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type ListType = "inbox" | "today" | "upcoming" | "anytime" | "someday";
type TaskStatus = "pending" | "completed" | "deleted";

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  listType: ListType;
  status: TaskStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  isOverdue: boolean;
  originalScheduledDate: string | null;
  originalScheduledTime: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  position: number;
}

// Define a service using a base URL and expected endpoints
export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/v1/tasks`,
  }),
  endpoints: (builder) => ({
    // Mutation: Add todo item to the server
    addTodoItem: builder.mutation<Task, AddTodoFormInputs>({
      query: ({ title, notes }) => ({
        url: "/",
        method: "POST",
        body: { title, notes },
      }),
    }),
  }),
});

export const { useAddTodoItemMutation } = todosApi;
