import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';

interface ProgressEntry {
  date: string;
  attendance: boolean;
  performance: string;
  activities: string[];
  notes: string;
}

interface ProgressHistoryProps {
  studentId: number;
  studentName: string;
  volunteer: {
    nombre: string;
    email: string;
    rating?: number;
  };
  onRateVolunteer: (studentId: number, rating: number) => void;
}

export default function ProgressHistory({ studentId, studentName, volunteer, onRateVolunteer }: ProgressHistoryProps) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(volunteer.rating || 0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/progress/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data.data.map((entry: any) => ({
          date: entry.date,
          attendance: entry.attendance,
          performance: entry.performance,
          activities: typeof entry.activities === 'string' ? JSON.parse(entry.activities) : [],
          notes: entry.notes
        }));

        setEntries(data);
      } catch (error) {
        console.error('❌ Error al obtener el historial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [studentId]);

  const handleRating = () => {
    onRateVolunteer(studentId, rating);
    setShowRatingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sección de calificación del voluntario */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Voluntario Asignado</h3>
            <p className="text-sm text-gray-500">{volunteer.nombre}</p>
          </div>
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md shadow-sm"
          >
            <Star className="h-4 w-4 mr-2 inline" />
            Calificar
          </button>
        </div>
        {volunteer.rating && (
          <div className="border-t px-4 py-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-5 w-5 ${star <= volunteer.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="ml-2 text-sm text-gray-600">Calificación actual: {volunteer.rating}</span>
            </div>
          </div>
        )}
      </div>

      {/* Historial de progreso */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Historial de Progreso</h3>
        </div>
        <div className="border-t">
          {loading ? (
            <div className="px-4 py-4 text-sm text-gray-500">Cargando historial...</div>
          ) : entries.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-500">No hay registros todavía.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {entries.map((entry, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{entry.date}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${entry.attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {entry.attendance ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                  <div className="ml-7 mt-2 text-sm text-gray-600">
                    <p><strong>Desempeño:</strong> {entry.performance}</p>
                    <p><strong>Actividades:</strong> {entry.activities.join(', ')}</p>
                    <p><strong>Notas:</strong> {entry.notes}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal para calificar */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Calificar a {volunteer.nombre}</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowRatingModal(false)} className="px-4 py-2 border rounded-md text-sm bg-white">Cancelar</button>
              <button onClick={handleRating} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
