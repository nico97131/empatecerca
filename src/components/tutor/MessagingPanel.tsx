import { useState } from 'react';
import SharedMessagingPanel from '../shared/MessagingPanel';
import type { Message, Student } from '../../types/messaging';

interface MessagingPanelProps {
  students?: Student[];
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  onRateVolunteer?: (studentId: number, rating: number) => void;
}

export default function MessagingPanel({ students = [], onSendMessage }: MessagingPanelProps) {
  // Convert volunteers from students into contacts format
  const contacts = students.map(student => ({
    id: student.id,
    name: student.voluntario.nombre,
    email: student.voluntario.email,
    role: 'voluntario' as const,
    studentName: student.nombre
  }));

  // Mock messages - in a real app, these would come from a backend
  const [messages] = useState<Message[]>([
    {
      id: 1,
      from: 'tutor@empate.org',
      to: 'voluntario@empate.org',
      content: '¿Cómo va el progreso de Ana en matemáticas?',
      timestamp: '2024-03-10 14:30',
      read: true
    },
    {
      id: 2,
      from: 'voluntario@empate.org',
      to: 'tutor@empate.org',
      content: 'Ana está mejorando mucho, especialmente en álgebra.',
      timestamp: '2024-03-10 14:35',
      read: true
    }
  ]);

  const currentUser = {
    id: 1,
    name: 'Tutor Usuario',
    email: 'tutor@empate.org',
    role: 'tutor' as const
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