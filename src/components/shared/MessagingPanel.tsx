import { useState, useEffect } from 'react';
import { Send, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
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
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
}

export default function MessagingPanel({ currentUser, contacts, messages, onSendMessage }: MessagingPanelProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.studentName && contact.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentChat = selectedContact
    ? messages.filter(msg =>
        (msg.from === currentUser.email && msg.to === selectedContact.email) ||
        (msg.from === selectedContact.email && msg.to === currentUser.email)
      )
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedContact) {
      onSendMessage({
        from: currentUser.email,
        to: selectedContact.email,
        content: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      {/* Contacts Sidebar */}
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
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.role === 'tutor' ? 'Tutor' : 'Voluntario'}
                    {contact.studentName && ` - ${contact.studentName}`}
                    {contact.groupName && ` (${contact.groupName})`}
                  </p>
                  {contact.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {contact.lastMessage}
                    </p>
                  )}
                </div>
                {contact.unreadCount && contact.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-600 text-white text-xs">
                      {contact.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
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
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChat.map((message) => {
                const isOwn = message.from === currentUser.email;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center mt-1 text-xs ${
                        isOwn ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}