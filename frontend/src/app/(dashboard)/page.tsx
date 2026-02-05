'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Todo, TodoItem } from '@/components/todo/TodoItem';
import { AddTodoForm } from '@/components/forms/AddTodoForm';
import { EditTodoForm } from '@/components/forms/EditTodoForm';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
      const res = await api.fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Failed to fetch todos", error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  const handleToggle = async (id: string, is_completed: boolean) => {
      // Optimistic update
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed } : t));
      
      try {
          const res = await api.fetch(`/api/todos/${id}/complete`, {
              method: 'PATCH'
          });
          if (!res.ok) {
              // Revert on failure
              fetchTodos();
          }
      } catch (e) {
          console.error("Error with todo operation:", e);
          fetchTodos();
      }
  };

  // Opens the confirmation modal
  const handleDeleteRequest = (id: string) => {
    setTodoToDelete(id);
    setShowDeleteModal(true);
  };

  // Performs the actual deletion
  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;

    const originalTodos = todos;
    // Optimistic update
    setTodos(todos.filter(t => t.id !== todoToDelete));
    setShowDeleteModal(false);

    try {
        const res = await api.fetch(`/api/todos/${todoToDelete}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            setTodos(originalTodos); // Revert on failure
        }
    } catch (e) {
        console.error("Error with todo operation:", e);
        setTodos(originalTodos); // Revert on failure
    } finally {
      setTodoToDelete(null);
    }
  };

  const handleEdit = (todo: Todo) => {
      setEditingTodo(todo);
  };

  if (loading) return (  <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
               <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
               <p className="text-white font-black text-sm tracking-widest uppercase">Loading auth...</p>
            </div>)
  //  <div className="p-8 text-center text-slate-600 font-bold">Loading auth...</div>;
  if (!user) return null; // AuthProvider handles redirect 

  return (
    <div className="min-h-screen">
      <nav className="glass-panel sticky top-0 z-40 shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2 rounded-xl mr-3 shadow-md animate-scale-in">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900  text-white animate-fade-in">
                Task<span className="text-violet-600">Master</span>
              </span>
            </div>
            <div className="flex items-center space-x-6 animate-fade-in stagger-1">
              <div className="hidden sm:flex items-center px-4 py-1.5 bg-slate-100/10 rounded-full border border-white/20 shadow-sm">
                <div className="h-2 w-2 bg-emerald-400 rounded-full mr-2.5 animate-pulse shadow-sm"></div>
                <span className="text-sm font-bold text-white">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-white hover:text-white/80 text-sm font-black transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <header className="max-w-3xl mx-auto mb-10 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                Dashboard
              </h1>
              <p className="text-white text-lg font-bold">
                Overview <span className="text-white/40 mx-2">•</span> 
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/20 text-white border border-white/30">
                  {todos.filter(t => !t.is_completed).length} Tasks Pending
                </span>
              </p>
            </div>
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`group relative inline-flex items-center px-6 py-3 border border-white/20 text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                  showAddForm 
                  ? 'bg-slate-800 hover:bg-slate-900' 
                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/40'
                }`}
            >
                <span className="mr-2 text-lg leading-none">{showAddForm ? '✕' : '+'}</span>
                {showAddForm ? 'Close' : 'New Task'}
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto">
          {showAddForm && (
            <div className="animate-scale-in origin-top">
              <AddTodoForm 
                  onSuccess={() => {
                      setShowAddForm(false);
                      fetchTodos();
                  }}
                  onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {isLoadingTodos ? (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
               <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
               <p className="text-white font-black text-sm tracking-widest uppercase">Fetching tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-2xl animate-slide-up border-dashed border-2 border-white/20">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/10 mb-4 border border-white/20">
                <svg className="h-10 w-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-1">No tasks today</h3>
              <p className="text-white/80 font-bold">Ready to start something new? Create a task!</p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up pb-20">
              {todos.map((todo, index) => (
                <div key={todo.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <TodoItem
                    todo={todo}
                    onToggle={handleToggle}
                    onDelete={handleDeleteRequest}
                    onEdit={handleEdit}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {editingTodo && (
          <EditTodoForm
              todo={editingTodo}
              onSuccess={() => {
                  setEditingTodo(null);
                  fetchTodos();
              }}
              onCancel={() => setEditingTodo(null)}
          />
      )}

                  {showDeleteModal && (

                    <ConfirmDeleteModal

                      onConfirm={handleConfirmDelete}

                      onCancel={() => setShowDeleteModal(false)}

                    />

                  )}

            

                              {/* Floating Chatbot Button */}

            

                              {!showChat && (

            

                                <button 

            

                                  onClick={() => setShowChat(true)}

            

                                  className="fixed bottom-6 right-6 h-16 w-16 bg-white rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] border-2 border-violet-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 overflow-hidden cursor-pointer animate-fade-in hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] ring-4 ring-violet-500/20"

            

                                  title="Open Chatbot"

            

                                >

            

                                  <div className="absolute inset-0 bg-violet-500/10 animate-pulse rounded-full"></div>

            

                                  <img 

            

                                    src="/bot-icon.webp" 

            

                                    alt="Chatbot" 

            

                                    className="w-full h-full object-cover relative z-10"

            

                                  />

            

                                </button>

            

                              )}

            

                        

            

                  

            

                  {/* Chat Sidebar Drawer */}

                  <div 

                    className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 border-l border-slate-200 ${

                      showChat ? 'translate-x-0' : 'translate-x-full'

                    }`}

                  >

                    <div className="flex flex-col h-full pt-16 sm:pt-0"> {/* Padding top on mobile to avoid nav collision if needed, but z-40 is high */}

                       {/* Header for Chat Sidebar */}

                       <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm">

                          <h3 className="font-bold text-slate-700 flex items-center gap-2">

                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

                            Todo Assistant

                          </h3>

                          <button 

                            onClick={() => setShowChat(false)}

                            className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"

                          >

                            ✕

                          </button>

                       </div>

                                              <div className="flex-1 overflow-hidden relative">

                                                 <ChatInterface onUpdate={fetchTodos} />

                                              </div>

                                           </div>

                       

                  </div>

                </div>

              );

            }