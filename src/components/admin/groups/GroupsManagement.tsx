import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import GroupForm from './GroupForm';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../../config';

interface Group {
  id: number;
  name: string;
  discipline_id: number;
  discipline_name: string;
  maxMembers: number;
  currentMembers: number;
  location?: string;
  volunteers?: { id: number; name: string; dni: string }[];
  schedules?: { day: string; time_from: string; time_to: string }[];
}

export default function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [action, setAction] = useState<'create' | 'edit' | null>(null);

  const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data.data);
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar grupos');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmitDone = async () => {
    await fetchGroups();
    if (action === 'create') toast.success('Grupo creado correctamente');
    if (action === 'edit') toast.success('Grupo actualizado correctamente');
    setSelectedGroup(null);
    setShowForm(false);
    setAction(null);
  };

  const handleDeleteGroup = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Grupo eliminado');
      await fetchGroups();
    } catch (error: any) {
      console.error(error);
      toast.error('Error al eliminar grupo');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.discipline_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar grupos..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedGroup(null);
            setAction('create');
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Grupo
        </button>
      </div>

      {showForm && (
        <GroupForm
          group={selectedGroup}
          onSubmit={handleSubmitDone}
          onCancel={() => {
            setShowForm(false);
            setSelectedGroup(null);
            setAction(null);
          }}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voluntarios Asignados</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGroups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {group.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.discipline_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.schedules && group.schedules.length > 0
                    ? group.schedules.map(s => `${s.day} ${s.time_from}-${s.time_to}`).join(', ')
                    : 'No cargado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.currentMembers}/{group.maxMembers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {group.volunteers?.length ?? 0} asignados
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setAction('edit');
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
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
