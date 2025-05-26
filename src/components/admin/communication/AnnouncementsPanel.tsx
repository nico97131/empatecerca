import { useEffect, useState } from 'react';
import { Send, Users, Search, Pencil, Trash2 } from 'lucide-react';
import AnnouncementForm from "./AnnouncementForm";
import axios from 'axios';
import { API_URL } from '../../../config';
import { toast } from 'react-hot-toast'; 

// Tooltip inline
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group inline-block">
    {children}
    <div className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200
        bottom-[-2.2rem] right-0 translate-x-1/4 
        bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
      {label}
    </div>
  </div>
);

interface Message {
  id: number;
  subject: string;
  content: string;
  recipients: string[];
  date: string;
  status: 'sent' | 'draft';
  publishDate: string;
  expiryDate: string;
}

export default function CommunicationPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMessageId, setEditMessageId] = useState<number | null>(null);
  const [showExpired, setShowExpired] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const endpoint = showExpired ? '/expired' : '';
        const res = await axios.get(`${API_URL}/api/announcements${endpoint}`);
        const data = res.data.data.map((msg: any) => ({
          id: msg.id,
          subject: msg.subject,
          content: msg.content,
          recipients: msg.recipients,
          status: msg.status,
          publishDate: msg.publication_date,
          expiryDate: msg.expiration_date,
          date: msg.publication_date
        }));
        setMessages(data);
      } catch (error) {
        console.error('❌ Error al cargar mensajes:', error);
      }
    };

    fetchMessages();
  }, [showExpired]);

  const handleSendMessage = async (formData: {
  subject: string;
  content: string;
  recipients: string[];
  publishDate: string;
  expiryDate: string;
}) => {
  try {
    const payload = {
      subject: formData.subject,
      content: formData.content,
      recipients: formData.recipients,
      status: 'sent',
      publication_date: formData.publishDate,
      expiration_date: formData.expiryDate
    };

    if (editMessageId !== null) {
      await axios.put(`${API_URL}/api/announcements/${editMessageId}`, payload);
      setMessages(prev =>
        prev.map(m =>
          m.id === editMessageId
            ? { ...m, ...formData, date: formData.publishDate, status: 'sent' }
            : m
        )
      );
      toast.success('Comunicado actualizado correctamente');
    } else {
      const res = await axios.post(`${API_URL}/api/announcements`, payload);
      setMessages(prev => [
        { id: res.data.id, ...formData, date: formData.publishDate, status: 'sent' },
        ...prev
      ]);
      toast.success('Comunicado creado con éxito');
    }

    setShowForm(false);
    setEditMessageId(null);
  } catch (error) {
    console.error('❌ Error al enviar/editar mensaje:', error);
    toast.error('Error al guardar el comunicado');
  }
};

  const handleDeleteMessage = async (id: number) => {
  if (!confirm('¿Estás seguro de que querés eliminar este mensaje?')) return;
  try {
    await axios.delete(`${API_URL}/api/announcements/${id}`);
    setMessages(prev => prev.filter((msg) => msg.id !== id));
    toast.success('Comunicado eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar mensaje:', error);
    toast.error('No se pudo eliminar el comunicado');
  }
};


  const filteredMessages = [...messages]
    .filter(message =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));

  const renderRecipientBadge = (recipient: string) => {
    const color =
      recipient === 'voluntarios'
        ? 'bg-blue-100 text-blue-800'
        : recipient === 'tutores'
        ? 'bg-purple-100 text-purple-800'
        : 'bg-gray-100 text-gray-800';

    return (
      <span
        key={recipient}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {recipient}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar mensajes..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setShowExpired(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              !showExpired ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Vigentes
          </button>
          <button
            onClick={() => setShowExpired(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              showExpired ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Historial
          </button>
          {!showExpired && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMessageId(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <AnnouncementForm 
          onSubmit={handleSendMessage}
          onCancel={() => {
            setShowForm(false);
            setEditMessageId(null);
          }}
          initialData={
            editMessageId !== null
              ? (() => {
                  const msg = messages.find((m) => m.id === editMessageId);
                  if (!msg) return undefined;
                  const format = (d: string) => new Date(d).toISOString().split('T')[0];
                  return {
                    subject: msg.subject,
                    content: msg.content,
                    recipients: msg.recipients,
                    publishDate: format(msg.publishDate),
                    expiryDate: format(msg.expiryDate)
                  };
                })()
              : undefined
          }
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredMessages.map((message) => (
            <div key={message.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{message.subject}</h3>
                  <p className="mt-1 text-sm text-gray-500">{message.content}</p>
                </div>

                {!showExpired && (
                  <div className="flex gap-2 items-start">
                    <Tooltip label="Editar">
                      <button
                        onClick={() => {
                          setEditMessageId(message.id);
                          setShowForm(true);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-500 gap-2 flex-wrap">
                <Users className="flex-shrink-0 h-4 w-4 text-gray-400" />
                <span className="flex gap-1">{message.recipients.map(renderRecipientBadge)}</span>
              </div>

              <div className="mt-3 text-sm text-gray-500 space-y-1">
                <p>
                  <strong className="text-gray-700">📅 Publicado:</strong> {formatDate(message.publishDate)}
                </p>
                <p>
                  <strong className="text-gray-700">⏰ Caduca:</strong> {formatDate(message.expiryDate)}
                </p>
                <p>
                  <strong className="text-gray-700">🕓 Última edición:</strong> {formatDate(message.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
