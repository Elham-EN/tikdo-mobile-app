import { type AddTodoFormInputs } from "@/features/todos/schemas/addTodoSchema";
import { type TodoItem } from "@/features/todos/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/v1/tasks`,
  }),
  endpoints: (builder) => ({
    // Mutation: Add todo item to the server
    addTodoItem: builder.mutation<TodoItem, AddTodoFormInputs>({
      query: ({ title, notes }) => ({
        url: "/",
        method: "POST",
        body: { title, notes },
      }),
    }),
  }),
});

export const { useAddTodoItemMutation } = todosApi;
