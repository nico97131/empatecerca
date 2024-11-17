import { X } from 'lucide-react';

interface MedicalRecordProps {
  student: {
    nombre: string;
    fichamedica: {
      alergias: string[];
      medicamentos: string[];
      condiciones: string[];
      observaciones: string;
      ultimaActualizacion: string;
      grupoSanguineo?: string;
      contactoEmergencia: {
        nombre: string;
        telefono: string;
        relacion: string;
      };
    };
  };
  onClose: () => void;
}

export default function MedicalRecord({ student, onClose }: MedicalRecordProps) {
  const {
    alergias = [],
    medicamentos = [],
    condiciones = [],
    observaciones = '',
    ultimaActualizacion = '',
    grupoSanguineo = '',
    contactoEmergencia = {
      nombre: '',
      telefono: '',
      relacion: ''
    }
  } = student.fichamedica || {};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Ficha Médica - {student.nombre}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Grupo Sanguíneo</h4>
            <p className="text-sm text-gray-600">
              {grupoSanguineo || 'No especificado'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Alergias</h4>
            {alergias.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {alergias.map((alergia, index) => (
                  <li key={index}>{alergia}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No se registran alergias</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Medicamentos</h4>
            {medicamentos.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {medicamentos.map((medicamento, index) => (
                  <li key={index}>{medicamento}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No se registran medicamentos</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Condiciones Médicas</h4>
            {condiciones.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {condiciones.map((condicion, index) => (
                  <li key={index}>{condicion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No se registran condiciones médicas</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Observaciones</h4>
            <p className="text-sm text-gray-600">
              {observaciones || 'Sin observaciones'}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Contacto de Emergencia</h4>
            <div className="text-sm text-gray-600">
              <p>Nombre: {contactoEmergencia.nombre || 'No especificado'}</p>
              <p>Teléfono: {contactoEmergencia.telefono || 'No especificado'}</p>
              <p>Relación: {contactoEmergencia.relacion || 'No especificado'}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Última actualización: {ultimaActualizacion || 'No registrada'}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}