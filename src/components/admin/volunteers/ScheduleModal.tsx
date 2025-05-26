import { X, Clock3 } from 'lucide-react';

interface Volunteer {
  id: number;
  name: string;
  availability: string[];
}

interface ScheduleModalProps {
  volunteer: Volunteer;
  onClose: () => void;
}

export default function ScheduleModal({ volunteer, onClose }: ScheduleModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Disponibilidad de {volunteer.name}
        </h2>

        <div className="mt-2">
          {volunteer.availability.length > 0 ? (
            <ul className="space-y-2">
              {volunteer.availability.map((slot, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700"
                >
                  <Clock3 className="w-4 h-4 text-indigo-500" />
                  {slot}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic text-center">
              No se registró disponibilidad.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
