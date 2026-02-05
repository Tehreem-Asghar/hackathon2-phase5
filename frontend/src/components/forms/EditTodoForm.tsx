import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Todo } from '@/components/todo/TodoItem';

interface EditTodoFormProps {
  todo: Todo;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditTodoForm: React.FC<EditTodoFormProps> = ({ todo, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(todo.title);
    setDescription(todo.description || '');
  }, [todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, is_completed: todo.is_completed }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError('Failed to update todo');
      }
    } catch (e) {
      console.error("Error editing todo:", e);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-slate-700/50 relative w-full max-w-lg animate-scale-in">
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-bold text-white">Edit Task</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="text-rose-300 mb-6 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 font-bold">{error}</div>}
          
          <div className="mb-5 relative z-10">
            <label htmlFor="edit-title" className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Title</label>
            <input
              type="text"
              id="edit-title"
              className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-lg font-bold text-white placeholder-white/30 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-8 relative z-10">
            <label htmlFor="edit-description" className="block text-xs font-bold text-white mb-2 uppercase tracking-widest">Description (Optional)</label>
            <textarea
              id="edit-description"
              rows={3}
              className="block w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-base font-medium text-white placeholder-white/30 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
