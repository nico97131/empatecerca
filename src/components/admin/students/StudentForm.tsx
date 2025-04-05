import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import axios from 'axios';
import { mockTutors } from '../../../data/mockTutors';
import { API_URL } from '../../../config';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  tutorId: number;
  discipline?: string;
  groupId?: number;
}

interface Discipline {
  id: number;
  name: string;
  category: string;
  description: string;
}

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
}

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (student: any) => void;
  onCancel: () => void;
}

export default function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    tutorId: 0,
    discipline: '',
    groupId: 0
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [dniError, setDniError] = useState('');
  const [showTutorSearch, setShowTutorSearch] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        discipline: student.discipline || '',
        groupId: student.groupId || 0
      });
    }
  }, [student]);

  useEffect(() => {
    const fetchDisciplinesAndGroups = async () => {
      const token = localStorage.getItem('token');
      try {
        const [discRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/api/disciplines`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setDisciplines(discRes.data.data);
        setGroups(groupRes.data.data);
      } catch (error) {
        console.error('❌ Error al obtener disciplinas o grupos:', error);
      }
    };

    fetchDisciplinesAndGroups();
  }, []);

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
    if (!validateDNI(formData.dni)) return;

    const submitData = {
      ...formData,
      discipline: formData.discipline || undefined,
      groupId: formData.groupId || undefined
    };
    onSubmit(student ? { ...submitData, id: student.id } : submitData);
  };

  const availableGroups = groups.filter(
    (group) => formData.discipline && group.discipline === formData.discipline
  );

  const filteredTutors = mockTutors.filter(tutor =>
    tutorSearchTerm
      ? tutor.name.toLowerCase().includes(tutorSearchTerm.toLowerCase()) ||
        tutor.dni.includes(tutorSearchTerm)
      : true
  );

  const selectedTutor = mockTutors.find(t => t.id === formData.tutorId);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {student ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Nombre" id="firstName" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
          <InputField label="Apellido" id="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
            <input
              type="text"
              id="dni"
              value={formData.dni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                setFormData({ ...formData, dni: value });
                if (value.length === 8) validateDNI(value);
              }}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${
                dniError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
              }`}
              required
              maxLength={8}
              pattern="[0-9]{8}"
              title="El DNI debe contener 8 números"
            />
            {dniError && <p className="mt-1 text-sm text-red-600">{dniError}</p>}
          </div>

          <InputField label="Fecha de Nacimiento" id="birthDate" type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />

          {/* Tutor */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Tutor</label>
            <div className="mt-1 relative">
              <input
                type="text"
                value={selectedTutor ? `${selectedTutor.name} (DNI: ${selectedTutor.dni})` : ''}
                onClick={() => setShowTutorSearch(true)}
                readOnly
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
                placeholder="Seleccionar tutor"
                required
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {showTutorSearch && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                <div className="p-2">
                  <input
                    type="text"
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <ul className="max-h-60 overflow-auto">
                  {filteredTutors.map((tutor) => (
                    <li
                      key={tutor.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, tutorId: tutor.id });
                        setShowTutorSearch(false);
                        setTutorSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{tutor.name}</div>
                      <div className="text-sm text-gray-500">DNI: {tutor.dni}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disciplina */}
          <div>
            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
              Disciplina
            </label>
            <select
              id="discipline"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value, groupId: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar disciplina</option>
              {disciplines.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          {formData.discipline && (
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">Grupo</label>
              <select
                id="groupId"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="0">Sin asignación</option>
                {availableGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.schedule}
                  </option>
                ))}
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
              {student ? 'Guardar Cambios' : 'Crear Alumno'}
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
