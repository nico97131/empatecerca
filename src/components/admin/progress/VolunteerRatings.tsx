import { Star, ThumbsUp, Award } from 'lucide-react';

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
  const filteredVolunteers = volunteers.filter(volunteer =>
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
      <div className="border-t border-gray-200">
        {filteredVolunteers.map((volunteer) => (
          <div key={volunteer.id} className="px-4 py-5 sm:px-6 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{volunteer.name}</h4>
                <p className="text-sm text-gray-500">{volunteer.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-semibold">{volunteer.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({volunteer.totalRatings} calificaciones)</span>
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