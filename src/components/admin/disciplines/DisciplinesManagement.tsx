import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import DisciplineForm from './DisciplineForm';
import toast from 'react-hot-toast';

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Group {
  id: number;
  name: string;
  discipline_id: number;
  discipline_name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DisciplinesManagement() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [discRes, groupRes] = await Promise.all([
        axios.get(`${API_URL}/api/disciplines`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDisciplines(discRes.data.data);
      setGroups(groupRes.data.data);
    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      toast.error(error?.response?.data?.message || 'No se pudieron cargar los datos');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDiscipline = async (newDiscipline: Omit<Discipline, 'id'>) => {
    try {
      const res = await axios.post(`${API_URL}/api/disciplines`, newDiscipline, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDisciplines([...disciplines, res.data.data]);
      toast.success('✅ Disciplina creada correctamente');
      setShowForm(false);
    } catch (error: any) {
      console.error('❌ Error al crear disciplina:', error);
      toast.error(error?.response?.data?.message || 'No se pudo crear la disciplina');
    }
  };

  const handleEditDiscipline = async (updatedDiscipline: Discipline) => {
    try {
      await axios.put(`${API_URL}/api/disciplines/${updatedDiscipline.id}`, updatedDiscipline, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDisciplines(disciplines.map((d) =>
        d.id === updatedDiscipline.id ? updatedDiscipline : d
      ));
      toast.success('✅ Disciplina actualizada');
      setShowForm(false);
      setSelectedDiscipline(null);
    } catch (error: any) {
      console.error('❌ Error al actualizar disciplina:', error);
      toast.error(error?.response?.data?.message || 'No se pudo actualizar');
    }
  };

  const handleDeleteDiscipline = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/disciplines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDisciplines(disciplines.filter((d) => d.id !== id));
      toast.success('🗑️ Disciplina eliminada');
    } catch (error: any) {
      console.error('❌ Error al eliminar disciplina:', error);
      toast.error(error?.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const filteredDisciplines = disciplines.filter((discipline) =>
    (discipline.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (discipline.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countGroupsForDiscipline = (disciplineId: number) => {
    return groups.filter((g) => g.discipline_id === disciplineId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar disciplinas..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedDiscipline(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Disciplina
        </button>
      </div>

      {showForm && (
        <DisciplineForm
          discipline={selectedDiscipline}
          onSubmit={selectedDiscipline ? handleEditDiscipline : handleAddDiscipline}
          onCancel={() => {
            setShowForm(false);
            setSelectedDiscipline(null);
          }}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDisciplines.map((discipline) => (
              <tr key={discipline.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{discipline.name}</div>
                    <div className="text-sm text-gray-500">{discipline.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discipline.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {countGroupsForDiscipline(discipline.id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedDiscipline(discipline);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDiscipline(discipline.id)}
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
