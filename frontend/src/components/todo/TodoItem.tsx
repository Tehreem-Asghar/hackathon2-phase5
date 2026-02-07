import React from 'react';
import { Todo, TodoPriority, TodoRecurrence } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, is_completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const PriorityBadge: React.FC<{ priority: TodoPriority }> = ({ priority }) => {
  const colors = {
    [TodoPriority.LOW]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    [TodoPriority.MEDIUM]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    [TodoPriority.HIGH]: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  return (
    <div className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl transition-all duration-300 mb-4 overflow-hidden border border-white/5 shadow-sm ${
      todo.is_completed 
      ? 'bg-white/5 opacity-50' 
      : 'glass-card hover:bg-white/10 hover:border-violet-500/30 hover:shadow-md hover:-translate-y-0.5'
    }`}>
      
      <div className="flex items-start space-x-4 flex-1 mb-3 sm:mb-0 z-10 pl-1">
        <div className="relative flex items-center justify-center mt-1">
          <input
            type="checkbox"
            checked={todo.is_completed}
            onChange={(e) => onToggle(todo.id, e.target.checked)}
            className="peer h-6 w-6 opacity-0 absolute cursor-pointer z-20"
          />
          <div className={`h-6 w-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
            todo.is_completed 
            ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
            : 'border-slate-300 bg-white group-hover:border-violet-500 shadow-sm'
          }`}>
            {todo.is_completed && (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`text-lg font-black truncate transition-all duration-300 ${
              todo.is_completed ? 'text-white/40 line-through decoration-white/40' : 'text-white group-hover:text-white'
            }`}>
              {todo.title}
            </h3>
            <PriorityBadge priority={todo.priority} />
            {todo.recurrence !== TodoRecurrence.NONE && (
              <span className="text-violet-400" title={`Recurring: ${todo.recurrence}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </span>
            )}
          </div>
          
          {todo.description && (
            <p className={`text-sm mb-2 line-clamp-2 transition-colors duration-300 font-bold ${
              todo.is_completed ? 'text-white/30' : 'text-white/90'
            }`}>
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {todo.due_date && (
              <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                new Date(todo.due_date) < new Date() && !todo.is_completed
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-white/5 text-white/50 border-white/10'
              }`}>
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(todo.due_date).toLocaleDateString()}
              </div>
            )}
            
            {todo.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-10 sm:ml-4 z-10 sm:opacity-0 sm:translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
        <button
          onClick={() => onEdit(todo)}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Edit Task"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-white/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          title="Delete Task"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
