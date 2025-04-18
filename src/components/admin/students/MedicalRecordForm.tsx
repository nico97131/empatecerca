import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  medicalRecord?: {
    diagnosis: string;
    allergies: string[];
    medications: string[];
    observations: string;
    lastUpdate: string;
    volunteerNotes?: string;
  };
}

interface MedicalRecordFormProps {
  student: Student;
  onSubmit: (medicalRecord: Student['medicalRecord']) => void;
  onCancel: () => void;
}

export default function MedicalRecordForm({ student, onSubmit, onCancel }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    diagnosis: '',
    allergies: [] as string[],
    medications: [] as string[],
    observations: '',
    volunteerNotes: ''
  });

  useEffect(() => {
    if (student.medicalRecord) {
      setFormData({
        ...student.medicalRecord,
        allergies: student.medicalRecord.allergies.length > 0 ? student.medicalRecord.allergies : [],
        medications: student.medicalRecord.medications.length > 0 ? student.medicalRecord.medications : []
      });
    }
  }, [student]);

  const handleArrayFieldChange = (field: 'allergies' | 'medications', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'allergies' | 'medications') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'allergies' | 'medications', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      allergies: formData.allergies.filter(item => item.trim() !== ''),
      medications: formData.medications.filter(item => item.trim() !== ''),
      lastUpdate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Ficha Médica - {student.firstName} {student.lastName}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
              Diagnóstico Médico
            </label>
            <textarea
              id="diagnosis"
              rows={3}
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alergias</label>
            {formData.allergies.map((allergy, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => handleArrayFieldChange('allergies', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Alergia"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('allergies', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('allergies')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Alergia
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Medicamentos</label>
            {formData.medications.map((medication, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => handleArrayFieldChange('medications', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Medicamento"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField('medications', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('medications')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Medicamento
            </button>
          </div>

          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
              Observaciones Adicionales
            </label>
            <textarea
              id="observations"
              rows={3}
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="volunteerNotes" className="block text-sm font-medium text-gray-700">
              Notas del Voluntario
            </label>
            <textarea
              id="volunteerNotes"
              rows={2}
              value={formData.volunteerNotes}
              onChange={(e) => setFormData({ ...formData, volunteerNotes: e.target.value })}
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
              Guardar Ficha Médica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
