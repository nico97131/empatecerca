import { useEffect, useState } from 'react';
import { Calendar, Star } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProgressEntry {
  date: string;
  attendance: boolean;
  performance: string;
  activities: string[];
  notes: string;
  score?: number;
}

interface ProgressHistoryProps {
  studentId: number;
  studentName: string;
  volunteer: Array<{
    id: number;
    nombre: string;
    email: string;
    rating?: number;
  }>;
  onRateVolunteer: (studentId: number, volunteerEmail: string, rating: number) => void;
}

export default function ProgressHistory({
  studentId,
  studentName,
  volunteer,
  onRateVolunteer
}: ProgressHistoryProps) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

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
          notes: entry.notes,
          score: entry.score ?? null
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


  return (
    <div className="space-y-6">
      {/* Sección de calificación */}      
      {/* Historial */}
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
                      <span className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${entry.attendance
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {entry.attendance ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                  <div className="ml-7 mt-2 text-sm text-gray-600">
                    <p><strong>Desempeño:</strong> {entry.performance}</p>
                    <p><strong>Actividades:</strong> {entry.activities.join(', ')}</p>
                    <p><strong>Notas:</strong> {entry.notes}</p>
                    {typeof entry.score === 'number' && (
                      <p><strong>Calificación:</strong> {entry.score}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
