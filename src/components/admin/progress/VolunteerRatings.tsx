import { useState } from 'react';
import { Star, Award } from 'lucide-react';

interface VolunteerRating {
  id: number;
  name: string;
  email: string;
  averageRating: number;
  totalRatings: number;
  feedback: Array<{
    tutorName: string;
    feedback: string;
    date: string;
  }>;
}

interface VolunteerRatingsProps {
  volunteers: VolunteerRating[];
  searchTerm: string;
}

export default function VolunteerRatings({ volunteers, searchTerm }: VolunteerRatingsProps) {
  const [filterOption, setFilterOption] = useState<'all' | 'top' | 'low'>('all');

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    const colorClass = rating < 2.5 ? 'text-red-500 fill-red-500' : 'text-yellow-400 fill-yellow-400';

    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i < rounded ? colorClass : 'text-gray-300'}`}
        />
      );
    }

    return stars;
  };

  let filteredVolunteers = volunteers;

  if (filterOption === 'top') {
    filteredVolunteers = [...volunteers]
      .sort((a, b) => Number(b.averageRating) - Number(a.averageRating))
      .slice(0, 3);
  } else if (filterOption === 'low') {
    filteredVolunteers = volunteers.filter(v => Number(v.averageRating) < 2.5);
  }

  filteredVolunteers = filteredVolunteers.filter(volunteer =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Calificaciones de Voluntarios
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Evaluaciones y retroalimentación de los tutores
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 pb-2">
  <button
    onClick={() => setFilterOption('all')}
    className={`px-3 py-1 rounded-md text-sm font-medium border ${
      filterOption === 'all'
        ? 'bg-indigo-600 text-white border-transparent'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    }`}
  >
    Todos
  </button>
  <button
    onClick={() => setFilterOption('top')}
    className={`px-3 py-1 rounded-md text-sm font-medium border ${
      filterOption === 'top'
        ? 'bg-yellow-500 text-white border-transparent'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    }`}
  >
    🏆 Top 3
  </button>
  <button
    onClick={() => setFilterOption('low')}
    className={`px-3 py-1 rounded-md text-sm font-medium border ${
      filterOption === 'low'
        ? 'bg-red-500 text-white border-transparent'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    }`}
  >
    ❗ En observación
  </button>
</div>


      <div className="border-t border-gray-200">
        {filteredVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="px-4 py-5 sm:px-6 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{volunteer.name}</h4>
                <p className="text-sm text-gray-500">{volunteer.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(Number(volunteer.averageRating))}
                <span className="text-lg font-semibold">
                  {isNaN(Number(volunteer.averageRating))
                    ? '-'
                    : Number(volunteer.averageRating).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({volunteer.totalRatings} calificaciones)
                </span>
                {Number(volunteer.averageRating) >= 4.5 && (
                  <span title="Destacado">
                    <Award className="h-5 w-5 text-emerald-500" />
                  </span>
                )}
              </div>
            </div>

            {volunteer.feedback.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Retroalimentación de Tutores:</h5>
                <div className="space-y-3">
                  {volunteer.feedback.map((feedback, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {feedback.tutorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{feedback.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
