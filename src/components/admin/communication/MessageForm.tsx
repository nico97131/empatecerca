import { useState } from 'react';
import { X } from 'lucide-react';

interface MessageFormProps {
  onSubmit: (message: {
    subject: string;
    content: string;
    recipients: string[];
  }) => void;
  onCancel: () => void;
}

export default function MessageForm({ onSubmit, onCancel }: MessageFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipients: [] as string[]
  });

  const recipientOptions = ['voluntarios', 'tutores', 'todos'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRecipientChange = (recipient: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(recipient)
        ? prev.recipients.filter(r => r !== recipient)
        : [...prev.recipients, recipient]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Nuevo Mensaje
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinatarios
            </label>
            <div className="space-y-2">
              {recipientOptions.map((option) => (
                <label key={option} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    checked={formData.recipients.includes(option)}
                    onChange={() => handleRecipientChange(option)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              ))}
            </div>
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
              Enviar Mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}