import { TrendingUp, Clock, CheckCircle, Star } from 'lucide-react';

interface Progress {
  id: number;
  studentId: number;
  volunteerId: number;
  date: string;
  attendance: boolean;
  performance: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar';
  activities: string[];
  notes: string;
  studentName: string;
  volunteerName: string;
  volunteerRating: number;
}

interface StudentProgressProps {
  progress: Progress[];
  searchTerm: string;
}

export default function StudentProgress({ progress, searchTerm }: StudentProgressProps) {
  const filteredProgress = progress.filter(entry =>
    entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.volunteerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Progreso de Alumnos
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Seguimiento del desempeño y asistencia
        </p>
      </div>
      <div className="border-t border-gray-200">
        {filteredProgress.map((entry) => (
          <div key={entry.id} className="px-4 py-5 sm:px-6 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{entry.studentName}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500 mr-2">Voluntario: {entry.volunteerName}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{entry.volunteerRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${
                  entry.attendance ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {entry.attendance ? 'Presente' : 'Ausente'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                <span className={`text-sm font-medium ${
                  entry.performance === 'Excelente'
                    ? 'text-green-600'
                    : entry.performance === 'Bueno'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
                }`}>
                  {entry.performance}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Actividades:</h5>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {entry.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700">Notas:</h5>
                  <p className="mt-1 text-sm text-gray-600">{entry.notes}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}