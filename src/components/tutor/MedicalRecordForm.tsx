import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface MedicalRecord {
  alergias: string[];
  medicamentos: string[];
  condiciones: string[];
  observaciones: string;
  grupoSanguineo?: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

interface MedicalRecordFormProps {
  student: {
    id: number;
    nombre: string;
    fichamedica: MedicalRecord;
  };
  onSubmit: (record: MedicalRecord) => void;
  onCancel: () => void;
}

export default function MedicalRecordForm({ student, onSubmit, onCancel }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<MedicalRecord>(student.fichamedica);

  const handleArrayFieldChange = (field: keyof Pick<MedicalRecord, 'alergias' | 'medicamentos' | 'condiciones'>, index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: keyof Pick<MedicalRecord, 'alergias' | 'medicamentos' | 'condiciones'>) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: keyof Pick<MedicalRecord, 'alergias' | 'medicamentos' | 'condiciones'>, index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      ultimaActualizacion: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Ficha Médica - {student.nombre}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alergias */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Alergias</label>
            {formData.alergias.map((alergia, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={alergia}
                  onChange={(e) => handleArrayFieldChange('alergias', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('alergias', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('alergias')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Alergia
            </button>
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Medicamentos</label>
            {formData.medicamentos.map((medicamento, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={medicamento}
                  onChange={(e) => handleArrayFieldChange('medicamentos', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('medicamentos', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('medicamentos')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Medicamento
            </button>
          </div>

          {/* Condiciones Médicas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Condiciones Médicas</label>
            {formData.condiciones.map((condicion, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={condicion}
                  onChange={(e) => handleArrayFieldChange('condiciones', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('condiciones', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('condiciones')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Condición
            </button>
          </div>

          {/* Grupo Sanguíneo */}
          <div>
            <label htmlFor="grupoSanguineo" className="block text-sm font-medium text-gray-700">
              Grupo Sanguíneo
            </label>
            <select
              id="grupoSanguineo"
              value={formData.grupoSanguineo || ''}
              onChange={(e) => setFormData({ ...formData, grupoSanguineo: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grupo) => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
          </div>

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Contacto de Emergencia</h4>
            <div>
              <label htmlFor="contactoNombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="contactoNombre"
                value={formData.contactoEmergencia.nombre}
                onChange={(e) => setFormData({
                  ...formData,
                  contactoEmergencia: { ...formData.contactoEmergencia, nombre: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="contactoTelefono" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="contactoTelefono"
                value={formData.contactoEmergencia.telefono}
                onChange={(e) => setFormData({
                  ...formData,
                  contactoEmergencia: { ...formData.contactoEmergencia, telefono: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="contactoRelacion" className="block text-sm font-medium text-gray-700">
                Relación
              </label>
              <input
                type="text"
                id="contactoRelacion"
                value={formData.contactoEmergencia.relacion}
                onChange={(e) => setFormData({
                  ...formData,
                  contactoEmergencia: { ...formData.contactoEmergencia, relacion: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              rows={4}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}