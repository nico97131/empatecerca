import { useState } from 'react';
import { Star } from 'lucide-react';
import { API_URL } from '../../config';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Volunteer {
  id: number;
  nombre: string;
  email: string;
  rating?: number;
}

interface VolunteerRatingFormProps {
  volunteers: Volunteer[];
  onCancel: () => void;
}

export default function VolunteerRatingForm({ volunteers, onCancel }: VolunteerRatingFormProps) {
  const [selectedRatings, setSelectedRatings] = useState<{ [email: string]: number }>({});
  const [feedbacks, setFeedbacks] = useState<{ [email: string]: string }>({});
  const [showFeedbacks, setShowFeedbacks] = useState<{ [email: string]: boolean }>({});
  const [loadingRatings, setLoadingRatings] = useState<{ [email: string]: boolean }>({});
  const { user } = useAuth();

  const handleRate = async (email: string, rating: number | undefined) => {
    const token = localStorage.getItem('token');
    const tutorId = user?.id;
    const match = volunteers.find(v => v.email?.toLowerCase().trim() === email.toLowerCase().trim());
    const volunteerId = match?.id;
    const feedback = feedbacks[email]?.trim() || '';

    if (!volunteerId || !tutorId) {
      toast.error('Faltan datos del tutor o voluntario');
      return;
    }

    if (!rating) {
      toast.error('Seleccioná una calificación antes de guardar');
      return;
    }

    setLoadingRatings(prev => ({ ...prev, [email]: true }));

    try {
      await axios.post(`${API_URL}/api/ratings`, {
        volunteer_id: volunteerId,
        tutor_id: tutorId,
        score: rating,
        feedback,
        date: new Date().toISOString().split('T')[0]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('✅ Calificación registrada');
      setSelectedRatings(prev => ({ ...prev, [email]: rating }));
      setFeedbacks(prev => ({ ...prev, [email]: '' }));
      setShowFeedbacks(prev => ({ ...prev, [email]: false }));
} catch (error: any) {
  if (error.response?.status === 409) {
    toast(
      '⚠️ Ya registraste una calificación para este voluntario esta semana.',
      {
        icon: '🔁',
        style: {
          background: '#FFF3CD',
          color: '#856404',
        },
      }
    );
  } else {
    toast.error('❌ Error al registrar calificación');
    console.error('❌ Error al guardar calificación:', error);
  }
}
 finally {
      setLoadingRatings(prev => ({ ...prev, [email]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {volunteers.map((v, idx) => (
        <div key={idx} className="bg-white shadow sm:rounded-lg mb-4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{v.nombre}</h3>
              <p className="text-sm text-gray-500">{v.email}</p>
            </div>
            <div className="flex flex-col w-3/4 space-y-2">
              <div className="flex justify-start w-full space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRatings(prev => ({ ...prev, [v.email]: star }))}
                    className={`text-sm ${star <= (selectedRatings[v.email] ?? v.rating ?? 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                    }`}
                  >
                    <Star className="h-6 w-6" />
                  </button>
                ))}
              </div>
              <div className="flex items-start justify-between w-full gap-4">
                <div className="flex-1 text-sm">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={showFeedbacks[v.email] || false}
                      onChange={() =>
                        setShowFeedbacks(prev => ({ ...prev, [v.email]: !prev[v.email] }))
                      }
                    />
                    Agregar comentario (opcional)
                  </label>
                  {showFeedbacks[v.email] && (
                    <textarea
                      placeholder="Escribí un comentario para el voluntario"
                      className="w-full mt-1 p-2 border rounded text-xs"
                      value={feedbacks[v.email] || ''}
                      onChange={(e) =>
                        setFeedbacks(prev => ({ ...prev, [v.email]: e.target.value }))
                      }
                    />
                  )}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => handleRate(v.email, selectedRatings[v.email])}
                    disabled={loadingRatings[v.email]}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${loadingRatings[v.email]
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {loadingRatings[v.email] ? 'Guardando...' : 'Guardar calificación'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="text-right mt-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
