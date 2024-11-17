import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'completed';
}

interface TasksListProps {
  tasks: Task[];
  onTaskComplete: (id: number) => void;
}

export default function TasksList({ tasks, onTaskComplete }: TasksListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[priority];
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Tareas Pendientes
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>Vence el {task.dueDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {task.status === 'pending' ? (
                    <button
                      onClick={() => onTaskComplete(task.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completar
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-sm leading-5 font-medium text-green-700 bg-green-100 rounded-md">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completado
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}