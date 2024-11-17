export const mockTutors = [
  {
    id: 1,
    name: 'María González',
    email: 'maria.gonzalez@empate.org',
    phone: '123-456-7890',
    dni: '45678901',
    students: [1], // Reference to student ID
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Juan Pérez',
    email: 'juan.perez@empate.org',
    phone: '123-456-7891',
    dni: '56789012',
    students: [],
    joinDate: '2024-02-01'
  }
] as const;