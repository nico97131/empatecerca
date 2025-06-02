import { useState } from 'react';
import { Star } from 'lucide-react';
import { API_URL } from '../../config';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  rating?: number;
}

interface VolunteerRatingFormProps {
  volunteers: Volunteer[];
  tutorId: number;                                // ← recibimos el tutorId real
  onCancel: () => void;
  onRate: (volunteerId: number, rating: number, feedback: string) => Promise<void>;
}

export default function VolunteerRatingForm({
  volunteers,
  tutorId,
  onCancel,
  onRate
}: VolunteerRatingFormProps) {
  const [selectedRatings, setSelectedRatings] = useState<{ [id: number]: number }>({});
  const [feedbacks, setFeedbacks] = useState<{ [id: number]: string }>({});
  const [showFeedbacks, setShowFeedbacks] = useState<{ [id: number]: boolean }>({});
  const [loadingRatings, setLoadingRatings] = useState<{ [id: number]: boolean }>({});

  // En VolunteerRatingForm.tsx:

const handleRateClick = async (volunteerId: number) => {
  const rating = selectedRatings[volunteerId];
  const feedback = feedbacks[volunteerId]?.trim() || '';

  if (!rating) {
    toast.error('Seleccioná una calificación antes de guardar');
    return;
  }

  setLoadingRatings((prev) => ({ ...prev, [volunteerId]: true }));
  try {
    // onRate ahora devuelve boolean
    const success = await onRate(volunteerId, rating, feedback);
    if (success) {
      toast.success('✅ Calificación registrada');
      // Limpiamos comentario y ocultamos textarea
      setShowFeedbacks((prev) => ({ ...prev, [volunteerId]: false }));
      setFeedbacks((prev) => ({ ...prev, [volunteerId]: '' }));
    }
    // Si success === false, significa que hubo 409 o error, 
    // pero ya mostramos el toast correspondiente en handleRateVolunteer, así que acá no hacemos nada.
  } catch (error) {
    console.error('❌ [VolunteerRatingForm] Error en onRate:', error);
    // Podrías agregar un toast.error aquí si quieres un fallback general.
  } finally {
    setLoadingRatings((prev) => ({ ...prev, [volunteerId]: false }));
  }
};


  return (
    <div className="space-y-6">
      {volunteers.map((v) => (
        <div key={v.id} className="bg-white shadow sm:rounded-lg mb-4 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{v.name}</h3>
              <p className="text-sm text-gray-500">{v.email}</p>
            </div>
            <div className="flex flex-col w-3/4 space-y-2">
              <div className="flex justify-start w-full space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setSelectedRatings((prev) => ({ ...prev, [v.id]: star }))
                    }
                    className={`text-sm ${
                      star <= (selectedRatings[v.id] ?? v.rating ?? 0)
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
                      checked={showFeedbacks[v.id] || false}
                      onChange={() =>
                        setShowFeedbacks((prev) => ({
                          ...prev,
                          [v.id]: !prev[v.id]
                        }))
                      }
                    />
                    Agregar comentario (opcional)
                  </label>
                  {showFeedbacks[v.id] && (
                    <textarea
                      placeholder="Escribí un comentario para el voluntario"
                      className="w-full mt-1 p-2 border rounded text-xs"
                      value={feedbacks[v.id] || ''}
                      onChange={(e) =>
                        setFeedbacks((prev) => ({
                          ...prev,
                          [v.id]: e.target.value
                        }))
                      }
                    />
                  )}
                </div>
                <div className="mt-auto">
                  <button
                    onClick={() => handleRateClick(v.id)}
                    disabled={loadingRatings[v.id]}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      loadingRatings[v.id]
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {loadingRatings[v.id] ? 'Guardando...' : 'Guardar calificación'}
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
