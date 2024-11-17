export interface Message {
  id: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  role: 'tutor' | 'voluntario';
  studentName?: string;
  groupName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface Student {
  id: number;
  nombre: string;
  voluntario: {
    nombre: string;
    email: string;
  };
}