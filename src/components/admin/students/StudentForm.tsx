import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import axios from 'axios';
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

interface Tutor {
  id: number;
  name: string;
  dni: string;
  email: string;
  phone: string;
  joinDate: string;
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
  discipline_id: number | null;
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
    discipline: 0,
    groupIds: [] as number[],
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [dniError, setDniError] = useState('');
  const [showTutorSearch, setShowTutorSearch] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [discRes, groupRes, tutorRes] = await Promise.all([
          axios.get(`${API_URL}/api/disciplines`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/groups`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/tutors`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDisciplines(discRes.data.data);
        setGroups(groupRes.data.data);
        setTutors(tutorRes.data.data);

        if (student) {
          const matchedDiscipline = discRes.data.data.find((d: Discipline) => d.name === student.discipline);
          const disciplineId = matchedDiscipline?.id || 0;
          const formattedDate = student.birthDate
            ? new Date(student.birthDate).toISOString().split('T')[0]
            : '';

          setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            dni: student.dni,
            birthDate: formattedDate,
            tutorId: student.tutorId,
            discipline: disciplineId,
            groupIds: Array.isArray(student.groupId) ? student.groupId : student.groupId ? [student.groupId] : []
          });
        }
      } catch (error) {
        console.error('❌ Error al obtener disciplinas, grupos o tutores:', error);
      }
    };

    fetchData();
  }, [student]);

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
groupIds: formData.groupIds || []
    };
    onSubmit(student ? { ...submitData, id: student.id } : submitData);
  };

  const availableGroups = groups.filter(group =>
    formData.discipline && group.discipline_id === formData.discipline
  );

  const filteredTutors = tutors.filter(tutor =>
    tutorSearchTerm
      ? tutor.name.toLowerCase().includes(tutorSearchTerm.toLowerCase()) ||
      tutor.dni.includes(tutorSearchTerm)
      : true
  );

  const selectedTutor = tutors.find(t => t.id === formData.tutorId);

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
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm ${dniError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                }`}
              required
              maxLength={8}
              pattern="[0-9]{8}"
              title="El DNI debe contener 8 números"
            />
            {dniError && <p className="mt-1 text-sm text-red-600">{dniError}</p>}
          </div>

          <InputField
            label="Fecha de Nacimiento"
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
          />

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
            <div className="relative">
              <input
                type="text"
                value={selectedTutor ? `${selectedTutor.name} (DNI: ${selectedTutor.dni})` : ''}
                onClick={() => setShowTutorSearch(true)}
                readOnly
                className="block w-full pr-10 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
                placeholder="Seleccionar tutor"
                required
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
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

          <div>
            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">Disciplina</label>
            <select
              id="discipline"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: Number(e.target.value), groupId: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={0}>Seleccionar disciplina</option>
              {disciplines.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {formData.discipline !== 0 && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Grupos asignados</label>
    
    {/* Selector y botón agregar */}
    <div className="flex items-center space-x-2">
      <select
        value={selectedGroupId}
        onChange={(e) => setSelectedGroupId(Number(e.target.value))}
        className="border rounded-md px-2 py-1 text-sm w-full"
      >
        <option value={0}>Seleccionar grupo</option>
        {groups
          .filter(group => group.discipline_id === formData.discipline)
          .map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
      </select>
      <button
        type="button"
        onClick={() => {
          if (
            selectedGroupId !== 0 &&
            !formData.groupIds.includes(selectedGroupId)
          ) {
            setFormData(prev => ({
              ...prev,
              groupIds: [...prev.groupIds, selectedGroupId]
            }));
            setSelectedGroupId(0);
          }
        }}
        className="px-2 py-1 bg-indigo-600 text-white rounded text-sm"
      >
        Agregar
      </button>
    </div>

    {/* Lista de grupos seleccionados */}
    <ul className="mt-2 space-y-1 text-sm">
      {formData.groupIds.map((groupId, index) => {
        const group = groups.find(g => g.id === groupId);
        return (
          <li
            key={groupId}
            className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded"
          >
            {group?.name || 'Grupo'}
            <button
              type="button"
              onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  groupIds: prev.groupIds.filter(id => id !== groupId)
                }))
              }
              className="text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
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
