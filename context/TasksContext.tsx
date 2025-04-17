import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TaskCategory = 'Work' | 'Personal' | 'Other';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  createdAt: Date;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (title: string, category: TaskCategory) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  getFilteredTasks: (category: TaskCategory | 'All') => Task[];
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string, category: TaskCategory) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      category,
      createdAt: new Date(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const getFilteredTasks = (category: TaskCategory | 'All') => {
    if (category === 'All') {
      return tasks;
    }
    return tasks.filter((task) => task.category === category);
  };

  const value = {
    tasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    getFilteredTasks,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};