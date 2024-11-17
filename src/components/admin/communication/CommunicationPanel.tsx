import { useState } from 'react';
import { Send, Users, Search } from 'lucide-react';
import MessageForm from './MessageForm';

interface Message {
  id: number;
  subject: string;
  content: string;
  recipients: string[];
  date: string;
  status: 'sent' | 'draft';
}

export default function CommunicationPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      subject: 'Reunión Mensual',
      content: 'Recordatorio de la reunión mensual este viernes.',
      recipients: ['voluntarios', 'tutores'],
      date: '2024-03-10',
      status: 'sent'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendMessage = (newMessage: Omit<Message, 'id' | 'date' | 'status'>) => {
    const message = {
      ...newMessage,
      id: messages.length + 1,
      date: new Date().toISOString().split('T')[0],
      status: 'sent' as const
    };
    setMessages([message, ...messages]);
    setShowForm(false);
  };

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar mensajes..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Nuevo Mensaje
        </button>
      </div>

      {showForm && (
        <MessageForm
          onSubmit={handleSendMessage}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredMessages.map((message) => (
            <div key={message.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{message.subject}</h3>
                  <p className="mt-1 text-sm text-gray-500">{message.content}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {message.status === 'sent' ? 'Enviado' : 'Borrador'}
                </span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span>Enviado a: {message.recipients.join(', ')}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {message.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}