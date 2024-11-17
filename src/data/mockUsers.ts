export const mockUsers = [
  {
    id: 1,
    email: "admin@empate.org",
    password: "admin123",
    role: "admin",
    name: "Admin Usuario",
    dni: "12345678"
  },
  {
    id: 2,
    email: "voluntario@empate.org",
    password: "voluntario123",
    role: "voluntario",
    name: "Voluntario Usuario",
    dni: "23456789"
  },
  {
    id: 3,
    email: "tutor@empate.org",
    password: "tutor123",
    role: "tutor",
    name: "Tutor Usuario",
    dni: "34567890"
  },
  {
    id: 4,
    email: "maria.gonzalez@empate.org",
    password: "tutor123",
    role: "tutor",
    name: "María González",
    dni: "45678901"
  },
  {
    id: 5,
    email: "juan.perez@empate.org",
    password: "tutor123",
    role: "tutor",
    name: "Juan Pérez",
    dni: "56789012"
  },
  {
    id: 6,
    email: "carlos@empate.org",
    password: "voluntario123",
    role: "voluntario",
    name: "Carlos Rodríguez",
    dni: "67890123"
  }
] as const;