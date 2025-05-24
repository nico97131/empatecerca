import { useState, useEffect } from 'react';
import { X, Search, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../../config';

interface Group {
  id: number;
  name: string;
  discipline_id: number;
  maxMembers: number;
  currentMembers: number;
  location: string;
  volunteers?: { id: number; name: string; dni: string }[];
}

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Volunteer {
  id: number;
  name: string;
  dni: string;
}

interface GroupFormProps {
  group?: Group | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GroupForm({ group, onSubmit, onCancel }: GroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    discipline_id: '',
    maxMembers: 15,
    currentMembers: 0,
    location: ''
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [schedules, setSchedules] = useState<{ day: string; time_from: string; time_to: string }[]>([]);
  const [newSchedule, setNewSchedule] = useState({ day: 'Lunes', time_from: '', time_to: '' });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        discipline_id: group.discipline_id ? String(group.discipline_id) : '',
        maxMembers: group.maxMembers,
        currentMembers: group.currentMembers ?? 0,
        location: group.location ?? ''
      });
      setSelectedVolunteers(group.volunteers?.map(v => v.id) || []);
    } else {
      setFormData({
        name: '',
        discipline_id: '',
        maxMembers: 15,
        currentMembers: 0,
        location: ''
      });
      setSelectedVolunteers([]);
      setSchedules([]);
    }
  }, [group]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchDisciplines = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/disciplines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDisciplines(res.data?.data || []);
      } catch (error) {
        toast.error('Error al obtener disciplinas');
      }
    };

const fetchVolunteers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/volunteers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVolunteers(
          (res.data?.data || []).filter((v: Volunteer) => v.name && v.dni).sort((a: Volunteer, b: Volunteer) => a.name.localeCompare(b.name))
        );
      } catch (error) {
        toast.error('Error al obtener voluntarios');
      }
    };

    fetchDisciplines();
    fetchVolunteers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const preparedData = {
      name: formData.name?.trim() || null,
      discipline_id: formData.discipline_id ? parseInt(formData.discipline_id) : null,
      maxMembers: formData.maxMembers ?? null,
      currentMembers: formData.currentMembers ?? 0,
      location: formData.location?.trim() || null,
      volunteers: selectedVolunteers ?? [],
      schedules: schedules ?? []
    };

    try {
      if (group) {
        await axios.put(`${API_URL}/api/groups/${group.id}`, preparedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/groups`, preparedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      onSubmit();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al guardar el grupo');
    }
  };

  const filteredVolunteers = volunteers.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.dni.includes(searchTerm)
  );



  const handleAddSchedule = () => {
    if (newSchedule.time_from && newSchedule.time_to) {
      setSchedules([...schedules, newSchedule]);
      setNewSchedule({ day: 'Lunes', time_from: '', time_to: '' });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
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
          <Input label="Nombre del Grupo" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div>
            <label htmlFor="discipline_id" className="block text-sm font-medium text-gray-700">Disciplina</label>
            <select
              id="discipline_id"
              value={formData.discipline_id}
              onChange={(e) => setFormData({ ...formData, discipline_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Seleccionar disciplina</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          {/* Horarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horarios</label>
            <div className="flex items-center space-x-2">
              <select
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                className="border rounded-md px-2 py-1 text-sm"
              >
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input type="time" value={newSchedule.time_from} onChange={(e) => setNewSchedule({ ...newSchedule, time_from: e.target.value })} className="border rounded-md px-2 py-1 text-sm" />
              <input type="time" value={newSchedule.time_to} onChange={(e) => setNewSchedule({ ...newSchedule, time_to: e.target.value })} className="border rounded-md px-2 py-1 text-sm" />
              <button type="button" onClick={handleAddSchedule} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">
                Agregar
              </button>
            </div>

            <ul className="mt-2 space-y-1 text-sm">
              {schedules.map((s, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded">
                  {s.day} de {s.time_from} a {s.time_to}
                  <button type="button" onClick={() => handleRemoveSchedule(idx)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Input label="Capacidad Máxima" id="maxMembers" type="number" value={formData.maxMembers} onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })} min={1} />
          <Input label="Ubicación" id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

          {/* Voluntarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voluntarios asignados</label>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {filteredVolunteers.map((vol) => (
                <div key={vol.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`vol-${vol.id}`}
                    checked={selectedVolunteers.includes(vol.id)}
                    onChange={(e) =>
                      setSelectedVolunteers((prev) =>
                        e.target.checked ? [...prev, vol.id] : prev.filter((id) => id !== vol.id)
                      )
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`vol-${vol.id}`} className="text-sm text-gray-700">
                    {vol.name || 'Sin nombre'} (DNI: {vol.dni})
                  </label>

                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700">
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

