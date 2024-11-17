import { useState } from 'react';
import SharedMessagingPanel from '../shared/MessagingPanel';
import type { Message, Contact } from '../../types/messaging';

interface MessagingPanelProps {
  grupos: Array<{
    id: number;
    nombre: string;
    alumnos: Array<{
      id: number;
      nombre: string;
      tutor: {
        nombre: string;
        email: string;
      };
    }>;
  }>;
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
}

export default function MessagingPanel({ grupos = [], onSendMessage }: MessagingPanelProps) {
  // Convert tutors from all students in all groups into contacts format
  const contacts: Contact[] = grupos.flatMap(grupo => 
    grupo.alumnos.map(alumno => ({
      id: alumno.id,
      name: alumno.tutor.nombre,
      email: alumno.tutor.email,
      role: 'tutor',
      studentName: alumno.nombre,
      groupName: grupo.nombre
    }))
  );

  // Mock messages - in a real app, these would come from a backend
  const [messages] = useState<Message[]>([
    {
      id: 1,
      from: 'voluntario@empate.org',
      to: 'tutor@empate.org',
      content: 'Hola, quisiera comentarte sobre el progreso de Ana',
      timestamp: '2024-03-10 14:30',
      read: true
    }
  ]);

  const currentUser = {
    id: 2,
    name: 'Voluntario Usuario',
    email: 'voluntario@empate.org',
    role: 'voluntario' as const
  };

  return (
    <SharedMessagingPanel
      currentUser={currentUser}
      contacts={contacts}
      messages={messages}
      onSendMessage={onSendMessage}
    />
  );
}