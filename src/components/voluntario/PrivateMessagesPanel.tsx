import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  from_id: number;
  from_role: 'tutor' | 'voluntario';
  to_id: number;
  to_role: 'tutor' | 'voluntario';
  content: string;
  timestamp: string;
  is_read: boolean;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  role: 'tutor' | 'voluntario';
  studentName?: string;
  groupName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface MessagingPanelProps {
  currentUser: {
    id: number;
    name: string;
    email: string;
    role: 'tutor' | 'voluntario';
  };
  contacts: Contact[];
  messages: Message[];
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'is_read'>) => void;
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export default function PrivateMessagesPanel({
  currentUser,
  contacts,
  messages,
  onSendMessage,
  selectedContact,
  onSelectContact
}: MessagingPanelProps) {
  const [messageText, setMessageText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const filteredMessages = selectedContact
    ? messages.filter(
        (msg) =>
          (msg.from_id === currentUser.id && msg.to_id === selectedContact.id) ||
          (msg.to_id === currentUser.id && msg.from_id === selectedContact.id)
      )
    : [];

  const handleSend = () => {
    if (selectedContact && messageText.trim()) {
      onSendMessage({
        from_id: currentUser.id,
        from_role: currentUser.role,
        to_id: selectedContact.id,
        to_role: selectedContact.role,
        content: messageText.trim()
      });
      setMessageText('');
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Lista de contactos */}
      <div className="bg-white shadow rounded p-4 h-[600px] overflow-y-auto md:col-span-1">
        <h2 className="text-lg font-semibold mb-2">Tutores</h2>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
              selectedContact?.id === contact.id ? 'bg-indigo-100' : ''
            }`}
          >
            <div className="font-medium text-sm">{contact.name}</div>
            <div className="text-xs text-gray-500">{contact.email}</div>
            {contact.studentName && (
              <div className="text-xs text-gray-400 mt-1">
                Alumno: {contact.studentName}
              </div>
            )}
            {contact.groupName && (
              <div className="text-xs text-gray-400">
                Grupo: {contact.groupName}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Panel de mensajes */}
      <div className="bg-white shadow rounded p-4 flex flex-col md:col-span-2 h-[600px]">
        {selectedContact ? (
          <>
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">
                Conversación con {selectedContact.name}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${
                    msg.from_id === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-xs text-sm ${
                      msg.from_id === currentUser.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-[10px] mt-1 text-right flex items-center gap-1 text-gray-300">
                      <Clock className="w-3 h-3 inline" />
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribí un mensaje"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center"
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 mt-20 text-center">
            Seleccioná un tutor para comenzar a chatear.
          </div>
        )}
      </div>
    </div>
  );
}
