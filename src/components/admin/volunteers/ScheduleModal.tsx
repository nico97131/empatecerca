import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Horario de {volunteer.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Disponibilidad:</h4>
          <ul className="space-y-2">
            {volunteer.availability.map((slot, index) => (
              <li
                key={index}
                className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700"
              >
                {slot}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}