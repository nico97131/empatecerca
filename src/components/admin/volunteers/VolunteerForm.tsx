import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
}

interface Volunteer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni: string;
  join_date: string;
  discipline_id: number | null;
  groups: string[];
  availability: string[];
  activeGroups: number;
  status: 'active' | 'inactive';
  inactive_reason?: 'psicotecnico' | 'antecedentes_penales';
}

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface VolunteerFormProps {
  volunteer?: Volunteer | null;
  onSubmit: (volunteer: Volunteer) => void;
  onCancel: () => void;
}

export default function VolunteerForm({ volunteer, onSubmit, onCancel }: VolunteerFormProps) {
  const [formData, setFormData] = useState<Volunteer>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dni: '',
    join_date: '',
    discipline_id: null,
    groups: [],
    availability: [],
    activeGroups: 0,
    status: 'active',
    inactive_reason: undefined
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (volunteer) {
      const [first_name, ...rest] = (volunteer.name || '').split(' ');
      const last_name = rest.join(' ');
      
      setFormData({
        ...volunteer,
        first_name,
        last_name,
        join_date: formatDateInput(volunteer.join_date),
        groups: volunteer.groups || [],
        availability: volunteer.availability || [],
        inactive_reason: volunteer.inactive_reason
      });
    }
  }, [volunteer]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [discRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/api/disciplines`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setDisciplines(discRes.data.data);
        setGroups(groupRes.data.data);
      } catch (err) {
        console.error('❌ Error al obtener disciplinas o grupos:', err);
      }
    };
    fetchData();
  }, []);

  const availableGroups = groups.filter(
    (group) => formData.discipline_id && group.discipline_id === formData.discipline_id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      discipline_id: formData.discipline_id ?? null,
      inactive_reason: formData.status === 'active' ? undefined : formData.inactive_reason
    };
    onSubmit(volunteer?.id ? { ...submitData, id: volunteer.id } : submitData);
  };
  

  const handleGroupChange = (groupName: string) => {
    setFormData((prev) => {
      const isSelected = prev.groups.includes(groupName);
      const updatedGroups = isSelected
        ? prev.groups.filter((g) => g !== groupName)
        : [...prev.groups, groupName];

      return {
        ...prev,
        groups: updatedGroups,
        activeGroups: updatedGroups.length
      };
    });
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData((prev) => ({
      ...prev,
      status,
      inactive_reason: status === 'active' ? undefined : prev.inactive_reason
    }));
  };

  const formatDateInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {volunteer ? 'Editar Voluntario' : 'Nuevo Voluntario'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Nombre" id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
          <InputField label="Apellido" id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
          <InputField label="DNI" id="dni" value={formData.dni} type="text" pattern="[0-9]{8}" required title="DNI debe contener 8 números" onChange={(e) => setFormData({ ...formData, dni: e.target.value })} />
          <InputField label="Fecha de Ingreso" id="join_date" value={formData.join_date} type="date" required onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} />
          <InputField label="Correo Electrónico" id="email" value={formData.email} type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <InputField label="Teléfono" id="phone" value={formData.phone} type="tel" required onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

          <div>
            <label htmlFor="discipline_id" className="block text-sm font-medium text-gray-700">Disciplina</label>
            <select
              id="discipline_id"
              value={formData.discipline_id ?? ''}
              onChange={(e) => {
              const value = e.target.value === '' ? null : parseInt(e.target.value);
              setFormData({ ...formData, discipline_id: value, groups: [], activeGroups: 0 });
            }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Sin disciplina asignada</option>
            {disciplines.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
            </select>

          </div>

          {formData.discipline_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grupos Disponibles</label>
              <div className="space-y-2">
                {availableGroups.map((group) => (
                  <label key={group.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.groups.includes(group.name)}
                      onChange={() => handleGroupChange(group.name)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {group.name} - {group.schedule}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value as 'active' | 'inactive')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {formData.status === 'inactive' && (
            <div>
              <label htmlFor="inactive_reason" className="block text-sm font-medium text-gray-700">Motivo de Inactividad</label>
              <select
                id="inactive_reason"
                value={formData.inactive_reason}
                onChange={(e) => setFormData({ ...formData, inactive_reason: e.target.value as any })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar motivo</option>
                <option value="psicotecnico">Psicotécnico</option>
                <option value="antecedentes">Antecedentes</option>
                <option value="otro">Otro</option>
              </select>

            </div>
          )}

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
              {volunteer ? 'Guardar Cambios' : 'Crear Voluntario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, id, value, onChange, ...props }: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        {...props}
      />
    </div>
  );
}
