import { TrendingUp, Clock, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';

interface ProgressEntry {
  id: number;
  attendance: boolean;
  performance: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar';
  activities: string[];
  notes: string;
  date: string;
  volunteerName: string;
  volunteerRating: number;
}

interface GroupedProgress {
  studentId: number;
  studentName: string;
  latestEntry: ProgressEntry;
  history: ProgressEntry[];
}

interface StudentProgressProps {
  progress: GroupedProgress[];
  searchTerm: string;
}

export default function StudentProgress({ progress, searchTerm }: StudentProgressProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  // Filtrar alumnos por búsqueda
  const filtered = progress.filter((p) =>
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Progreso de Alumnos</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Seguimiento del desempeño y asistencia</p>
      </div>

      <div className="border-t border-gray-200">
        {filtered
          .filter(p => p.latestEntry !== undefined && p.latestEntry !== null)
          .map(({ studentId, studentName, latestEntry, history }) => {

            const isOpen = expanded === studentId;

            return (
              <div key={studentId} className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{studentName}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 mr-2">Voluntario: {latestEntry.volunteerName}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{latestEntry.volunteerRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`h-5 w-5 ${latestEntry.attendance ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-sm text-gray-600">{latestEntry.attendance ? 'Presente' : 'Ausente'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`text-sm font-medium ${latestEntry.performance === 'Excelente'
                      ? 'text-green-600'
                      : latestEntry.performance === 'Bueno'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                      }`}>
                      {latestEntry.performance}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {latestEntry.attendance ? (
                      <>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Actividades:</h5>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                            {latestEntry.activities.map((activity, index) => (
                              <li key={index}>{activity}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Notas:</h5>
                          <p className="mt-1 text-sm text-gray-600">{latestEntry.notes}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm italic text-gray-500">No asistió a clase.</p>
                    )}
                  </div>

                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{new Date(latestEntry.date).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : studentId)}
                    className="flex items-center text-indigo-600 hover:underline"
                  >
                    {isOpen ? 'Ocultar historial' : 'Ver historial'}
                    <svg
                      className={`ml-1 w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                    {history.map((entry) => (

                      <div key={entry.id} className="text-sm text-gray-600 space-y-1">
                        <div className="font-semibold">{new Date(entry.date).toLocaleDateString()} - {entry.performance}</div>
                        <div><strong>Voluntario:</strong> {entry.volunteerName}</div>
                        {entry.attendance ? (
                          <>
                            <div><strong>Actividades:</strong> {entry.activities.join(', ')}</div>
                            <div><strong>Notas:</strong> {entry.notes}</div>
                          </>
                        ) : (
                          <div className="italic text-gray-500">No asistió a clase.</div>
                        )}

                        <div><strong>Asistencia:</strong> {entry.attendance ? 'Presente' : 'Ausente'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
