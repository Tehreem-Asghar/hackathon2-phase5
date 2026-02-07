import React, { useState } from 'react';
import { api } from '@/lib/api';
import { TodoPriority, TodoRecurrence } from '@/types/todo';

interface AddTodoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>(TodoPriority.MEDIUM);
  const [recurrence, setRecurrence] = useState<TodoRecurrence>(TodoRecurrence.NONE);
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          description,
          priority,
          recurrence,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          tags
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        onSuccess();
      } else {
        setError('Failed to create todo');
      }
    } catch (e) {
      console.error("Error adding todo:", e);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl shadow-xl border border-slate-700/50 mb-10 relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-xl font-bold text-white">Create New Task</h3>
      </div>
      
      {error && <div className="text-rose-300 mb-6 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 font-bold">{error}</div>}
      
      <div className="mb-5 relative z-10">
        <label htmlFor="title" className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Title</label>
        <input
          type="text"
          id="title"
          className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-lg font-bold text-white placeholder-white/30 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
          placeholder="What needs to be done?"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 relative z-10">
        <div>
          <label className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Priority</label>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value={TodoPriority.LOW} className="bg-slate-900">Low</option>
            <option value={TodoPriority.MEDIUM} className="bg-slate-900">Medium</option>
            <option value={TodoPriority.HIGH} className="bg-slate-900">High</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Recurrence</label>
          <select 
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as TodoRecurrence)}
            className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value={TodoRecurrence.NONE} className="bg-slate-900">None</option>
            <option value={TodoRecurrence.DAILY} className="bg-slate-900">Daily</option>
            <option value={TodoRecurrence.WEEKLY} className="bg-slate-900">Weekly</option>
            <option value={TodoRecurrence.MONTHLY} className="bg-slate-900">Monthly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 relative z-10">
        <div>
          <label className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Tags (Press Enter)</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-1 rounded-md border border-violet-500/20">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-white">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-8 relative z-10">
        <label htmlFor="description" className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Description (Optional)</label>
        <textarea
          id="description"
          rows={3}
          className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-base font-medium text-white placeholder-white/30 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
        />
      </div>
      
      <div className="flex justify-end space-x-4 relative z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-white/20 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center px-8 py-2.5 border border-transparent shadow-[0_0_15px_rgba(124,58,237,0.25)] text-sm font-black rounded-xl text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};
