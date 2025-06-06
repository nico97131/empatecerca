// src/components/tutor/MessagingPanel.tsx

import { useState, useEffect, useRef } from 'react'
import { Send, User, Clock } from 'lucide-react'

interface Message {
  id: number
  from_id: number
  from_dni: string
  from_role: 'tutor' | 'voluntario'
  to_id: number
  to_dni: string
  to_role: 'tutor' | 'voluntario'
  content: string
  timestamp: string
  is_read: boolean
}

interface Contact {
  id: number
  dni: string
  name: string
  email: string | null
  role: 'tutor' | 'voluntario'
  studentName?: string
  groupName?: string
}

interface MessagingPanelProps {
  currentUser: {
    id: number
    dni: string
    name: string
    email: string | null
    role: 'tutor' | 'voluntario'
  }
  contacts: Contact[]
  messages: Message[]
  onSendMessage: (message: {
    from_id: number
    from_dni: string
    from_role: 'tutor' | 'voluntario'
    to_id: number
    to_dni: string
    to_role: 'tutor' | 'voluntario'
    content: string
  }) => Promise<any>
  selectedContact: Contact | null
  onSelectContact: (contact: Contact) => void
  loadingContacts: boolean
}

export default function MessagingPanel({
  currentUser,
  contacts,
  messages,
  onSendMessage,
  selectedContact,
  onSelectContact,
  loadingContacts
}: MessagingPanelProps) {
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [localMessages, setLocalMessages] = useState<Message[]>(messages)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  // Mantener sincronizados los mensajes locales
  useEffect(() => {
    setLocalMessages(messages)
  }, [messages])

  // Calcular conteo de mensajes no leídos por contacto
  const unreadCounts: Record<number, number> = {}
  contacts.forEach((contact) => {
    const count = messages.filter(
      (msg) =>
        msg.from_dni === contact.dni &&
        msg.from_role === contact.role &&
        msg.to_dni === currentUser.dni &&
        msg.to_role === currentUser.role &&
        !msg.is_read
    ).length
    unreadCounts[contact.id] = count
  })

  // Marcar mensajes como leídos al cambiar de contacto
  useEffect(() => {
    const marcarComoLeidos = async () => {
      if (!selectedContact || !currentUser) return

      try {
        await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/messages/mark-as-read`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_id: currentUser.id,
              to_role: currentUser.role,
              from_id: selectedContact.id,
              from_role: selectedContact.role
            })
          }
        )
      } catch (err) {
        console.error('❌ Error al marcar como leídos:', err)
      }
    }

    marcarComoLeidos()
  }, [selectedContact, currentUser])

  // Auto-scroll al final de la conversación cuando cambian mensajes o contacto
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [selectedContact, localMessages])

  const filteredContacts = searchTerm.trim()
    ? contacts.filter((contact) => {
        return (
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contact.studentName || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : contacts

  // Filtrar mensajes por DNI
  const getMessagesForChatByDni = (
    msgs: Message[],
    userDni: string,
    userRole: 'tutor' | 'voluntario',
    contactDni: string,
    contactRole: 'tutor' | 'voluntario'
  ): Message[] => {
    return msgs.filter((msg) => {
      const matchFrom =
        msg.from_dni === userDni &&
        msg.from_role === userRole &&
        msg.to_dni === contactDni &&
        msg.to_role === contactRole

      const matchTo =
        msg.from_dni === contactDni &&
        msg.from_role === contactRole &&
        msg.to_dni === userDni &&
        msg.to_role === userRole

      return matchFrom || matchTo
    })
  }

  const currentChat = selectedContact
    ? getMessagesForChatByDni(
        localMessages,
        currentUser.dni,
        currentUser.role,
        selectedContact.dni,
        selectedContact.role
      )
    : []

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact || !currentUser || !newMessage.trim()) return

    const mensajeAEnviar = {
      from_id: currentUser.id,
      from_dni: currentUser.dni,
      from_role: currentUser.role,
      to_id: selectedContact.id,
      to_dni: selectedContact.dni,
      to_role: selectedContact.role,
      content: newMessage.trim()
    }

    try {
      await onSendMessage(mensajeAEnviar)
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err)
    }

    setNewMessage('')
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar contactos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto h-[calc(600px-73px)]">
          {loadingContacts ? (
            <div className="p-4 text-sm text-gray-500 italic">
              Cargando contactos...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 italic">
              No hay contactos disponibles.
            </div>
          ) : null}

          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-4 cursor-pointer hover:bg-gray-50 rounded-lg flex items-center justify-between ${
                selectedContact?.id === contact.id ? 'bg-indigo-50' : ''
              }`}
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
              {unreadCounts[contact.id] > 0 && (
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-xs">
                  {unreadCounts[contact.id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
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

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {currentChat.map((message) => {
                // Comparar DNIs para saber si es mensaje propio
                const isOwn =
                  message.from_dni === currentUser.dni &&
                  message.from_role === currentUser.role

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center mt-1 text-xs ${
                          isOwn ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona un contacto para comenzar a chatear
          </div>
        )}
      </div>
    </div>
  )
}
