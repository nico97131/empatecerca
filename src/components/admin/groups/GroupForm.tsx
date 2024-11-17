import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { mockDisciplines } from '../../../data/mockDisciplines';

interface Group {
  id: number;
  name: string;
  discipline: string;
  maxMembers: number;
  schedule: string;
  currentMembers: number;
}

interface GroupFormProps {
  group?: Group | null;
  onSubmit: (group: any) => void;
  onCancel: () => void;
}

export default function GroupForm({ group, onSubmit, onCancel }: GroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    discipline: '',
    maxMembers: 15,
    schedule: '',
    currentMembers: 0
  });

  useEffect(() => {
    if (group) {
      setFormData(group);
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(group ? { ...formData, id: group.id } : formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {group ? 'Editar Grupo' : 'Nuevo Grupo'}
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
              Nombre
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
            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
              Disciplina
            </label>
            <select
              id="discipline"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Seleccionar disciplina</option>
              {mockDisciplines.map(discipline => (
                <option key={discipline.id} value={discipline.name}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
              Horario
            </label>
            <input
              type="text"
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="ej: Lunes y Miércoles 15:00-16:30"
            />
          </div>

          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
              Capacidad
            </label>
            <input
              type="number"
              id="maxMembers"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="1"
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
              {group ? 'Guardar Cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}