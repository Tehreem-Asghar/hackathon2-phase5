import React from 'react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md overflow-y-auto h-full w-full flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-rose-500/20 relative w-full max-w-md animate-scale-in">
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-rose-500/10 rounded-full border-2 border-rose-500/20 mb-4">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Are You Sure?</h3>
          <p className="text-slate-400 font-medium mb-8">
            This action is permanent and cannot be undone. All data associated with this task will be lost.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-white/20 rounded-xl text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-lg shadow-rose-900/40 text-sm font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all transform hover:scale-105 active:scale-95"
          >
            Yes, Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
