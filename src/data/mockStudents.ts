export const mockStudents = [
  {
    id: 1,
    firstName: 'Lucas',
    lastName: 'Martínez',
    birthDate: '2012-05-15',
    dni: '78901234',
    tutorId: 1, // María González
    discipline: 'Fútbol',
    groupId: 1, // Nivel Inicial
    medicalRecord: {
      diagnosis: 'Asma leve',
      allergies: ['Polen', 'Ácaros'],
      medications: ['Salbutamol - 2 inhalaciones cada 8 horas'],
      observations: 'Necesita tener el inhalador siempre disponible durante actividades físicas',
      lastUpdate: '2024-03-15',
      volunteerNotes: 'El alumno maneja bien su condición y conoce cuándo usar el inhalador'
    }
  },
  {
    id: 2,
    firstName: 'Ana',
    lastName: 'García',
    birthDate: '2013-08-20',
    dni: '89012345',
    tutorId: 2,
    discipline: 'Arte',
    groupId: 3,
    medicalRecord: {
      diagnosis: 'Sin condiciones médicas',
      allergies: [],
      medications: [],
      observations: 'Sin observaciones particulares',
      lastUpdate: '2024-03-10'
    }
  },
  {
    id: 3,
    firstName: 'Miguel',
    lastName: 'López',
    birthDate: '2012-11-30',
    dni: '90123456',
    tutorId: 1,
    discipline: 'Tenis',
    groupId: 4,
    medicalRecord: {
      diagnosis: 'Alergia estacional',
      allergies: ['Gramíneas'],
      medications: ['Antihistamínico según necesidad'],
      observations: 'Monitorear durante actividades al aire libre',
      lastUpdate: '2024-03-12'
    }
  }
] as const;