import { useState } from 'react';
import { Calendar, TrendingUp, Star } from 'lucide-react';

interface ProgressEntry {
  fecha: string;
  asistencia: boolean;
  desempeño: string;
  actividades: string[];
  notas: string;
}

interface ProgressHistoryProps {
  student: {
    id: number;
    nombre: string;
    progreso: ProgressEntry[];
    voluntario: {
      nombre: string;
      email: string;
      rating?: number;
    };
  };
  onRateVolunteer: (studentId: number, rating: number) => void;
}

export default function ProgressHistory({ student, onRateVolunteer }: ProgressHistoryProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(student.voluntario.rating || 0);

  const handleRating = () => {
    onRateVolunteer(student.id, rating);
    setShowRatingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Rating Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Voluntario Asignado
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {student.voluntario.nombre}
            </p>
          </div>
          <button
            onClick={() => setShowRatingModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Star className="h-4 w-4 mr-2" />
            Calificar Voluntario
          </button>
        </div>
        {student.voluntario.rating && (
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= student.voluntario.rating!
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                Calificación actual: {student.voluntario.rating}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Historial de Progreso
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Registro de actividades y desempeño
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {student.progreso.map((entry, index) => (
              <li key={index} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {entry.fecha}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    entry.asistencia
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.asistencia ? 'Presente' : 'Ausente'}
                  </span>
                </div>
                <div className="ml-7">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`text-sm font-medium ${
                      entry.desempeño === 'Excelente'
                        ? 'text-green-600'
                        : entry.desempeño === 'Bueno'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}>
                      {entry.desempeño}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Actividades:</span>{' '}
                      {entry.actividades.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notas:</span> {entry.notas}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Calificar a {student.voluntario.nombre}
            </h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Guardar Calificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}