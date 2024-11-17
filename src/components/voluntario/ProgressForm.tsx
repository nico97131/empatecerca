import { useState } from 'react';
import { X } from 'lucide-react';

interface ProgressFormProps {
  student: {
    id: number;
    nombre: string;
  };
  onSubmit: (progress: {
    fecha: string;
    asistencia: boolean;
    desempeño: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar';
    actividades: string[];
    notas: string;
  }) => void;
  onCancel: () => void;
}

export default function ProgressForm({ student, onSubmit, onCancel }: ProgressFormProps) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    asistencia: true,
    desempeño: 'Bueno' as const,
    actividades: [''],
    notas: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      actividades: formData.actividades.filter(a => a.trim() !== '')
    });
  };

  const addActivity = () => {
    setFormData({
      ...formData,
      actividades: [...formData.actividades, '']
    });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      actividades: formData.actividades.filter((_, i) => i !== index)
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
              id="fecha"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asistencia
            </label>
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={formData.asistencia}
                  onChange={() => setFormData({ ...formData, asistencia: true })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Presente</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!formData.asistencia}
                  onChange={() => setFormData({ ...formData, asistencia: false })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Ausente</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="desempeño" className="block text-sm font-medium text-gray-700">
              Desempeño
            </label>
            <select
              id="desempeño"
              value={formData.desempeño}
              onChange={(e) => setFormData({ ...formData, desempeño: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Necesita Mejorar">Necesita Mejorar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividades Realizadas
            </label>
            {formData.actividades.map((actividad, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={actividad}
                  onChange={(e) => {
                    const newActividades = [...formData.actividades];
                    newActividades[index] = e.target.value;
                    setFormData({ ...formData, actividades: newActividades });
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
            <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              id="notas"
              rows={3}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Observaciones, comentarios o recomendaciones..."
            />
          </div>

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