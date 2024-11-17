import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { mockDisciplines } from '../../../data/mockDisciplines';
import { mockGroups } from '../../../data/mockGroups';

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

interface VolunteerFormProps {
  volunteer?: Volunteer | null;
  onSubmit: (volunteer: any) => void;
  onCancel: () => void;
}

export default function VolunteerForm({ volunteer, onSubmit, onCancel }: VolunteerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    birthDate: '',
    discipline: '',
    groups: [] as string[],
    availability: [] as string[],
    activeGroups: 0,
    status: 'active' as const,
    inactiveReason: undefined as undefined | 'psicotecnico' | 'antecedentes_penales'
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      inactiveReason: formData.status === 'active' ? undefined : formData.inactiveReason
    };
    onSubmit(volunteer ? { ...submitData, id: volunteer.id } : submitData);
  };

  // Get available groups for selected discipline
  const availableGroups = mockGroups.filter(
    group => formData.discipline && group.discipline === formData.discipline
  );

  const handleGroupChange = (groupName: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupName)
        ? prev.groups.filter(g => g !== groupName)
        : [...prev.groups, groupName],
      activeGroups: prev.groups.includes(groupName)
        ? prev.activeGroups - 1
        : prev.activeGroups + 1
    }));
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({
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
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              pattern="[0-9]{8}"
              title="DNI debe contener 8 números"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="birthDate"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  discipline: e.target.value,
                  groups: [],
                  activeGroups: 0
                });
              }}
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

          {formData.discipline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupos Disponibles
              </label>
              <div className="space-y-2">
                {availableGroups.map(group => (
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

          {formData.status === 'inactive' && (
            <div>
              <label htmlFor="inactiveReason" className="block text-sm font-medium text-gray-700">
                Motivo de Inactividad
              </label>
              <select
                id="inactiveReason"
                value={formData.inactiveReason}
                onChange={(e) => setFormData({ ...formData, inactiveReason: e.target.value as 'psicotecnico' | 'antecedentes_penales' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Seleccionar motivo</option>
                <option value="psicotecnico">Psicotécnico</option>
                <option value="antecedentes_penales">AP (Antecedentes Penales)</option>
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