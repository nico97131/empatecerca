export const mockVolunteers = [
  {
    id: 1,
    name: 'María García',
    email: 'voluntario@empate.org',
    phone: '123-456-7890',
    dni: '89012345',
    specialization: 'Deportes',
    availability: ['Lunes 15:00-17:00', 'Miércoles 15:00-17:00'],
    activeGroups: 1,
    joinDate: '2024-01-15',
    status: 'active',
    assignedGroups: []
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    email: 'carlos@empate.org',
    phone: '123-456-7891',
    dni: '90123456',
    specialization: 'Deportes',
    availability: ['Lunes 15:00-17:00', 'Miércoles 15:00-17:00'],
    activeGroups: 1,
    joinDate: '2024-02-01',
    status: 'active',
    assignedGroups: [1] // Asignado al grupo Nivel Inicial de Fútbol
  },
  {
    id: 3,
    name: 'Ana López',
    email: 'ana@empate.org',
    phone: '123-456-7892',
    dni: '01234567',
    specialization: 'Tenis',
    availability: ['Viernes 16:00-18:00'],
    activeGroups: 1,
    joinDate: '2024-02-15',
    status: 'active',
    assignedGroups: []
  },
  {
    id: 4,
    name: 'Pedro Sánchez',
    email: 'pedro@empate.org',
    phone: '123-456-7893',
    dni: '12345678',
    specialization: 'Arte',
    availability: ['Martes 14:00-16:00', 'Jueves 14:00-16:00'],
    activeGroups: 1,
    joinDate: '2024-02-20',
    status: 'active',
    assignedGroups: [3]
  },
  {
    id: 5,
    name: 'Laura Martínez',
    email: 'laura@empate.org',
    phone: '123-456-7894',
    dni: '23456789',
    specialization: 'Deportes',
    availability: ['Lunes 16:00-18:00', 'Miércoles 16:00-18:00'],
    activeGroups: 0,
    joinDate: '2024-03-01',
    status: 'inactive',
    inactiveReason: 'psicotecnico',
    assignedGroups: []
  }
] as const;