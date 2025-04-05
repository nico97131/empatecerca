import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Mail } from 'lucide-react';
import VolunteerForm from './VolunteerForm';
import ScheduleModal from './ScheduleModal';
import axios from 'axios';
import { mockVolunteers } from '../../../data/mockVolunteers';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: string;
  discipline: string;
  availability: string[];
  activeGroups: number;
  status: 'active' | 'inactive';
  inactiveReason?: 'psicotecnico' | 'antecedentes_penales';
  specialization?: string; // Para mapear con disciplina si existiera
}

interface Discipline {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function VolunteersManagement() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    // 🚀 Traer disciplinas reales desde MySQL
    const fetchDisciplines = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/disciplines');
        setDisciplines(res.data.data);
      } catch (error) {
        console.error('Error al obtener disciplinas:', error);
      }
    };

    fetchDisciplines();
  }, []);

  useEffect(() => {
    // Mapear mockVolunteers con disciplinas reales por categoría
    const mapped = mockVolunteers.map((volunteer) => {
      const matched = disciplines.find(d => d.category === volunteer.specialization);
      return {
        ...volunteer,
        discipline: matched?.name || 'Sin asignar',
        birthDate: volunteer.joinDate // si usás joinDate como mock
      };
    });

    setVolunteers(mapped);
  }, [disciplines]);

  const handleAddVolunteer = (newVolunteer: Omit<Volunteer, 'id'>) => {
    setVolunteers([...volunteers, { ...newVolunteer, id: volunteers.length + 1 }]);
    setShowForm(false);
  };

  const handleEditVolunteer = (updatedVolunteer: Volunteer) => {
    setVolunteers(volunteers.map(v =>
      v.id === updatedVolunteer.id ? updatedVolunteer : v
    ));
    setSelectedVolunteer(null);
    setShowForm(false);
  };

  const handleDeleteVolunteer = (id: number) => {
    setVolunteers(volunteers.filter(v => v.id !== id));
  };

  const getInactiveReasonLabel = (reason?: 'psicotecnico' | 'antecedentes_penales') => {
    switch (reason) {
      case 'psicotecnico':
        return 'Psicotécnico';
      case 'antecedentes_penales':
        return 'AP';
      default:
        return '';
    }
  };

  const filteredVolunteers = volunteers.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.dni.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar voluntarios..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedVolunteer(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Voluntario
        </button>
      </div>

      {showForm && (
        <VolunteerForm
          volunteer={selectedVolunteer}
          onSubmit={selectedVolunteer ? handleEditVolunteer : handleAddVolunteer}
          onCancel={() => {
            setShowForm(false);
            setSelectedVolunteer(null);
          }}
        />
      )}

      {showSchedule && selectedVolunteer && (
        <ScheduleModal
          volunteer={selectedVolunteer}
          onClose={() => {
            setShowSchedule(false);
            setSelectedVolunteer(null);
          }}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voluntario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos Activos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVolunteers.map((volunteer) => (
              <tr key={volunteer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                    <div className="text-sm text-gray-500">{volunteer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.discipline}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{volunteer.activeGroups}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      volunteer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {volunteer.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    {volunteer.status === 'inactive' && volunteer.inactiveReason && (
                      <span className="mt-1 text-xs text-gray-500">
                        Motivo: {getInactiveReasonLabel(volunteer.inactiveReason)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedVolunteer(volunteer);
                      setShowSchedule(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 mr-4"
                    title="Ver horario"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.location.href = `mailto:${volunteer.email}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Enviar correo"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVolunteer(volunteer);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVolunteer(volunteer.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
