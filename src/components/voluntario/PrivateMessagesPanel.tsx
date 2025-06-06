// src/components/voluntario/PrivateMessagesPanel.tsx

import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  from_id: number;
  from_dni: string;
  from_role: 'tutor' | 'voluntario';
  to_id: number;
  to_dni: string;
  to_role: 'tutor' | 'voluntario';
  content: string;
  timestamp: string;
  is_read: boolean;
}

interface Contact {
  id: number;
  dni: string;
  name: string;
  email: string | null;
  role: 'tutor' | 'voluntario';
  studentName?: string;
  groupName?: string;
}

interface PrivateMessagesPanelProps {
  currentUser: {
    id: number;
    dni: string;
    name: string;
    email: string | null;
    role: 'tutor' | 'voluntario';
  };
  contacts: Contact[];
  messages: Message[];
  onSendMessage: (message: {
    from_id: number;
    from_dni: string;
    from_role: 'tutor' | 'voluntario';
    to_id: number;
    to_dni: string;
    to_role: 'tutor' | 'voluntario';
    content: string;
  }) => void;
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
}: PrivateMessagesPanelProps) {
  const [messageText, setMessageText] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Calcular conteo de mensajes no leídos para cada contacto
  const unreadCounts: Record<number, number> = {};
  contacts.forEach((contact) => {
    const count = messages.filter(
      (msg) =>
        msg.from_dni === contact.dni &&
        msg.from_role === contact.role &&
        msg.to_dni === currentUser.dni &&
        msg.to_role === currentUser.role &&
        !msg.is_read
    ).length;
    unreadCounts[contact.id] = count;
  });

  // ─── Imprimir todos los mensajes crudos cada vez que cambien ─────────────────────
  useEffect(() => {
    console.log('🔍 PrivateMessagesPanel: mensajes crudos recibidos:', messages);
    messages.forEach((msg, i) => {
      console.log(`   • raw msg[${i}]:`, msg);
    });
  }, [messages]);

  // ─── LOG: component mount ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔷 PrivateMessagesPanel mounted');
  }, []);

  // ─── LOG: props change ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔷 PrivateMessagesPanel props updated:', {
      currentUser,
      contacts,
      messages,
      selectedContact
    });
  }, [currentUser, contacts, messages, selectedContact]);

  // ─── Filtrar mensajes usando los DNIs en lugar de los IDs ─────────────────────────────────
  const filteredMessages = selectedContact
    ? messages
        // 1) Descartar mensajes mal formados
        .filter((msg, index) => {
          if (
            msg == null ||
            typeof msg !== 'object' ||
            !('from_dni' in msg) ||
            !('to_dni' in msg) ||
            !('from_role' in msg) ||
            !('to_role' in msg)
          ) {
            console.warn(
              `⚠️ PrivateMessagesPanel: mensaje inesperado en índice ${index}:`,
              msg
            );
            return false;
          }
          return true;
        })
        // 2) Filtrado real por DNI
        .filter((msg) => {
          console.log(
            '   → Filtrando msg.id=', msg.id,
            '\n       from_dni=', msg.from_dni, 'from_role=', msg.from_role,
            '\n       to_dni=', msg.to_dni, 'to_role=', msg.to_role
          );
          console.log(
            '       currentUser.dni=', currentUser.dni, 'currentUser.role=', currentUser.role
          );
          console.log(
            '       selectedContact.dni=', selectedContact.dni, 'selectedContact.role=', selectedContact.role
          );

          const isFromMeToThem =
            msg.from_dni === currentUser.dni &&
            msg.from_role === currentUser.role &&
            msg.to_dni === selectedContact.dni &&
            msg.to_role === selectedContact.role;

          const isFromThemToMe =
            msg.from_dni === selectedContact.dni &&
            msg.from_role === selectedContact.role &&
            msg.to_dni === currentUser.dni &&
            msg.to_role === currentUser.role;

          console.log(
            `       → isFromMeToThem=${isFromMeToThem}, isFromThemToMe=${isFromThemToMe}`
          );
          return isFromMeToThem || isFromThemToMe;
        })
    : [];

  // ─── LOG: mensajes filtrados ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔷 Mensajes filtrados (count):', filteredMessages.length);
    filteredMessages.forEach((msg) => console.log(`   • Mensaje[${msg.id}]:`, msg));
  }, [filteredMessages]);

  // ─── Scroll automático al final cuando cambian mensajes o contacto ─────────────────────────────────
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, selectedContact]);

  const handleSend = () => {
    if (!selectedContact) {
      console.warn('⚠️ PrivateMessagesPanel: No hay contacto seleccionado al enviar.');
      return;
    }
    if (!messageText.trim()) {
      console.warn('⚠️ PrivateMessagesPanel: El mensaje está vacío, no se envía.');
      return;
    }

    const newMsg = {
      from_id: currentUser.id,
      from_dni: currentUser.dni,
      from_role: currentUser.role,
      to_id: selectedContact.id,
      to_dni: selectedContact.dni,
      to_role: selectedContact.role,
      content: messageText.trim()
    };

    console.log('✉️ Enviando mensaje desde PrivateMessagesPanel:', newMsg);
    onSendMessage(newMsg);
    setMessageText('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ─── Sidebar de contactos ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4 h-[600px] overflow-y-auto md:col-span-1">
        <h2 className="text-lg font-semibold mb-2">Tutores</h2>

        {contacts.map((contact) => {
          console.log(`👤 Contact[${contact.id}]:`, contact);
          const unread = unreadCounts[contact.id] || 0;

          return (
            <div
              key={contact.id}
              onClick={() => {
                console.log('➡️ Contacto seleccionado:', contact);
                onSelectContact(contact);
              }}
              className={`
                p-4 cursor-pointer hover:bg-gray-50 rounded-lg flex items-center justify-between
                ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.role === 'tutor' ? 'Tutor' : 'Voluntario'}
                    {contact.studentName && ` - ${contact.studentName}`}
                    {contact.groupName && ` (${contact.groupName})`}
                  </p>
                </div>
              </div>
              {unread > 0 && (
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-xs">
                  {unread}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Panel de mensajes ──────────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4 flex flex-col md:col-span-2 h-[600px]">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedContact.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedContact.role === 'tutor' ? 'Tutor' : 'Voluntario'}
                  {selectedContact.studentName && ` - ${selectedContact.studentName}`}
                  {selectedContact.groupName && ` (${selectedContact.groupName})`}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((msg) => {
                const isOwn =
                  msg.from_dni === currentUser.dni &&
                  msg.from_role === currentUser.role;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div
                        className={`flex items-center mt-1 text-xs ${
                          isOwn ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}></div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona un tutor para comenzar a chatear.
          </div>
        )}
      </div>
    </div>
  );
}
