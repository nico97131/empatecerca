export const mockGroups = [
  {
    id: 1,
    name: 'Nivel Inicial',
    discipline: 'Fútbol',
    schedule: 'Lunes y Miércoles 15:00-17:00',
    maxMembers: 15,
    currentMembers: 10,
    location: 'Campo Principal',
    volunteerInCharge: 2 // ID de Carlos Rodríguez
  },
  {
    id: 2,
    name: 'Nivel Avanzado',
    discipline: 'Fútbol',
    schedule: 'Martes y Jueves 15:00-17:00',
    maxMembers: 15,
    currentMembers: 8,
    location: 'Campo Principal'
  },
  {
    id: 3,
    name: 'Nivel Inicial',
    discipline: 'Arte',
    schedule: 'Lunes y Miércoles 14:00-16:00',
    maxMembers: 12,
    currentMembers: 6,
    location: 'Sala de Arte'
  },
  {
    id: 4,
    name: 'Nivel Inicial',
    discipline: 'Tenis',
    schedule: 'Martes y Jueves 16:00-18:00',
    maxMembers: 8,
    currentMembers: 4,
    location: 'Cancha de Tenis'
  }
] as const;