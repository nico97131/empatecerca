import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, User as UserIcon } from 'lucide-react';
import type { User as UserType } from '../../types/auth';

interface UserManagementProps {
  users: UserType[];
  onAddUser: (user: Omit<UserType, 'id'>) => void;
  onEditUser: (id: number, user: Partial<UserType>) => void;
  onDeleteUser: (id: number) => void;
}

export default function UserManagement({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const roleLabels = {
    admin: 'Administrador',
    voluntario: 'Voluntario',
    tutor: 'Tutor'
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Gestión de Usuarios</h3>
        <button
          onClick={() => setIsAddingUser(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Usuario
        </button>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {roleLabels[user.role]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Edit className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}