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
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: string;
  discipline: string;
  groups: string[];
  availability: string[];
  activeGroups: number;
  status: 'active' | 'inactive';
  inactiveReason?: 'psicotecnico' | 'antecedentes_penales';
}

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface VolunteerFormProps {
  volunteer?: Volunteer | null;
  onSubmit: (volunteer: any) => void;
  onCancel: () => void;
}

export default function VolunteerForm({ volunteer, onSubmit, onCancel }: VolunteerFormProps) {
  const [formData, setFormData] = useState<Volunteer>({
    name: '',
    email: '',
    phone: '',
    dni: '',
    birthDate: '',
    discipline: '',
    groups: [],
    availability: [],
    activeGroups: 0,
    status: 'active',
    inactiveReason: undefined
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (volunteer) {
      setFormData({
        ...volunteer,
        groups: volunteer.groups || [],
        availability: volunteer.availability || [],
        inactiveReason: volunteer.inactiveReason
      });
    }
  }, [volunteer]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/disciplines`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDisciplines(res.data.data);
      } catch (error) {
        console.error('❌ Error al obtener disciplinas:', error);
      }
    };

    const fetchGroups = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/groups`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Grupos cargados:', res.data.data);
        setGroups(res.data.data);
      } catch (error) {
        console.error('❌ Error al obtener grupos:', error);
      }
    };

    fetchDisciplines();
    fetchGroups();
  }, []);

  const availableGroups = groups.filter(
    (group) => formData.discipline && group.discipline === formData.discipline
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      inactiveReason: formData.status === 'active' ? undefined : formData.inactiveReason
    };
    onSubmit(volunteer ? { ...submitData, id: volunteer.id } : submitData);
  };

  const handleGroupChange = (groupName: string) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.includes(groupName)
        ? prev.groups.filter((g) => g !== groupName)
        : [...prev.groups, groupName],
      activeGroups: prev.groups.includes(groupName)
        ? prev.activeGroups - 1
        : prev.activeGroups + 1
    }));
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData((prev) => ({
      ...prev,
      status,
      inactiveReason: status === 'active' ? undefined : prev.inactiveReason
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {volunteer ? 'Editar Voluntario' : 'Nuevo Voluntario'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos personales */}
          <InputField label="Nombre Completo" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <InputField label="DNI" id="dni" value={formData.dni} type="text" pattern="[0-9]{8}" required title="DNI debe contener 8 números" onChange={(e) => setFormData({ ...formData, dni: e.target.value })} />
          <InputField label="Fecha de Nacimiento" id="birthDate" value={formData.birthDate} type="date" onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
          <InputField label="Correo Electrónico" id="email" value={formData.email} type="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <InputField label="Teléfono" id="phone" value={formData.phone} type="tel" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

          {/* Disciplina */}
          <div>
            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
              Disciplina
            </label>
            <select
              id="discipline"
              value={formData.discipline}
              onChange={(e) =>
                setFormData({ ...formData, discipline: e.target.value, groups: [], activeGroups: 0 })
              }
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

          {/* Grupos según disciplina */}
          {formData.discipline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupos Disponibles
              </label>
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

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
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

          {/* Motivo de inactividad */}
          {formData.status === 'inactive' && (
            <div>
              <label htmlFor="inactiveReason" className="block text-sm font-medium text-gray-700">
                Motivo de Inactividad
              </label>
              <select
                id="inactiveReason"
                value={formData.inactiveReason}
                onChange={(e) =>
                  setFormData({ ...formData, inactiveReason: e.target.value as 'psicotecnico' | 'antecedentes_penales' })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Seleccionar motivo</option>
                <option value="psicotecnico">Psicotécnico</option>
                <option value="antecedentes_penales">Antecedentes Penales</option>
              </select>
            </div>
          )}

          {/* Botones */}
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

// Componente auxiliar reutilizable para inputs
function InputField({ label, id, value, onChange, ...props }: any) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
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
