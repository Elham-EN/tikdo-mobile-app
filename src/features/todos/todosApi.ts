import { type AddTodoFormInputs } from "@/features/todos/schemas/addTodoSchema";
import { type TodoItem } from "@/features/todos/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/v1/tasks`,
  }),
  tagTypes: ["TodoList"], // 1. declare tag
  endpoints: (builder) => ({
    // Mutation: Add todo item to the server
    addTodoItem: builder.mutation<TodoItem, AddTodoFormInputs>({
      query: ({ title, notes }) => ({
        url: "/",
        method: "POST",
        body: { title, notes },
      }),
      // Mutation invalidates → auto refetch
      invalidatesTags: ["TodoList"],
    }),
    // Query: Get all tasks from the server
    getTodoItems: builder.query<TodoItem[], void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      // This cache provides "TodoList"
      providesTags: ["TodoList"],
    }),
  }),
});

export const { useAddTodoItemMutation, useGetTodoItemsQuery } = todosApi;
