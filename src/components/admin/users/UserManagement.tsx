import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield } from 'lucide-react';
import UserForm from './UserForm';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: 'admin' | 'voluntario' | 'tutor';
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Traer usuarios desde backend
  useEffect(() => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error al obtener usuarios:', err));
  }, []);

  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const res = await axios.post('/api/users', newUser);
      setUsers([...users, res.data]);
      setShowForm(false);
    } catch (err) {
      console.error('Error al agregar usuario:', err);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      await axios.put(`/api/users/${updatedUser.id}`, updatedUser);
      setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error al editar usuario:', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  const getRoleLabel = (role: User['role']) => ({
    admin: 'Administrador',
    voluntario: 'Voluntario',
    tutor: 'Tutor'
  })[role];

  const getRoleColor = (role: User['role']) => ({
    admin: 'bg-purple-100 text-purple-800',
    voluntario: 'bg-blue-100 text-blue-800',
    tutor: 'bg-green-100 text-green-800'
  })[role];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dni.includes(searchTerm) ||
    getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Buscador y botón */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <UserForm
          user={selectedUser}
          onSubmit={selectedUser ? handleEditUser : handleAddUser}
          onCancel={() => {
            setShowForm(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Tabla */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acceso</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.dni}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
