import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProgressFormProps {
  student: {
    id: number;
    nombre: string;
    groupId: number; // 👈 agregalo
  };
  groupId: number;
  onSubmit: (progress: {
    date: string;
    attendance: boolean;
    performance: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar';
    activities: string[];
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
}


export default function ProgressForm({ student, groupId, onSubmit, onCancel }: ProgressFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    attendance: true,
    performance: '' as '' | 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar',
    activities: [''],
    notes: ''
  });

  const handleAttendanceChange = (attended: boolean) => {
    if (!attended) {
      setFormData({
        ...formData,
        attendance: false,
        performance: 'Bueno', // default pero no visible
        activities: [],
        notes: ''
      });
    } else {
      setFormData({
        ...formData,
        attendance: true,
        activities: [''],
        notes: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedProgress = {
      studentId: student.id,
      groupId, // 🔹 LO AGREGÁS ACÁ
      date: formData.date,
      attendance: formData.attendance,
      performance: formData.attendance ? formData.performance : '',
      activities: formData.attendance
        ? formData.activities.filter((a) => a.trim() !== '')
        : [],
      notes: formData.attendance ? formData.notes : '',
    };



    try {
      await onSubmit(cleanedProgress);
      toast.success('✅ Progreso registrado con éxito');
      onCancel();
    } catch (error: any) {
      toast.error(error?.message || '❌ Ocurrió un error al guardar el progreso');
    }
  };

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, '']
    });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Registro de Progreso - {student.nombre}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Asistencia</label>
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.attendance}
                  onChange={() => handleAttendanceChange(true)}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Presente</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!formData.attendance}
                  onChange={() => handleAttendanceChange(false)}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Ausente</span>
              </label>
            </div>
          </div>

          {formData.attendance && (
            <>
              <div>
                <label htmlFor="performance" className="block text-sm font-medium text-gray-700">
                  Desempeño
                </label>
                <select
                  id="performance"
                  value={formData.performance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performance: e.target.value as ProgressFormProps['onSubmit']['arguments'][0]['performance']
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="Necesita Mejorar">Necesita Mejorar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actividades Realizadas</label>
                {formData.activities.map((actividad, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={actividad}
                      onChange={(e) => {
                        const newActivities = [...formData.activities];
                        newActivities[index] = e.target.value;
                        setFormData({ ...formData, activities: newActivities });
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Descripción de la actividad"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addActivity}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  + Agregar Actividad
                </button>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Observaciones, comentarios o recomendaciones..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Guardar Progreso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
