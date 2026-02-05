import React, { useState } from 'react';
import { api } from '@/lib/api';

interface AddTodoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
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
