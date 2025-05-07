import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  role: 'admin' | 'voluntario' | 'tutor';
  status: 'active' | 'inactive';
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (user: any) => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    password: '',
    role: user?.role || 'admin',
    status: 'active' as const
  });

  const [dniError, setDniError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '' // Clear password when editing
      });
    }
  }, [user]);

  const validateDNI = (dni: string) => {
    const dniRegex = /^[0-9]{8}$/;
    if (!dniRegex.test(dni)) {
      setDniError('El DNI debe contener exactamente 8 números');
      return false;
    }
    setDniError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDNI(formData.dni)) {
      return;
    }
    const submitData = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
    }
    onSubmit(user ? { ...submitData, id: user.id } : submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
              DNI
            </label>
            <input
              type="text"
              id="dni"
              value={formData.dni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setFormData({ ...formData, dni: value });
                if (value.length === 8) {
                  validateDNI(value);
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${
                dniError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
              maxLength={8}
              pattern="[0-9]{8}"
              title="El DNI debe contener 8 números"
            />
            {dniError && (
              <p className="mt-1 text-sm text-red-600">{dniError}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {user ? 'Nueva Contraseña' : 'Contraseña'}
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required={!user}
              minLength={6}
            />
          </div>

          <div>
  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
    Rol
  </label>
  {user ? (
    <select
      id="role"
      value={formData.role}
      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    >
      <option value="admin">Administrador</option>
      <option value="voluntario">Voluntario</option>
      <option value="tutor">Tutor</option>
    </select>
  ) : (
    <>
      <input
        type="text"
        value="Administrador"
        disabled
        className="mt-1 block w-full bg-gray-100 text-gray-700 rounded-md border-gray-300 shadow-sm sm:text-sm cursor-not-allowed"
      />
      <input type="hidden" name="role" value="admin" />
    </>
  )}
</div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}