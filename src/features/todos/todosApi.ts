import { type AddTodoFormInputs } from "@/features/todos/schemas/addTodoSchema";
import { type ListType, type TaskStatus, type TodoItem } from "@/features/todos/types";
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
    // Mutation: Move a todo to a different list or trash it
    moveTodoItem: builder.mutation<
      TodoItem,
      { id: number; listType?: ListType; status?: TaskStatus }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/move`,
        method: "PATCH",
        body,
      }),
      // Optimistic update: immediately update the cache before server responds
      async onQueryStarted({ id, listType, status }, { dispatch, queryFulfilled }) {
        // Optimistically update the getTodoItems cache
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodoItems", undefined, (draft) => {
            const todo = draft.find((item) => item.id === id);
            if (todo) {
              if (listType !== undefined) todo.listType = listType;
              if (status !== undefined) todo.status = status;
            }
          })
        );
        try {
          // Wait for the mutation to complete
          await queryFulfilled;
        } catch {
          // If mutation fails, undo the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ["TodoList"],
    }),
    // Mutation: Reorder a todo within its current list
    reorderTodoItem: builder.mutation<
      TodoItem,
      { id: number; newPosition: number }
    >({
      query: ({ id, newPosition }) => ({
        url: `/${id}/reorder`,
        method: "PATCH",
        body: { newPosition },
      }),
      // Optimistic update: immediately reorder in cache before server responds
      async onQueryStarted({ id, newPosition }, { dispatch, queryFulfilled }) {
        // Optimistically update the getTodoItems cache
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodoItems", undefined, (draft) => {
            const todoIndex = draft.findIndex((item) => item.id === id);
            if (todoIndex === -1) return;

            const todo = draft[todoIndex];
            const oldPosition = todo.position;
            const listType = todo.listType;

            // Only reorder items in the same list
            const sameListTodos = draft.filter(
              (item) => item.listType === listType && item.status !== "deleted"
            );

            // Update positions optimistically
            if (newPosition > oldPosition) {
              // Moving down: shift items up
              sameListTodos.forEach((item) => {
                if (item.position > oldPosition && item.position <= newPosition) {
                  item.position--;
                }
              });
            } else if (newPosition < oldPosition) {
              // Moving up: shift items down
              sameListTodos.forEach((item) => {
                if (item.position >= newPosition && item.position < oldPosition) {
                  item.position++;
                }
              });
            }

            // Update the dragged item's position
            todo.position = newPosition;
          })
        );
        try {
          // Wait for the mutation to complete
          await queryFulfilled;
        } catch {
          // If mutation fails, undo the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ["TodoList"],
    }),
  }),
});

export const {
  useAddTodoItemMutation,
  useGetTodoItemsQuery,
  useMoveTodoItemMutation,
  useReorderTodoItemMutation,
} = todosApi;
