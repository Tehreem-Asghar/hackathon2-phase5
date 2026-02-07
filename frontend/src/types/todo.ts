export enum TodoPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TodoRecurrence {
  NONE = "none",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: TodoPriority;
  due_date?: string;
  tags: string[];
  recurrence: TodoRecurrence;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}
