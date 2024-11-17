import { useState } from 'react';
import { X, Frown, Meh, Smile, SmilePlus, CheckCircle } from 'lucide-react';

interface StudentRatingProps {
  student: {
    id: number;
    nombre: string;
    lastRating?: {
      date: string;
      score: number;
      feedback: string;
      attendance: boolean;
    };
  };
  onSubmit: (studentId: number, rating: { 
    score: number; 
    feedback: string;
    attendance: boolean;
  }) => void;
  onClose: () => void;
}

const ratingEmojis = [
  { score: 1, icon: Frown, label: 'Necesita mejorar', color: 'text-red-500' },
  { score: 2, icon: Meh, label: 'Regular', color: 'text-yellow-500' },
  { score: 3, icon: Smile, label: 'Bueno', color: 'text-green-500' },
  { score: 4, icon: SmilePlus, label: 'Excelente', color: 'text-emerald-500' }
];

export default function StudentRating({ student, onSubmit, onClose }: StudentRatingProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [attendance, setAttendance] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendance) {
      onSubmit(student.id, { score: 0, feedback: 'Ausente', attendance: false });
    } else {
      onSubmit(student.id, { score: rating, feedback, attendance: true });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Evaluar a {student.nombre}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="attendance"
              checked={attendance}
              onChange={(e) => {
                setAttendance(e.target.checked);
                if (!e.target.checked) {
                  setRating(0);
                  setFeedback('Ausente');
                } else {
                  setFeedback('');
                }
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="attendance" className="ml-2 block text-sm text-gray-900">
              Presente en la actividad
            </label>
          </div>

          {attendance && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación
                </label>
                <div className="flex justify-center space-x-4">
                  {ratingEmojis.map((emoji) => {
                    const Icon = emoji.icon;
                    return (
                      <button
                        key={emoji.score}
                        type="button"
                        onClick={() => setRating(emoji.score)}
                        className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                          rating === emoji.score
                            ? 'bg-gray-100 scale-110'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon
                          className={`h-10 w-10 ${
                            rating === emoji.score
                              ? emoji.color
                              : 'text-gray-400 hover:' + emoji.color
                          } transition-colors`}
                        />
                        <span className={`text-xs mt-1 font-medium ${
                          rating === emoji.score
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}>
                          {emoji.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios
                </label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Describe el desempeño del alumno..."
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={attendance && (!rating || !feedback.trim())}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Evaluación
            </button>
          </div>
        </form>

        {student.lastRating && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Última evaluación</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {(() => {
                    const lastRatingEmoji = ratingEmojis.find(
                      emoji => emoji.score === student.lastRating!.score
                    );
                    if (lastRatingEmoji) {
                      const Icon = lastRatingEmoji.icon;
                      return (
                        <div className="flex items-center">
                          <Icon className={`h-5 w-5 ${lastRatingEmoji.color}`} />
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {lastRatingEmoji.label}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex items-center">
                  <CheckCircle className={`h-5 w-5 ${
                    student.lastRating.attendance ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className="ml-2 text-sm text-gray-600">
                    {student.lastRating.attendance ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{student.lastRating.feedback}</p>
              <span className="mt-2 block text-xs text-gray-500">
                {student.lastRating.date}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}