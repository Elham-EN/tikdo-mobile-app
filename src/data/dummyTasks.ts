// Dummy task data for development and testing purposes.
// Contains sample tasks and task list categories used across the app.

import { Ionicons } from "@expo/vector-icons";

// Task item data structure with title and description
export interface Task {
  id: string;
  title: string;
  description: string;
}

// Task list category data structure with name and task references
export interface TaskList {
  id: string;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  taskIds: string[]; // references tasks by ID
}

// All tasks stored separately to avoid duplication across lists
export const DUMMY_TASKS: Task[] = [
  {
    id: "1",
    title: "Morning standup meeting",
    description: "Daily sync with the engineering team at 9:30 AM",
  },
  {
    id: "2",
    title: "Fix login page bug",
    description: "Resolve the issue where users get logged out on refresh",
  },
  {
    id: "3",
    title: "Write unit tests",
    description: "Add test coverage for the new authentication module",
  },
  {
    id: "4",
    title: "Reply to client emails",
    description: "Respond to feedback from the product demo yesterday",
  },
  {
    id: "5",
    title: "Update project documentation",
    description: "Add API endpoint details to the developer wiki",
  },
  {
    id: "6",
    title: "Code review for PR #42",
    description: "Review the payment integration pull request",
  },
  {
    id: "7",
    title: "Prepare sprint retrospective",
    description: "Gather notes and action items for the end-of-sprint retro",
  },
  {
    id: "8",
    title: "Lunch with design team",
    description: "Discuss upcoming UI redesign over lunch at 12:30 PM",
  },
  {
    id: "9",
    title: "Deploy staging build",
    description: "Push the latest changes to the staging environment for QA",
  },
  {
    id: "10",
    title: "Plan tomorrow's priorities",
    description: "Review backlog and pick top tasks for tomorrow",
  },
];

// Task list categories referencing tasks by ID
export const DUMMY_TASK_LISTS: TaskList[] = [
  {
    id: "001",
    name: "Brain Dump",
    iconName: "archive-outline",
    taskIds: ["1", "2"],
  },
  {
    id: "002",
    name: "Today",
    iconName: "sunny-outline",
    taskIds: ["3", "4", "5"],
  },
  {
    id: "003",
    name: "Upcoming",
    iconName: "calendar-number-outline",
    taskIds: ["6", "7", "8"],
  },
  {
    id: "004",
    name: "Someday",
    iconName: "albums-outline",
    taskIds: ["9", "10"],
  },
];
