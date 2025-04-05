import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
  maxMembers: number;
  currentMembers: number;
  location: string;
  volunteerInCharge?: number | null;
}

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
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
    schedule: '',
    maxMembers: 15,
    currentMembers: 0,
    location: '',
    volunteerInCharge: null as number | null
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  useEffect(() => {
    if (group) {
      setFormData({
        ...group,
        volunteerInCharge: group.volunteerInCharge ?? null,
        location: group.location ?? ''
      });
    }
  }, [group]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/disciplines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[GroupForm] ✅ Disciplinas recibidas:', res.data);
        setDisciplines(res.data?.data || res.data);
      } catch (error) {
        console.error('[GroupForm] ❌ Error al obtener disciplinas:', error);
      }
    };

    fetchDisciplines();
  }, []);

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
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre del Grupo" id="name" value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

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
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.name}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Horario" id="schedule" value={formData.schedule}
                 onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                 placeholder="Ej: Lunes y Miércoles 15:00-16:30" />

          <Input label="Capacidad Máxima" id="maxMembers" type="number" value={formData.maxMembers}
                 onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                 min={1} />

          <Input label="Ubicación" id="location" value={formData.location}
                 onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

          <Input label="ID de Voluntario a cargo (opcional)" id="volunteerInCharge"
                 value={formData.volunteerInCharge ?? ''}
                 onChange={(e) => setFormData({
                   ...formData,
                   volunteerInCharge: e.target.value === '' ? null : parseInt(e.target.value)
                 })} placeholder="Ej: 2" />

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

function Input({ label, id, value, onChange, ...props }: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        {...props}
      />
    </div>
  );
}
