// src/components/voluntario/PrivateMessagesPanel.tsx

import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  from_id: number;
  from_dni: string;       // <— Agregado
  from_role: 'tutor' | 'voluntario';
  to_id: number;
  to_dni: string;         // <— Agregado
  to_role: 'tutor' | 'voluntario';
  content: string;
  timestamp: string;
  is_read: boolean;
}


interface Contact {
  id: number;             // ID de Auth
  dni: string;
  name: string;
  email: string | null;
  role: 'tutor' | 'voluntario';
  studentName?: string;
  groupName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface PrivateMessagesPanelProps {
  currentUser: {
    id: number;           // ID de Auth
    dni: string;
    name: string;
    email: string | null;
    role: 'tutor' | 'voluntario';
  };
  contacts: Contact[];
  messages: Message[];
  onSendMessage: (message: {
    from_dni: string;
    from_role: 'tutor' | 'voluntario';
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

  // ─── Filtrar mensajes usando los IDs de Auth (from_id / to_id), no DNIs ────────────────────────────
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
    filteredMessages.forEach((msg) =>
      console.log(`   • Mensaje[${msg.id}]:`, msg)
    );
  }, [filteredMessages]);

  // ─── Scroll automático al final ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

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
      from_dni: currentUser.dni,
      from_role: currentUser.role,
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

        {/* ─── LOG: listando contactos ──────────────────────────────────────────────────────────────────── */}
        {contacts.map((contact) => {
          console.log(`👤 Contact[${contact.id}]:`, contact);

          return (
            <div
              key={contact.id}
              onClick={() => {
                console.log('➡️ Contacto seleccionado:', contact);
                onSelectContact(contact);
              }}
              className={`
                p-2 rounded cursor-pointer hover:bg-gray-100
                ${selectedContact?.id === contact.id
                  ? 'bg-indigo-100'
                  : ''
                }
              `}
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
          );
        })}
      </div>

      {/* ─── Panel de mensajes ──────────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4 flex flex-col md:col-span-2 h-[600px]">
        {selectedContact ? (
          <>
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold">
                Conversación con {selectedContact.name}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {filteredMessages.map((msg) => {
                console.log(`🔹 Renderizando mensaje[${msg.id}]:`, msg);
                return (
                  <div
                    key={msg.id}
                    className={`
    mb-2 flex
    ${msg.from_dni === currentUser.dni ? 'justify-end' : 'justify-start'}
  `}
                  >
                    <div
                      className={`
      rounded-lg px-3 py-2 max-w-xs text-sm
      ${msg.from_dni === currentUser.dni
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                        }
    `}
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

                );
              })}
              <div ref={bottomRef}></div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => {
                  console.log('✏️ Cambió messageText:', e.target.value);
                  setMessageText(e.target.value);
                }}
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
