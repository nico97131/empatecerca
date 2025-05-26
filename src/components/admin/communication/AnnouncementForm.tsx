import { useState } from 'react';
import { X } from 'lucide-react';

interface MessageFormProps {
  onSubmit: (message: {
    subject: string;
    content: string;
    recipients: string[];
    publishDate: string;
    expiryDate: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    subject: string;
    content: string;
    recipients: string[];
    publishDate: string;
    expiryDate: string;
  };
}

export default function MessageForm({ onSubmit, onCancel, initialData }: MessageFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    recipients: initialData?.recipients || [],
    publishDate: initialData?.publishDate || today,
    expiryDate: initialData?.expiryDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Editar Mensaje' : 'Nuevo Mensaje'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Asunto
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido
            </label>
            <textarea
              id="content"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
              Destinatarios
            </label>
            <select
              id="recipients"
              value={formData.recipients[0] || ''}
              onChange={(e) => setFormData({ ...formData, recipients: [e.target.value] })}
              className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>Seleccionar...</option>
              <option value="voluntarios">Voluntarios</option>
              <option value="tutores">Tutores</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">
              Fecha de Publicación
            </label>
            <input
              type="date"
              id="publishDate"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              min={today}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              Fecha de Caducidad
            </label>
            <input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              min={formData.publishDate || today}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
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
              {initialData ? 'Guardar Cambios' : 'Enviar Mensaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
