import { ListData, TaskItem } from "@/types/todoItem.types";

export const lists: ListData[] = [
  {
    listId: "listInbox001",
    listName: "Inbox",
    listIcon: "archive-outline",
  },
  {
    listId: "listToday002",
    listName: "Today",
    listIcon: "sunny-outline",
  },
  {
    listId: "listUpcoming003",
    listName: "Upcoming",
    listIcon: "calendar-outline",
  },
  {
    listId: "listSomeday004",
    listName: "Someday",
    listIcon: "albums-outline",
  },
];

export const tasks: TaskItem[] = [
  {
    taskId: "task001",
    listId: "listInbox001",
    order: 0,
    title: "Buy groceries",
    description: "Milk, eggs, bread, and coffee",
  },
];
