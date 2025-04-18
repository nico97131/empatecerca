import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface DisciplineFormProps {
  discipline?: Discipline | null;
  onSubmit: (discipline: Discipline | Omit<Discipline, 'id'>) => void;
  onCancel: () => void;
}

export default function DisciplineForm({ discipline, onSubmit, onCancel }: DisciplineFormProps) {
  const [formData, setFormData] = useState<Omit<Discipline, 'id'>>({
    name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (discipline) {
      const { id, ...rest } = discipline;
      setFormData(rest);
    }
  }, [discipline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (discipline) {
      onSubmit({ ...formData, id: discipline.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {discipline ? 'Editar Disciplina' : 'Nueva Disciplina'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
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
              {discipline ? 'Guardar Cambios' : 'Crear Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
