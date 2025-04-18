import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Tutor {
  id?: number;
  name: string;
  dni: string;
  email?: string;
  phone?: string;
  wantsUser: boolean;
}

interface TutorFormProps {
  tutor?: Tutor | null;
  onSubmit: (tutor: Tutor | Omit<Tutor, 'id'>) => void;
  onCancel: () => void;
}

export default function TutorForm({ tutor, onSubmit, onCancel }: TutorFormProps) {
  const [formData, setFormData] = useState<Omit<Tutor, 'id'>>({
    name: '',
    dni: '',
    email: '',
    phone: '',
    wantsUser: false
  });

  useEffect(() => {
    if (tutor) {
      const { id, ...rest } = tutor;
      setFormData({
        ...rest,
        email: rest.email ?? '',
        phone: rest.phone ?? '',
        wantsUser: rest.wantsUser ?? false
      });
    }
  }, [tutor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tutor) {
      onSubmit({ ...formData, id: tutor.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {tutor ? 'Editar Tutor' : 'Nuevo Tutor'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
            <input
              type="text"
              id="dni"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              pattern="[0-9]{8}"
              title="DNI debe contener 8 números"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico (opcional)</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="wantsUser"
              checked={formData.wantsUser}
              onChange={(e) => setFormData({ ...formData, wantsUser: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="wantsUser" className="ml-2 block text-sm text-gray-700">
              ¿Desea acceder a la aplicación?
            </label>
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
              {tutor ? 'Guardar Cambios' : 'Crear Tutor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
