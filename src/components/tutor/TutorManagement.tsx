import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config';
import TutorForm from './TutorForm';

interface Tutor {
  id: number;
  name: string;
  dni: string;
  email?: string;
  phone?: string;
  wantsUser?: boolean;
  join_date?: string;
}

export default function TutorManagement() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  const fetchTutors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tutors`);
      setTutors(res.data.data);
    } catch (error: any) {
      console.error('❌ Error al cargar tutores:', error);
      toast.error('Error al cargar tutores');
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleSubmit = async (tutor: Tutor | Omit<Tutor, 'id'>) => {
    try {
      if ('id' in tutor) {
        const res = await axios.put(`${API_URL}/api/tutors/${tutor.id}`, tutor);
        toast.success(res.data.message || 'Tutor actualizado');
      } else {
        const res = await axios.post(`${API_URL}/api/tutors`, tutor);
        toast.success(res.data.message || 'Tutor creado');
      }
      setShowForm(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (error: any) {
      console.error('❌ Error al guardar tutor:', error);
      toast.error(error?.response?.data?.message || 'Error al guardar tutor');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que querés eliminar este tutor?')) {
      try {
        const res = await axios.delete(`${API_URL}/api/tutors/${id}`);
        toast.success(res.data.message || 'Tutor eliminado');
        fetchTutors();
      } catch (err: any) {
        console.error('❌ Error al eliminar tutor:', err);
        toast.error(err?.response?.data?.message || 'Error al eliminar tutor');
      }
    }
  };

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Buscar tutores..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedTutor(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tutor
        </button>
      </div>

      {showForm && (
        <TutorForm
          tutor={selectedTutor}
          onClose={() => {
            setShowForm(false);
            setSelectedTutor(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTutors.map((tutor) => (
              <tr key={tutor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tutor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tutor.dni}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.phone || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tutor.join_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    onClick={() => {
                      setSelectedTutor(tutor);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(tutor.id)}
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
